import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res: response })

  // Refresh session if expired - this is important for auth state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Optional: Add logging for debugging
  if (request.nextUrl.pathname.startsWith("/api/")) {
    console.log(`API Request: ${request.method} ${request.nextUrl.pathname}`)
    console.log(`User authenticated: ${!!session?.user}`)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
