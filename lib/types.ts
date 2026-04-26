export type Capability =
  | 'ICU'
  | 'Emergency Trauma'
  | 'Oncology'
  | 'Dialysis'
  | 'Neonatal Care'
  | 'General Surgery'
  | 'Blood Bank'
  | 'Ambulance'
  | 'Pharmacy'

export interface Facility {
  id: string
  name: string
  pincode: string
  district: string
  state: string
  lat: number
  lng: number
  type: 'Government' | 'Private' | 'NGO' | 'Trust'
  capabilities: Capability[]
  trust_score: number
  trust_label: 'Verified' | 'Suspicious' | 'Incomplete' | 'Contradictory'
  has_icu: boolean
  has_emergency: boolean
  specialists: string[]
  equipment: string[]
  availability: '24/7' | 'Limited' | 'Unknown'
  raw_notes: string
  flags: string[]
  last_verified: string
}

export interface TrustScore {
  facility_id: string
  score: number
  breakdown: {
    equipment_consistency: number
    staff_claims_verified: number
    availability_plausibility: number
    data_completeness: number
  }
  red_flags: string[]
  supporting_evidence: string[]
}

export interface ReasoningStep {
  step: number
  agent: 'Extractor' | 'Validator' | 'Scorer' | 'Mapper'
  action: string
  input: string
  output: string
  confidence: number
  duration_ms: number
}

export interface Desert {
  pincode: string
  district: string
  state: string
  lat: number
  lng: number
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low'
  missing_capabilities: string[]
  nearest_facility_km: number
  population_affected: number
}

export interface Evidence {
  facility_id: string
  field: string
  raw_sentence: string
  extracted_value: string
  confidence: number
}

export interface MLflowTrace {
  run_id: string
  steps: ReasoningStep[]
  total_duration_ms: number
  agent_version: string
}

export interface SummaryStats {
  total_facilities: number
  avg_trust_score: number
  critical_desert_zones: number
  verified_icus: number
}

