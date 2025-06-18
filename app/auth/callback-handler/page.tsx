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
        console.log("Processing auth callback...")
        console.log("Current URL:", window.location.href)

        // Check if we have a hash fragment with auth data
        const hash = window.location.hash
        console.log("Hash:", hash)

        if (hash && hash.includes("access_token")) {
          console.log("Found access token in URL hash, setting session...")

          // Let Supabase handle the session from the URL
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error getting session:", error)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
            return
          }

          console.log("Session set successfully:", data)

          // Clear the hash and redirect
          window.history.replaceState(null, "", window.location.pathname)
          router.push("/dashboard")
        } else {
          console.log("No auth data in URL, redirecting to login")
          router.push("/login")
        }
      } catch (error: any) {
        console.error("Error in auth callback handler:", error)
        router.push(`/login?error=${encodeURIComponent(error.message || "Authentication failed")}`)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}
