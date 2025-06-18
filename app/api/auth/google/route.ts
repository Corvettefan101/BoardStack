import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    console.log("Auth request origin:", request.nextUrl.origin)

    // Use the server-side callback route for PKCE flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback`, // Use server-side callback
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

    console.log("Redirecting to Google OAuth...")
    return NextResponse.redirect(data.url)
  } catch (error: any) {
    console.error("Server error during Google auth:", error)
    return NextResponse.json({ error: error?.message || "Unknown server error during authentication" }, { status: 500 })
  }
}
