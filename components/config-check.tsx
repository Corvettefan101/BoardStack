"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function ConfigCheck() {
  const [config, setConfig] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
  } | null>(null)

  useEffect(() => {
    setConfig({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }, [])

  if (!config) return null

  const hasIssues = !config.supabaseUrl || !config.supabaseKey

  if (!hasIssues) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration Error</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            {config.supabaseUrl ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-600" />
            )}
            <span className="text-sm">NEXT_PUBLIC_SUPABASE_URL: {config.supabaseUrl ? "✓ Set" : "✗ Missing"}</span>
          </div>
          <div className="flex items-center gap-2">
            {config.supabaseKey ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <AlertCircle className="h-3 w-3 text-red-600" />
            )}
            <span className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY: {config.supabaseKey ? "✓ Set" : "✗ Missing"}</span>
          </div>
        </div>
        <p className="mt-2 text-sm">
          Please check your environment variables in your Vercel dashboard or .env.local file.
        </p>
      </AlertDescription>
    </Alert>
  )
}
