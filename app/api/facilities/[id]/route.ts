import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { MOCK_FACILITIES, MOCK_TRACES } from '@/lib/mock-data'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id
  if (!id) return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Missing id' })

  if (isMockMode()) {
    const facility = MOCK_FACILITIES.find((f) => f.id === id)
    if (!facility) return jsonError({ status: 404, code: 'NOT_FOUND', message: 'Facility not found' })
    return jsonOk({ facility, evidence: [], mlflow_trace: MOCK_TRACES[0]! })
  }

  try {
    const client = new DatabricksClient()
    const facility = await client.getFacilityById(id)
    const mlflow_trace = await client.getMLflowTrace(String((facility as any).run_id ?? ''))
    return jsonOk({ facility, evidence: [], mlflow_trace })
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

