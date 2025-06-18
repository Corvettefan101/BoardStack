import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    console.log("Auth request origin:", request.nextUrl.origin)

    // Use the implicit flow (hash-based) instead of PKCE for now
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback-handler`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        // Force implicit flow to avoid PKCE issues
        skipBrowserRedirect: false,
      },
    })

    if (error) {
      console.error("Google OAuth error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.url) {
      console.error("No redirect URL returned from Supabase")
      return NextResponse.json({ error: "Authentication failed - no redirect URL" }, { status: 500 })
    }

    console.log("Redirecting to Google OAuth...")
    return NextResponse.redirect(data.url)
  } catch (error: any) {
    console.error("Server error during Google auth:", error)
    return NextResponse.json({ error: error?.message || "Unknown server error during authentication" }, { status: 500 })
  }
}
