import { z } from 'zod'

import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { normalizeAgentOutput } from '@/lib/agent-output'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'
import { MOCK_AGENT_QUERY_RESPONSE } from '@/lib/mock-data'

export const runtime = 'nodejs'

const BodySchema = z.object({
  query: z.string().min(1).max(800),
  filters: z
    .object({
      state: z.string().min(1).max(100).optional(),
      district: z.string().min(1).max(100).optional(),
      pincode: z.string().regex(/^\d{6}$/).optional(),
      capability: z.string().min(1).max(80).optional()
    })
    .partial()
    .optional()
})

function getIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

async function pollUntilDone(client: DatabricksClient, run_id: string, maxMs = 10 * 60_000) {
  const started = Date.now()
  while (Date.now() - started < maxMs) {
    const status = await client.pollJobStatus(run_id)
    if (status.state === 'SUCCEEDED' || status.state === 'FAILED') return status
    await new Promise((r) => setTimeout(r, 2000))
  }
  throw new DatabricksError({ code: 'TIMEOUT', message: 'Job polling timed out', retryable: true })
}

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function POST(req: Request) {
  const ip = getIp(req)
  const rl = rateLimit({ key: `agent_query:${ip}`, limit: 10, windowMs: 60_000 })
  if (!rl.ok) {
    return jsonError({
      status: 429,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Max 10 per minute per IP.',
      retryable: true,
      details: { reset_ms: rl.resetMs }
    })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError({ status: 400, code: 'BAD_JSON', message: 'Invalid JSON body' })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Invalid query payload', details: parsed.error.flatten() })
  }

  if (isMockMode()) {
    return jsonOk(MOCK_AGENT_QUERY_RESPONSE())
  }

  try {
    const client = new DatabricksClient()
    const { run_id } = await client.triggerJob({ query: parsed.data.query, filters: parsed.data.filters })
    const finalStatus = await pollUntilDone(client, run_id)
    if (finalStatus.state !== 'SUCCEEDED') {
      return jsonError({
        status: 502,
        code: 'JOB_FAILED',
        message: 'Databricks job failed',
        retryable: false,
        details: finalStatus
      })
    }

    // Try to read job output (notebook_output.result) for the contract payload.
    const host = process.env.DATABRICKS_HOST?.replace(/\/$/, '')
    const token = process.env.DATABRICKS_TOKEN
    if (!host || !token) {
      return jsonError({ status: 500, code: 'CONFIG_ERROR', message: 'Missing Databricks env vars', retryable: false })
    }

    const outRes = await fetch(`${host}/api/2.1/jobs/runs/get-output?run_id=${encodeURIComponent(run_id)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!outRes.ok) {
      return jsonError({
        status: 502,
        code: 'OUTPUT_FETCH_FAILED',
        message: `Failed to fetch job output (${outRes.status})`,
        retryable: true
      })
    }

    const outJson: any = await outRes.json()
    const raw = outJson?.notebook_output?.result
    return jsonOk(normalizeAgentOutput(raw, run_id))
  } catch (e) {
    if (e instanceof DatabricksError) {
      return jsonError({
        status: e.status ?? 502,
        code: e.code,
        message: e.message,
        retryable: e.retryable,
        details: e.details
      })
    }
    return jsonError({ status: 500, code: 'UNKNOWN', message: 'Unexpected server error' })
  }
}

