"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoadingScreen } from "./loading-screen"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoaded, router])

  if (!isLoaded) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
