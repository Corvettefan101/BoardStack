import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Use the server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Log the request origin for debugging
    console.log("Auth request origin:", request.nextUrl.origin)

    // Initiate the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
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

    // Log the redirect URL for debugging (remove sensitive parts in production)
    console.log("Redirecting to:", data.url.split("?")[0] + "?[params]")

    // Redirect to the OAuth provider
    return NextResponse.redirect(data.url)
  } catch (error: any) {
    console.error("Server error during Google auth:", error)
    return NextResponse.json({ error: error?.message || "Unknown server error during authentication" }, { status: 500 })
  }
}
