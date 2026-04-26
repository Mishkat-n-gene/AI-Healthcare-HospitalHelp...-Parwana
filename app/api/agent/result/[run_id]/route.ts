import { DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { MOCK_AGENT_QUERY_RESPONSE } from '@/lib/mock-data'
import { normalizeAgentOutput } from '@/lib/agent-output'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET(_: Request, ctx: { params: { run_id: string } }) {
  const run_id = ctx.params.run_id
  if (!run_id) return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Missing run_id' })

  if (isMockMode()) {
    return jsonOk(MOCK_AGENT_QUERY_RESPONSE(run_id))
  }

  try {
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
