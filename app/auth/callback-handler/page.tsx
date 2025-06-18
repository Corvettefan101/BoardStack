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

        // Check for error parameters in URL
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))

        const error = urlParams.get("error") || hashParams.get("error")
        const errorDescription = urlParams.get("error_description") || hashParams.get("error_description")

        if (error) {
          console.error("❌ OAuth error:", error, errorDescription)
          const errorMsg = errorDescription || error
          router.push(`/login?error=${encodeURIComponent(errorMsg)}`)
          return
        }

        // Handle hash-based auth (implicit flow)
        const hash = window.location.hash
        console.log("Hash:", hash || "<empty string>")

        if (hash && (hash.includes("access_token") || hash.includes("code"))) {
          console.log("✅ Found auth data in hash, processing session...")

          // Use getSessionFromUrl to handle the callback properly
          const { data, error: sessionError } = await supabase.auth.getSession()

          if (sessionError) {
            console.error("❌ Error getting session:", sessionError)

            // Try to handle the session from URL hash directly
            try {
              console.log("🔄 Attempting to set session from URL...")
              const { data: urlData, error: urlError } = await supabase.auth.getSessionFromUrl()

              if (urlError) {
                console.error("❌ Error getting session from URL:", urlError)
                router.push(`/login?error=${encodeURIComponent(urlError.message)}`)
                return
              }

              if (urlData.session?.user) {
                console.log("✅ Session established from URL for user:", urlData.session.user.email)
                window.history.replaceState(null, "", window.location.pathname)
                console.log("🚀 Redirecting to dashboard...")
                router.push("/dashboard")
                return
              }
            } catch (urlError: any) {
              console.error("❌ Failed to get session from URL:", urlError)
            }

            router.push(`/login?error=${encodeURIComponent(sessionError.message)}`)
            return
          }

          if (data.session?.user) {
            console.log("✅ Session established for user:", data.session.user.email)

            // Check if this is a new user
            const user = data.session.user
            const isNewUser = user.created_at === user.last_sign_in_at

            console.log("🔍 User created:", user.created_at)
            console.log("🔍 Last sign in:", user.last_sign_in_at)
            console.log("🔍 Is new user:", isNewUser)

            // Clean up the URL
            window.history.replaceState(null, "", window.location.pathname)

            // Redirect to dashboard
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
