import { NextResponse, type NextRequest } from 'next/server'

// Auth is handled in app/(protected)/layout.tsx via server-side Supabase check.
// This middleware only exists to satisfy Next.js routing — no Edge logic needed.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
