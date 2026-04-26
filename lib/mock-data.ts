import type {
  Capability,
  Desert,
  Facility,
  MLflowTrace,
  ReasoningStep,
  SummaryStats,
  TrustScore
} from '@/lib/types'

// MOCK: realistic but synthetic local dev dataset (IS_MOCK_MODE=true)

const STATES = [
  'Bihar',
  'Uttar Pradesh',
  'Rajasthan',
  'Odisha',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Madhya Pradesh',
  'Assam'
] as const

const DISTRICTS: Record<(typeof STATES)[number], string[]> = {
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Darbhanga'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Varanasi', 'Gorakhpur'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Sambalpur', 'Ganjam'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  Karnataka: ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dharwad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  Assam: ['Guwahati', 'Dibrugarh', 'Silchar', 'Tezpur']
}

const CAPABILITIES: Capability[] = [
  'ICU',
  'Emergency Trauma',
  'Oncology',
  'Dialysis',
  'Neonatal Care',
  'General Surgery',
  'Blood Bank',
  'Ambulance',
  'Pharmacy'
]

const SPECIALISTS = [
  'Anesthesiologist',
  'Cardiologist',
  'General Surgeon',
  'Obstetrician',
  'Pediatrician',
  'Radiologist',
  'Nephrologist',
  'Oncologist',
  'Emergency Physician'
]

const EQUIPMENT = [
  'Ventilator',
  'Defibrillator',
  'CT Scanner',
  'MRI',
  'Dialysis Machine',
  'X-Ray',
  'Ultrasound',
  'ECG',
  'Oxygen Concentrator'
]

const RED_FLAGS = [
  'Claims ICU — no ventilator listed',
  '24/7 claim — single doctor on record',
  'Emergency Trauma claimed — ambulance not present',
  'Oncology services claimed — no oncologist on roster',
  'General Surgery claimed — no anesthesiologist on record',
  'Blood bank listed — missing cold storage equipment log',
  'Dialysis claimed — consumables log missing for 90 days'
]

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickN<T>(rng: () => number, arr: readonly T[], n: number) {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length)
    out.push(copy.splice(idx, 1)[0]!)
  }
  return out
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function trustLabelFromScore(score: number): Facility['trust_label'] {
  if (score >= 80) return 'Verified'
  if (score >= 50) return 'Incomplete'
  if (score >= 35) return 'Contradictory'
  return 'Suspicious'
}

function jitter(rng: () => number, amplitude: number) {
  return (rng() - 0.5) * amplitude * 2
}

