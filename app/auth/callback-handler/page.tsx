"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2 } from "lucide-react"

export default function AuthCallbackHandler() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...")
        console.log("Current URL:", window.location.href)

        // Check if we have a hash fragment with auth data
        const hash = window.location.hash
        console.log("Hash:", hash)

        if (hash && hash.includes("access_token")) {
          console.log("✅ Found access token in URL hash, processing session...")

          // Let Supabase handle the session from the URL
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("❌ Error getting session:", error)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data.session?.user) {
            console.log("✅ Session established for user:", data.session.user.email)

            // Check if this is a new user by looking at created_at vs last_sign_in_at
            const user = data.session.user
            const isNewUser = user.created_at === user.last_sign_in_at

            console.log("🔍 User created:", user.created_at)
            console.log("🔍 Last sign in:", user.last_sign_in_at)
            console.log("🔍 Is new user:", isNewUser)

            // Clear the hash to clean up the URL
            window.history.replaceState(null, "", window.location.pathname)

            // Always redirect to dashboard for both new and existing users
            console.log("🚀 Redirecting to dashboard...")
            router.push("/dashboard")
          } else {
            console.error("❌ No session found after processing callback")
            router.push("/login?error=Authentication failed")
          }
        } else {
          console.log("❌ No auth data in URL, redirecting to login")
          router.push("/login")
        }
      } catch (error: any) {
        console.error("❌ Error in auth callback handler:", error)
        router.push(`/login?error=${encodeURIComponent(error.message || "Authentication failed")}`)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  )
}
