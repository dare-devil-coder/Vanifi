import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Next.js routing middleware
// Ensures legacy `/dashboard` URL gracefully redirects to `/app`
// while letting all real Next.js App Router pages load directly.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === '/dashboard') {
    return NextResponse.redirect(new URL('/app', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard'],
}
