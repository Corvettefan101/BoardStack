import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")

    // Handle error from OAuth provider
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    if (!code) {
      console.error("No code parameter in callback")
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Authentication failed - no code returned")}`, request.url),
      )
    }

    // Exchange the code for a session
    const supabase = createServerSupabaseClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url))
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error: any) {
    console.error("Error in auth callback:", error)
    // Redirect to login page with error
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message || "Authentication failed")}`, request.url),
    )
  }
}
