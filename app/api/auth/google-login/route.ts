import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // Get the origin from headers as a fallback
    const origin =
      request.headers.get("origin") || request.headers.get("host")
        ? `https://${request.headers.get("host")}`
        : "http://localhost:3000"

    // Create the redirect URL
    const redirectTo = `${origin}/auth/callback`
    console.log("Redirect URL:", redirectTo)

    // Use the server-side client
    const supabase = createServerSupabaseClient()

    // Generate the OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // Add scopes to ensure we get email
        scopes: "email profile",
      },
    })

    if (error) {
      console.error("Error generating OAuth URL:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.url) {
      return NextResponse.json({ error: "No OAuth URL generated" }, { status: 500 })
    }

    // Redirect to the OAuth URL
    return NextResponse.redirect(data.url)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
