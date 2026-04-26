'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Desert, Facility, ReasoningStep, TrustScore } from '@/lib/types'
import { useAppStore } from '@/lib/store'

type AgentResult = {
  facilities: Facility[]
  trust_scores: TrustScore[]
  reasoning_chain: ReasoningStep[]
  medical_deserts: Desert[]
  run_id: string
}

export function useAgentQuery() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [progress, setProgress] = useState(0)
  const [state, setState] = useState<'IDLE' | 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'>('IDLE')
  const [result, setResult] = useState<AgentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runId = useAppStore((s) => s.activeRunId)
  const setRunId = useAppStore((s) => s.setActiveRunId)

  const startTs = useRef<number | null>(null)
  const fetchingResult = useRef(false)

  const steps = useMemo(
    () => [
      { id: 1, label: 'Extractor Agent', hint: 'Parsing 10,000 facility records...' },
      { id: 2, label: 'Validator Agent', hint: 'Cross-referencing medical standards...' },
      { id: 3, label: 'Trust Scorer', hint: 'Computing confidence scores...' },
      { id: 4, label: 'Mapper Agent', hint: 'Plotting results to geography...' }
    ],
    []
  )

  const trigger = useCallback(
    async (query: string, filters?: Record<string, unknown>) => {
      setError(null)
      setResult(null)
      setIsRunning(true)
      setProgress(5)
      setState('PENDING')
      startTs.current = Date.now()
      fetchingResult.current = false
      setElapsedMs(0)

      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setIsRunning(false)
        setState('FAILED')
        setError(json?.error?.message ?? 'Agent query failed')
        return null
      }

      // If API returns full payload, we are done.
      if (json?.facilities && json?.trust_scores && json?.reasoning_chain && json?.medical_deserts && json?.run_id) {
        setRunId(json.run_id)
        setResult(json as AgentResult)
        setIsRunning(false)
        setProgress(100)
        setState('SUCCEEDED')
        return json as AgentResult
      }

      // Otherwise treat it as run_id-only.
      if (json?.run_id) {
        setRunId(json.run_id)
        return json
      }

      setIsRunning(false)
      setState('FAILED')
      setError('Unexpected agent response')
      return null
    },
    [setRunId]
  )

  useEffect(() => {
    if (!isRunning || !startTs.current) return
    const t = setInterval(() => setElapsedMs(Date.now() - (startTs.current ?? Date.now())), 250)
    return () => clearInterval(t)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning || !runId) return
    let cancelled = false
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/status/${encodeURIComponent(runId)}`)
        const json = await res.json()
        if (!res.ok) return
        if (cancelled) return
        setState(json.state)
        setProgress(json.progress ?? 0)
        if (json.state === 'SUCCEEDED') {
          if (!fetchingResult.current && !result) {
            fetchingResult.current = true
            const resultRes = await fetch(`/api/agent/result/${encodeURIComponent(runId)}`)
            const resultJson = await resultRes.json().catch(() => null)
            if (!cancelled && resultRes.ok) {
              setResult(resultJson as AgentResult)
              setProgress(100)
              setState('SUCCEEDED')
            }
            if (!cancelled && !resultRes.ok) {
              setError(resultJson?.error?.message ?? 'Failed to load agent result')
            }
            fetchingResult.current = false
          }
          if (!cancelled) setIsRunning(false)
          clearInterval(t)
          return
        }
        if (json.state === 'FAILED') {
          if (!cancelled) {
            setIsRunning(false)
            setState('FAILED')
          }
          clearInterval(t)
        }
      } catch {
        // ignore transient polling errors
      }
    }, 2000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [isRunning, runId, result])

  return { trigger, isRunning, elapsedMs, progress, state, steps, result, error, runId }
}

