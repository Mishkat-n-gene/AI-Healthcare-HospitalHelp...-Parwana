import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { MOCK_TRACES } from '@/lib/mock-data'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET(_: Request, ctx: { params: { run_id: string } }) {
  const run_id = ctx.params.run_id
  if (!run_id) return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Missing run_id' })

  if (isMockMode()) {
    const trace = MOCK_TRACES.find((t) => t.run_id === run_id) ?? MOCK_TRACES[0]!
    return jsonOk(trace, { cacheControl: 'public, s-maxage=60, stale-while-revalidate=30' })
  }

  try {
    const client = new DatabricksClient()
    const trace = await client.getMLflowTrace(run_id)
    return jsonOk(trace, { cacheControl: 'public, s-maxage=60, stale-while-revalidate=30' })
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

