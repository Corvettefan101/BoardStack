"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

interface DatabaseStatus {
  isSetup: boolean
  tables: {
    existing: string[]
    missing: string[]
    status: "complete" | "incomplete"
  }
  functions: {
    existing: string[]
    missing: string[]
    status: "complete" | "incomplete"
  }
}

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    steps?: { name: string; status: string }[]
  } | null>(null)

  // Check database status on page load
  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/check-database")
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Error checking database status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const setupDatabase = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)

      // Refresh database status after setup
      await checkDatabaseStatus()
    } catch (error) {
      setResult({
        success: false,
        error: (error as Error).message || "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>BoardStackDB Setup</CardTitle>
          <CardDescription>
            Set up the database schema for your connected BoardStackDB. This will create all necessary tables,
            functions, and policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChecking ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Checking database status...</span>
            </div>
          ) : dbStatus ? (
            <Alert className={dbStatus.isSetup ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
              {dbStatus.isSetup ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertTitle>{dbStatus.isSetup ? "Database is set up" : "Database setup required"}</AlertTitle>
              <AlertDescription>
                {dbStatus.isSetup ? (
                  <p>Your BoardStackDB is already set up with all required tables and functions.</p>
                ) : (
                  <div>
                    <p>Your BoardStackDB needs to be set up.</p>
                    {dbStatus.tables.missing.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Missing tables:</p>
                        <ul className="text-xs list-disc list-inside">
                          {dbStatus.tables.missing.map((table) => (
                            <li key={table}>{table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dbStatus.functions.missing.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Missing functions:</p>
                        <ul className="text-xs list-disc list-inside">
                          {dbStatus.functions.missing.map((func) => (
                            <li key={func}>{func}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : null}

          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message || result.error}

                {result.steps && (
                  <ul className="mt-2 space-y-1">
                    {result.steps.map((step) => (
                      <li key={step.name} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-sm capitalize">
                          {step.name}: {step.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={setupDatabase}
            disabled={isLoading || (dbStatus?.isSetup && !result?.error)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up BoardStackDB...
              </>
            ) : dbStatus?.isSetup ? (
              "Database Already Set Up"
            ) : (
              "Set Up BoardStackDB"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
