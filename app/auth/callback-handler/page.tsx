"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function CallbackHandler() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Processing auth callback...")
        console.log("Current URL:", window.location.href)
        console.log("Hash:", window.location.hash)

        // Check if we have tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")

        if (accessToken) {
          console.log("Found access token in URL hash, setting session...")

          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          })

          if (error) {
            console.error("Error setting session:", error)
            setError(error.message)
            setStatus("error")
            return
          }

          console.log("Session set successfully:", data)
          setStatus("success")

          // Clear the URL hash and redirect to dashboard
          window.history.replaceState({}, document.title, window.location.pathname)
          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
        } else {
          // Try the standard callback flow
          const { data, error } = await supabase.auth.getSessionFromUrl()

          if (error) {
            console.error("Error getting session from URL:", error)
            setError(error.message)
            setStatus("error")
            return
          }

          if (data.session) {
            console.log("Session retrieved successfully")
            setStatus("success")
            router.push("/dashboard")
          } else {
            console.error("No session found in callback")
            setError("No authentication session found")
            setStatus("error")
          }
        }
      } catch (err: any) {
        console.error("Callback handler error:", err)
        setError(err.message || "Authentication failed")
        setStatus("error")
      }
    }

    handleAuthCallback()
  }, [supabase, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="BoardStack" width={64} height={64} className="rounded-xl shadow-lg" />
            </div>
            <CardTitle className="text-xl">Completing Sign In...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Processing authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.png" alt="BoardStack" width={64} height={64} className="rounded-xl shadow-lg" />
            </div>
            <CardTitle className="text-xl text-green-600">Sign In Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="BoardStack" width={64} height={64} className="rounded-xl shadow-lg" />
          </div>
          <CardTitle className="text-xl text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button onClick={() => router.push("/login")} className="text-blue-600 hover:text-blue-500 font-medium">
              Return to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
