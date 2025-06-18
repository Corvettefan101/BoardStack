"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase"

interface ConnectionStatus {
  url: string | null
  connected: boolean
  error: string | null
  testing: boolean
}

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    url: null,
    connected: false,
    error: null,
    testing: false,
  })

  const testConnection = async () => {
    setStatus((prev) => ({ ...prev, testing: true, error: null }))

    try {
      const supabase = getSupabaseClient()
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set"

      // Test the connection by trying to get the session
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus({
          url,
          connected: false,
          error: error.message,
          testing: false,
        })
      } else {
        setStatus({
          url,
          connected: true,
          error: null,
          testing: false,
        })
      }
    } catch (error: any) {
      setStatus({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
        connected: false,
        error: error?.message || "Unknown connection error",
        testing: false,
      })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="space-y-4">
      <Alert variant={status.connected ? "default" : "destructive"}>
        {status.connected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>Supabase Connection {status.connected ? "Success" : "Failed"}</AlertTitle>
        <AlertDescription>
          <div className="mt-2 space-y-2">
            <div>
              <strong>URL:</strong> {status.url}
            </div>
            {status.error && (
              <div>
                <strong>Error:</strong> {status.error}
              </div>
            )}
            <Button onClick={testConnection} disabled={status.testing} size="sm" variant="outline">
              {status.testing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
