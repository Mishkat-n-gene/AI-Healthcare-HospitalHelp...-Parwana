import type { Desert, Facility, ReasoningStep, TrustScore } from '@/lib/types'

type AgentOutput = {
  run_id: string
  facilities: Facility[]
  trust_scores: TrustScore[]
  reasoning_chain: ReasoningStep[]
  medical_deserts: Desert[]
  raw_output?: string
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function extractJsonObject(text: string) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

export function normalizeAgentOutput(raw: string | null | undefined, run_id: string): AgentOutput {
  if (!raw) {
    return { run_id, facilities: [], trust_scores: [], reasoning_chain: [], medical_deserts: [] }
  }

  let payload = tryParseJson(raw)
  if (!payload) {
    const extracted = extractJsonObject(raw)
    if (extracted) payload = tryParseJson(extracted)
  }

  if (!payload || typeof payload !== 'object') {
    return {
      run_id,
      facilities: [],
      trust_scores: [],
      reasoning_chain: [],
      medical_deserts: [],
      raw_output: raw
    }
  }

  const obj = payload as any
  return {
    run_id: String(obj.run_id ?? run_id),
    facilities: Array.isArray(obj.facilities) ? obj.facilities : [],
    trust_scores: Array.isArray(obj.trust_scores) ? obj.trust_scores : [],
    reasoning_chain: Array.isArray(obj.reasoning_chain) ? obj.reasoning_chain : [],
    medical_deserts: Array.isArray(obj.medical_deserts) ? obj.medical_deserts : [],
    raw_output: typeof obj.raw_output === 'string' ? obj.raw_output : undefined
  }
}
