"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<{
    supabaseUrl: string | undefined
    hasAnonKey: boolean
    nodeEnv: string | undefined
  } | null>(null)

  useEffect(() => {
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    })
  }, [])

  if (!envVars) {
    return <div>Loading debug info...</div>
  }

  const isCorrectUrl = envVars.supabaseUrl === "https://oiqjcwyklhfndtgqxjda.supabase.co"
  const isOldUrl = envVars.supabaseUrl?.includes("gjtymdtezxtyvdkwqiau")

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Environment Debug</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">NODE_ENV:</span>
              <Badge variant="outline">{envVars.nodeEnv || "undefined"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
              <Badge variant={isCorrectUrl ? "default" : "destructive"}>{envVars.supabaseUrl || "undefined"}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Has NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <Badge variant={envVars.hasAnonKey ? "default" : "destructive"}>
                {envVars.hasAnonKey ? "Yes" : "No"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Expected URL:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">https://oiqjcwyklhfndtgqxjda.supabase.co</code>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Current URL:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{envVars.supabaseUrl || "undefined"}</code>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">URL Correct:</span>
              <Badge variant={isCorrectUrl ? "default" : "destructive"}>{isCorrectUrl ? "✅ Yes" : "❌ No"}</Badge>
            </div>

            {isOldUrl && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">⚠️ Still using old Supabase URL!</p>
                <p className="text-red-600 text-sm mt-1">
                  The environment variables haven't been updated in your deployment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>For Vercel:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Go to your Vercel project dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>Update NEXT_PUBLIC_SUPABASE_URL to: https://oiqjcwyklhfndtgqxjda.supabase.co</li>
                <li>Update NEXT_PUBLIC_SUPABASE_ANON_KEY with your new key</li>
                <li>Add SUPABASE_SERVICE_ROLE_KEY with your service role key</li>
                <li>Redeploy your application</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
