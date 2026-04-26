import { z } from 'zod'

import { DatabricksClient, DatabricksError } from '@/lib/databricks'
import { jsonError, jsonOk } from '@/lib/api-response'
import { isMockMode } from '@/lib/env'
import { MOCK_FACILITIES } from '@/lib/mock-data'

export const runtime = 'nodejs'

const QuerySchema = z.object({
  state: z.string().min(1).max(100).optional(),
  district: z.string().min(1).max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  capability: z.string().min(1).max(80).optional(),
  min_trust_score: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).max(500).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional()
})

export async function OPTIONS() {
  return jsonOk({ ok: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const raw = Object.fromEntries(searchParams.entries())
  const parsed = QuerySchema.safeParse(raw)
  if (!parsed.success) {
    return jsonError({ status: 400, code: 'INVALID_INPUT', message: 'Invalid query params', details: parsed.error.flatten() })
  }

  const page = parsed.data.page ?? 1
  const page_size = parsed.data.page_size ?? 50

  if (isMockMode()) {
    const filtered = MOCK_FACILITIES.filter((f) => {
      if (parsed.data.state && f.state.toLowerCase() !== parsed.data.state.toLowerCase()) return false
      if (parsed.data.district && f.district.toLowerCase() !== parsed.data.district.toLowerCase()) return false
      if (parsed.data.pincode && f.pincode !== parsed.data.pincode) return false
      if (parsed.data.capability && !f.capabilities.includes(parsed.data.capability as any)) return false
      if (parsed.data.min_trust_score != null && f.trust_score < parsed.data.min_trust_score) return false
      return true
    })
    const start = (page - 1) * page_size
    const items = filtered.slice(start, start + page_size)
    return jsonOk(
      { items, page, page_size, total: filtered.length },
      { cacheControl: 'public, s-maxage=120, stale-while-revalidate=60' }
    )
  }

  try {
    const client = new DatabricksClient()

    const where: string[] = []
    if (parsed.data.state) where.push(`LOWER(state) = LOWER('${parsed.data.state.replace(/'/g, "''")}')`)
    if (parsed.data.district) where.push(`LOWER(district) = LOWER('${parsed.data.district.replace(/'/g, "''")}')`)
    if (parsed.data.pincode) where.push(`pincode = '${parsed.data.pincode.replace(/'/g, "''")}'`)
    if (parsed.data.min_trust_score != null) where.push(`trust_score >= ${Number(parsed.data.min_trust_score)}`)
    if (parsed.data.capability) where.push(`array_contains(capabilities, '${parsed.data.capability.replace(/'/g, "''")}')`)
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const offset = (page - 1) * page_size
    const sql = `SELECT * FROM healthcare_intelligence.facilities ${whereSql} LIMIT ${page_size} OFFSET ${offset}`
    const countSql = `SELECT COUNT(*) as total FROM healthcare_intelligence.facilities ${whereSql}`

    const [rowsRes, countRes] = await Promise.all([client.querySQL(sql), client.querySQL(countSql)])
    const items = ((rowsRes as any)?.result?.data_array ?? []) as any[]
    const totalRow = (countRes as any)?.result?.data_array?.[0]
    const total = totalRow?.total ?? totalRow?.[0] ?? 0

    return jsonOk(
      { items, page, page_size, total: Number(total) },
      { cacheControl: 'public, s-maxage=120, stale-while-revalidate=60' }
    )
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

