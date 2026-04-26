import 'server-only'

type Entry = { count: number; windowStartMs: number }

const buckets = new Map<string, Entry>()

export function rateLimit(args: { key: string; limit: number; windowMs: number }) {
  const now = Date.now()
  const existing = buckets.get(args.key)
  if (!existing || now - existing.windowStartMs >= args.windowMs) {
    buckets.set(args.key, { count: 1, windowStartMs: now })
    return { ok: true, remaining: args.limit - 1, resetMs: args.windowMs }
  }

  if (existing.count >= args.limit) {
    return { ok: false, remaining: 0, resetMs: Math.max(0, args.windowMs - (now - existing.windowStartMs)) }
  }

  existing.count += 1
  buckets.set(args.key, existing)
  return { ok: true, remaining: Math.max(0, args.limit - existing.count), resetMs: Math.max(0, args.windowMs - (now - existing.windowStartMs)) }
}

