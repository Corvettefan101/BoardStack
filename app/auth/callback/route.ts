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

    console.log("Auth callback received:", {
      code: !!code,
      error,
      errorDescription,
      url: request.url,
    })

    // Handle error from OAuth provider
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url),
      )
    }

    if (!code) {
      console.error("No code parameter in callback")
      // Instead of showing an error, redirect to a page that can handle the hash fragment
      return NextResponse.redirect(new URL("/auth/callback-handler", request.url))
    }

    // Exchange the code for a session
    const supabase = createServerSupabaseClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url))
    }

    console.log("Successfully exchanged code for session")
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
