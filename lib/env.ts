import 'server-only'

export function isMockMode() {
  return String(process.env.IS_MOCK_MODE ?? '').toLowerCase() === 'true'
}

