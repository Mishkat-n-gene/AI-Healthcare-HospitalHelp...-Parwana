import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET(_: Request, ctx: { params: { run_id: string } }) {
  const run_id = ctx.params.run_id
  if (!run_id) return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Missing run_id' })

  if (isMockMode()) {
    return jsonOk({ state: 'SUCCEEDED' as const, progress: 100 })
  }

  try {
    const client = new DatabricksClient()
    const status = await client.pollJobStatus(run_id)
    return jsonOk({ state: status.state, progress: status.progress })
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

