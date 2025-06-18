import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    console.log("🔄 Processing OAuth callback with code:", code ? "present" : "missing")

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

      console.log("✅ Exchanging code for session...")
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("❌ Error exchanging code for session:", error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log("✅ Session established for user:", data.session.user.email)

        // Check if this is a new user
        const isNewUser = data.session.user.created_at === data.session.user.last_sign_in_at
        console.log("🔍 Is new user:", isNewUser)

        // Redirect to dashboard
        console.log("🚀 Redirecting to dashboard...")
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    console.log("❌ No valid code found, redirecting to login")
    return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
  } catch (error: any) {
    console.error("❌ Error in OAuth callback:", error)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message || "Authentication failed")}`,
    )
  }
}