const STATE_CENTERS: Record<(typeof STATES)[number], { lat: number; lng: number }> = {
  Bihar: { lat: 25.5941, lng: 85.1376 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  Rajasthan: { lat: 26.9124, lng: 75.7873 },
  Odisha: { lat: 20.2961, lng: 85.8245 },
  Maharashtra: { lat: 19.076, lng: 72.8777 },
  Karnataka: { lat: 12.9716, lng: 77.5946 },
  'Tamil Nadu': { lat: 13.0827, lng: 80.2707 },
  'West Bengal': { lat: 22.5726, lng: 88.3639 },
  'Madhya Pradesh': { lat: 23.2599, lng: 77.4126 },
  Assam: { lat: 26.1445, lng: 91.7362 }
}

const FIXED_FACILITIES: Facility[] = [
  {
    id: 'FAC-0000',
    name: 'District Hospital — Patna',
    pincode: '800016',
    district: 'Patna',
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    type: 'Government',
    capabilities: ['ICU', 'Emergency Trauma', 'Ambulance', 'Pharmacy'],
    trust_score: 88,
    trust_label: 'Verified',
    has_icu: true,
    has_emergency: true,
    specialists: ['Anesthesiologist', 'Cardiologist', 'Emergency Physician'],
    equipment: ['Ventilator', 'Defibrillator', 'ECG', 'Oxygen Concentrator'],
    availability: '24/7',
    raw_notes:
      'MOCK: Patna facility with verified ICU, emergency trauma, and 24/7 staffing. Equipment logs include ventilator and defibrillator.',
    flags: [],
    last_verified: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'FAC-0001',
    name: 'LifeCare Hospital — Patna',
    pincode: '800001',
    district: 'Patna',
    state: 'Bihar',
    lat: 25.6065,
    lng: 85.1376,
    type: 'Private',
    capabilities: ['ICU', 'General Surgery', 'Dialysis'],
    trust_score: 76,
    trust_label: 'Incomplete',
    has_icu: true,
    has_emergency: false,
    specialists: ['Nephrologist', 'General Surgeon', 'Anesthesiologist'],
    equipment: ['Dialysis Machine', 'Ultrasound', 'X-Ray'],
    availability: 'Limited',
    raw_notes: 'MOCK: Private ICU and dialysis services with limited availability.',
    flags: ['Claims ICU — no ventilator listed'],
    last_verified: new Date(Date.now() - 14 * 86400000).toISOString()
  }
]

export const MOCK_FACILITIES: Facility[] = [
  ...FIXED_FACILITIES,
  ...Array.from({ length: 50 }).map((_, i) => {
  const rng = mulberry32(1337 + i * 17)
  const state = STATES[Math.floor(rng() * STATES.length)]!
  const district = DISTRICTS[state][Math.floor(rng() * DISTRICTS[state].length)]!
  const center = STATE_CENTERS[state]

  const scoreBand = rng()
  const trust_score =
    scoreBand < 0.4
      ? 80 + Math.floor(rng() * 21) // ~40% Verified
      : scoreBand < 0.7
        ? 50 + Math.floor(rng() * 30) // ~30% Partial/Incomplete
        : scoreBand < 0.9
          ? Math.floor(rng() * 50) // ~20% Suspicious
          : 35 + Math.floor(rng() * 15) // ~10% Contradictory

  const capabilities = pickN(rng, CAPABILITIES, 2 + Math.floor(rng() * 4))
  const has_icu = capabilities.includes('ICU')
  const has_emergency = capabilities.includes('Emergency Trauma')

  const specialists = pickN(rng, SPECIALISTS, 2 + Math.floor(rng() * 4))
  const equipment = pickN(rng, EQUIPMENT, 2 + Math.floor(rng() * 5))

  const flags = trust_score < 60 ? pickN(rng, RED_FLAGS, 1 + Math.floor(rng() * 2)) : []

  const availabilityPick = rng()
  const availability: Facility['availability'] =
    availabilityPick < 0.6 ? '24/7' : availabilityPick < 0.85 ? 'Limited' : 'Unknown'

  const lat = center.lat + jitter(rng, 0.9)
  const lng = center.lng + jitter(rng, 0.9)

  const typePick = rng()
  const type: Facility['type'] =
    typePick < 0.45 ? 'Government' : typePick < 0.8 ? 'Private' : typePick < 0.9 ? 'NGO' : 'Trust'

  const namePrefix =
    type === 'Government'
      ? 'District Hospital'
      : type === 'Private'
        ? 'LifeCare Hospital'
        : type === 'NGO'
          ? 'Seva Health Center'
          : 'Trust Medical Institute'

  return {
    id: `FAC-${String(i + 2).padStart(4, '0')}`,
    name: `${namePrefix} — ${district}`,
    pincode: String(700000 + Math.floor(rng() * 200000)),
    district,
    state,
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    type,
    capabilities,
    trust_score,
    trust_label: trustLabelFromScore(trust_score),
    has_icu,
    has_emergency,
    specialists,
    equipment,
    availability,
    raw_notes:
      'MOCK: Facility notes include unstructured claims about equipment, specialists, and 24/7 availability. Some claims may contradict logs.',
    flags,
    last_verified: new Date(Date.now() - Math.floor(rng() * 45) * 86400000).toISOString()
  }
})
]

export const MOCK_TRUST_SCORES: TrustScore[] = MOCK_FACILITIES.map((f, idx) => {
  const rng = mulberry32(9001 + idx * 13)
  const base = clamp01(f.trust_score / 100)
  const breakdown = {
    equipment_consistency: Math.round(100 * clamp01(base + jitter(rng, 0.2))),
    staff_claims_verified: Math.round(100 * clamp01(base + jitter(rng, 0.2))),
    availability_plausibility: Math.round(100 * clamp01(base + jitter(rng, 0.2))),
    data_completeness: Math.round(100 * clamp01(base + jitter(rng, 0.2)))
  }

  const red_flags = f.flags
  const supporting_evidence =
    f.trust_score >= 80
      ? ['Equipment log entries align with listed capabilities', 'Specialist roster matches stated services']
      : ['Unstructured notes contain claims not fully supported by structured logs']

  return {
    facility_id: f.id,
    score: f.trust_score,
    breakdown,
    red_flags,
    supporting_evidence
  }
})

function mkStep(step: number, agent: ReasoningStep['agent'], action: string, input: string, output: string) {
  const rng = mulberry32(4242 + step * 101 + agent.length)
  return {
    step,
    agent,
    action,
    input,
    output,
    confidence: Number((0.72 + rng() * 0.25).toFixed(2)),
    duration_ms: 600 + Math.floor(rng() * 1900)
  } satisfies ReasoningStep
}

export const MOCK_TRACES: MLflowTrace[] = [
  {
    run_id: 'mock-run-001',
    agent_version: 'MOCK-AGENT-v0',
    total_duration_ms: 8120,
    steps: [
      mkStep(1, 'Extractor', 'Extract claims from raw notes', '10k facility notes', 'Structured candidate fields created'),
      mkStep(2, 'Validator', 'Cross-check against standards & logs', 'Candidate fields', 'Contradictions flagged'),
      mkStep(3, 'Scorer', 'Assign trust scores and reasons', 'Validated fields', 'Trust scores + red flags produced'),
      mkStep(4, 'Mapper', 'Geocode and map facilities/deserts', 'Facilities + deserts', 'Geo-ready outputs')
    ]
  },
  {
    run_id: 'mock-run-002',
    agent_version: 'MOCK-AGENT-v0',
    total_duration_ms: 10440,
    steps: [
      mkStep(1, 'Extractor', 'Parse equipment + staff lines', 'Equipment logs', 'Equipment/staff extracted'),
      mkStep(2, 'Validator', 'Validate ICU/ER plausibility', 'Claims', 'Plausibility computed'),
      mkStep(3, 'Scorer', 'Generate trust score breakdown', 'Validated signals', 'Breakdown produced'),
      mkStep(4, 'Mapper', 'Identify capability gaps by PIN', 'Facilities', 'Desert zones inferred')
    ]
  },
  {
    run_id: 'mock-run-003',
    agent_version: 'MOCK-AGENT-v0',
    total_duration_ms: 6930,
    steps: [
      mkStep(1, 'Extractor', 'Detect 24/7 availability claims', 'Raw notes', 'Availability candidates extracted'),
      mkStep(2, 'Validator', 'Validate against staffing roster', 'Availability candidates', 'Roster mismatch flags'),
      mkStep(3, 'Scorer', 'Assign trust labels', 'Signals', 'Labels assigned'),
      mkStep(4, 'Mapper', 'Update map overlays', 'Labels', 'Overlay metadata generated')
    ]
  }
]

export const MOCK_DESERTS: Desert[] = [
  // MOCK: Bihar
  {
    pincode: '844101',
    district: 'Muzaffarpur',
    state: 'Bihar',
    lat: 26.1209,
    lng: 85.3647,
    risk_level: 'Critical',
    missing_capabilities: ['ICU', 'Dialysis', 'Emergency Trauma'],
    nearest_facility_km: 42.8,
    population_affected: 620000
  },
  {
    pincode: '823001',
    district: 'Gaya',
    state: 'Bihar',
    lat: 24.7914,
    lng: 85.0002,
    risk_level: 'High',
    missing_capabilities: ['Neonatal Care', 'Blood Bank'],
    nearest_facility_km: 29.4,
    population_affected: 410000
  },
  // MOCK: Uttar Pradesh
  {
    pincode: '273001',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    lat: 26.7606,
    lng: 83.3732,
    risk_level: 'High',
    missing_capabilities: ['Dialysis', 'Oncology'],
    nearest_facility_km: 51.1,
    population_affected: 780000
  },
  {
    pincode: '221001',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    risk_level: 'Medium',
    missing_capabilities: ['Neonatal Care'],
    nearest_facility_km: 18.2,
    population_affected: 260000
  },
  // MOCK: Rajasthan
  {
    pincode: '334001',
    district: 'Bikaner',
    state: 'Rajasthan',
    lat: 28.0229,
    lng: 73.3119,
    risk_level: 'Critical',
    missing_capabilities: ['Emergency Trauma', 'Ambulance', 'Blood Bank'],
    nearest_facility_km: 67.0,
    population_affected: 540000
  },
  {
    pincode: '324001',
    district: 'Kota',
    state: 'Rajasthan',
    lat: 25.2138,
    lng: 75.8648,
    risk_level: 'Medium',
    missing_capabilities: ['Oncology'],
    nearest_facility_km: 22.9,
    population_affected: 230000
  },
  // MOCK: Odisha
  {
    pincode: '768001',
    district: 'Sambalpur',
    state: 'Odisha',
    lat: 21.4669,
    lng: 83.9812,
    risk_level: 'High',
    missing_capabilities: ['Dialysis', 'ICU'],
    nearest_facility_km: 44.6,
    population_affected: 360000
  },
  {
    pincode: '760001',
    district: 'Ganjam',
    state: 'Odisha',
    lat: 19.3149,
    lng: 84.7941,
    risk_level: 'Low',
    missing_capabilities: ['Blood Bank'],
    nearest_facility_km: 14.8,
    population_affected: 150000
  },
  // Extra mock zones to reach 10
  {
    pincode: '462001',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    risk_level: 'Medium',
    missing_capabilities: ['Neonatal Care'],
    nearest_facility_km: 19.6,
    population_affected: 190000
  },
  {
    pincode: '788001',
    district: 'Silchar',
    state: 'Assam',
    lat: 24.8333,
    lng: 92.7789,
    risk_level: 'High',
    missing_capabilities: ['Emergency Trauma', 'Ambulance'],
    nearest_facility_km: 38.3,
    population_affected: 280000
  }
]

export const MOCK_SUMMARY_STATS: SummaryStats = {
  total_facilities: 10000,
  avg_trust_score: 71.6,
  critical_desert_zones: 128,
  verified_icus: 1462
}

export const MOCK_AGENT_QUERY_RESPONSE = (run_id = 'mock-run-001') => {
  const trace = MOCK_TRACES.find((t) => t.run_id === run_id) ?? MOCK_TRACES[0]!
  return {
    facilities: MOCK_FACILITIES,
    trust_scores: MOCK_TRUST_SCORES,
    reasoning_chain: trace.steps,
    medical_deserts: MOCK_DESERTS,
    run_id: trace.run_id
  }
}

