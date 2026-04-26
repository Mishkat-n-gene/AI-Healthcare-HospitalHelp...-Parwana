import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { MOCK_SUMMARY_STATS } from '@/lib/mock-data'

export const runtime = 'nodejs'

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET() {
  if (isMockMode()) {
    return jsonOk(MOCK_SUMMARY_STATS, { cacheControl: 'public, s-maxage=300, stale-while-revalidate=60' })
  }

  try {
    const client = new DatabricksClient()
    const stats = await client.getSummaryStats()
    return jsonOk(stats, { cacheControl: 'public, s-maxage=300, stale-while-revalidate=60' })
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

