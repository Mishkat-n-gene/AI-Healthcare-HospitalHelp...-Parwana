import 'server-only'

import { NextResponse } from 'next/server'

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }
}

export function jsonOk<T>(data: T, init?: { status?: number; cacheControl?: string }) {
  const res = NextResponse.json(data, { status: init?.status ?? 200 })
  Object.entries(corsHeaders()).forEach(([k, v]) => res.headers.set(k, v))
  if (init?.cacheControl) res.headers.set('Cache-Control', init.cacheControl)
  return res
}

export function jsonError(args: { status: number; code: string; message: string; retryable?: boolean; details?: unknown }) {
  const res = NextResponse.json(
    { error: { code: args.code, message: args.message, retryable: Boolean(args.retryable), details: args.details ?? null } },
    { status: args.status }
  )
  Object.entries(corsHeaders()).forEach(([k, v]) => res.headers.set(k, v))
  res.headers.set('Cache-Control', 'no-store')
  return res
}

