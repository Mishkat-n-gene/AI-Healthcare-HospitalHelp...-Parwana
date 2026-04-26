import 'server-only'

import type { Desert, Facility, MLflowTrace, SummaryStats } from '@/lib/types'

export type DatabricksErrorCode =
  | 'CONFIG_ERROR'
  | 'HTTP_ERROR'
  | 'DATABRICKS_ERROR'
  | 'TIMEOUT'
  | 'VALIDATION_ERROR'

export class DatabricksError extends Error {
  code: DatabricksErrorCode
  status?: number
  retryable: boolean
  details?: unknown

  constructor(args: { code: DatabricksErrorCode; message: string; status?: number; retryable: boolean; details?: unknown }) {
    super(args.message)
    this.name = 'DatabricksError'
    this.code = args.code
    this.status = args.status
    this.retryable = args.retryable
    this.details = args.details
  }
}

export interface JobParams {
  query: string
  filters?: {
    state?: string
    district?: string
    pincode?: string
    capability?: string
  }
}

export type JobRunState = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'

export interface JobStatus {
  state: JobRunState
  progress: number
  lifecycle_state?: string
  result_state?: string
  state_message?: string
}

export interface QueryResult {
  statement_id: string
  status: string
  rows?: unknown[]
  manifest?: unknown
  error?: unknown
}

type FetcherInit = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> }

function getEnv(name: string) {
  const v = process.env[name]
  if (!v) {
    throw new DatabricksError({
      code: 'CONFIG_ERROR',
      message: `Missing env var: ${name}`,
      retryable: false
    })
  }
  return v
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function shouldRetry(status: number) {
  return status >= 500 && status <= 599
}

function withTimeout(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
    }
  }
}

async function fetchJsonWithRetry(url: string, init: FetcherInit & { timeout_ms?: number }, attempts = 3) {
  const timeout_ms = init.timeout_ms ?? 30_000
  let lastErr: unknown

  for (let i = 0; i < attempts; i++) {
    const backoff = 300 * 2 ** i + Math.floor(Math.random() * 150)
    const started = Date.now()
    const timeout = withTimeout(undefined, timeout_ms)
    try {
      const res = await fetch(url, {
        ...init,
        signal: timeout.signal,
        headers: init.headers
      })

      const duration_ms = Date.now() - started
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[databricks] ${init.method ?? 'GET'} ${url} (${res.status}) ${duration_ms}ms`)
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const retryable = shouldRetry(res.status)
        const err = new DatabricksError({
          code: 'HTTP_ERROR',
          message: `Databricks HTTP ${res.status}`,
          status: res.status,
          retryable,
          details: text
        })
        if (retryable && i < attempts - 1) {
          await sleep(backoff)
          continue
        }
        throw err
      }

      const json = (await res.json().catch(async () => ({ raw: await res.text() }))) as unknown
      return json
    } catch (e) {
      lastErr = e
      const isAbort = e instanceof DOMException && e.name === 'AbortError'
      if (isAbort) {
        if (i < attempts - 1) {
          await sleep(backoff)
          continue
        }
        throw new DatabricksError({ code: 'TIMEOUT', message: `Request timed out after ${timeout_ms}ms`, retryable: true })
      }
      if (e instanceof DatabricksError) {
        throw e
      }
      if (i < attempts - 1) {
        await sleep(backoff)
        continue
      }
      throw new DatabricksError({
        code: 'DATABRICKS_ERROR',
        message: 'Unknown Databricks client error',
        retryable: true,
        details: String(lastErr)
      })
    } finally {
      timeout.cleanup()
    }
  }
  throw lastErr
}

export class DatabricksClient {
  private host: string
  private token: string
  private jobId: string
  private warehouseId: string

  constructor() {
    this.host = getEnv('DATABRICKS_HOST').replace(/\/$/, '')
    this.token = getEnv('DATABRICKS_TOKEN')
    this.jobId = getEnv('DATABRICKS_JOB_ID')
    this.warehouseId = getEnv('DATABRICKS_WAREHOUSE_ID')
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }
  }

  async triggerJob(params: JobParams): Promise<{ run_id: string }> {
    const url = `${this.host}/api/2.1/jobs/run-now`
    const body = {
      job_id: this.jobId,
      notebook_params: {
        query: params.query,
        filters: params.filters ? JSON.stringify(params.filters) : undefined
      }
    }
    const json = (await fetchJsonWithRetry(
      url,
      { method: 'POST', headers: this.headers(), body: JSON.stringify(body), timeout_ms: 30_000 },
      3
    )) as { run_id?: number | string }
    if (!json.run_id) {
      throw new DatabricksError({ code: 'DATABRICKS_ERROR', message: 'Missing run_id from Databricks', retryable: false, details: json })
    }
    return { run_id: String(json.run_id) }
  }

  async pollJobStatus(run_id: string): Promise<JobStatus> {
    const url = `${this.host}/api/2.1/jobs/runs/get?run_id=${encodeURIComponent(run_id)}`
    const json = (await fetchJsonWithRetry(url, { method: 'GET', headers: this.headers(), timeout_ms: 30_000 }, 3)) as any

    const lifecycle_state = json?.state?.life_cycle_state as string | undefined
    const result_state = json?.state?.result_state as string | undefined
    const state_message = json?.state?.state_message as string | undefined

    const state: JobRunState =
      lifecycle_state === 'PENDING' || lifecycle_state === 'QUEUED'
        ? 'PENDING'
        : lifecycle_state === 'RUNNING'
          ? 'RUNNING'
          : result_state === 'SUCCESS'
            ? 'SUCCEEDED'
            : lifecycle_state === 'TERMINATED' || result_state === 'FAILED'
              ? 'FAILED'
              : 'RUNNING'

    const progress = state === 'PENDING' ? 10 : state === 'RUNNING' ? 55 : state === 'SUCCEEDED' ? 100 : 100
    return { state, progress, lifecycle_state, result_state, state_message }
  }

  async querySQL(sql: string): Promise<QueryResult> {
    const url = `${this.host}/api/2.0/sql/statements`
    const body = {
      warehouse_id: this.warehouseId,
      statement: sql,
      disposition: 'INLINE'
    }
    return (await fetchJsonWithRetry(url, { method: 'POST', headers: this.headers(), body: JSON.stringify(body), timeout_ms: 45_000 }, 3)) as QueryResult
  }

  async getMLflowTrace(run_id: string): Promise<MLflowTrace> {
    const url = `${this.host}/api/2.0/mlflow/runs/get?run_id=${encodeURIComponent(run_id)}`
    const json = (await fetchJsonWithRetry(url, { method: 'GET', headers: this.headers(), timeout_ms: 30_000 }, 3)) as any

    // NOTE: Contract: backend exposes reasoning steps; frontend only displays them.
    // Here we just shape the response defensively without inventing fields.
    const data = json?.run?.data ?? {}
    const tags = (data?.tags ?? []) as Array<{ key: string; value: string }>
    const agent_version = tags.find((t) => t.key === 'agent_version')?.value ?? 'unknown'
    const stepsRaw = tags.find((t) => t.key === 'reasoning_chain')?.value
    const total_duration_ms = Number(tags.find((t) => t.key === 'total_duration_ms')?.value ?? 0)

    let steps: any[] = []
    if (stepsRaw) {
      try {
        steps = JSON.parse(stepsRaw)
      } catch {
        steps = []
      }
    }

    return {
      run_id,
      agent_version,
      total_duration_ms,
      steps: Array.isArray(steps) ? steps : []
    } as MLflowTrace
  }

  async getFacilityById(id: string): Promise<Facility> {
    const sql = `SELECT * FROM healthcare_intelligence.facilities WHERE id = '${id.replace(/'/g, "''")}' LIMIT 1`
    const res = await this.querySQL(sql)
    const row = (res as any)?.result?.data_array?.[0]
    if (!row) {
      throw new DatabricksError({ code: 'HTTP_ERROR', message: 'Facility not found', status: 404, retryable: false })
    }
    return row as Facility
  }

  async getDeserts(): Promise<Desert[]> {
    const sql = `SELECT * FROM healthcare_intelligence.medical_deserts`
    const res = await this.querySQL(sql)
    const rows = (res as any)?.result?.data_array ?? []
    return rows as Desert[]
  }

  async getSummaryStats(): Promise<SummaryStats> {
    const sql = `SELECT
      COUNT(*) AS total_facilities,
      AVG(trust_score) AS avg_trust_score,
      SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) AS critical_desert_zones,
      SUM(CASE WHEN has_icu = true AND trust_label = 'Verified' THEN 1 ELSE 0 END) AS verified_icus
    FROM healthcare_intelligence.facilities`
    const res = await this.querySQL(sql)
    const row = (res as any)?.result?.data_array?.[0]
    if (!row) {
      throw new DatabricksError({ code: 'DATABRICKS_ERROR', message: 'Empty summary result', retryable: false, details: res })
    }
    return row as SummaryStats
  }
}

