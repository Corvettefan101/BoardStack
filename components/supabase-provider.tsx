"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"

interface SupabaseContextType {
  user: User | null
  isLoading: boolean
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    console.log("🔍 Initial session check...")

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Error getting initial session:", error)
        } else if (session?.user) {
          console.log("✅ Initial session found for user:", session.user.email)
          setUser(session.user)
        } else {
          console.log("ℹ️ No initial session found")
        }
      } catch (error) {
        console.error("❌ Error in initial session check:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state change:", event, session?.user?.email || "No user")

      if (session?.user) {
        setUser(session.user)

        // Only redirect on SIGNED_IN event, not INITIAL_SESSION
        if (event === "SIGNED_IN") {
          console.log("✅ User signed in, redirecting to dashboard")
          // Small delay to ensure state is updated
          setTimeout(() => {
            router.push("/dashboard")
          }, 100)
        }
      } else {
        setUser(null)
        if (event === "SIGNED_OUT") {
          console.log("👋 User signed out, redirecting to login")
          router.push("/login")
        }
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signInWithGoogle = async () => {
    try {
      console.log("🚀 Starting Google sign-in...")

      // Use the API route for consistent OAuth flow
      window.location.href = "/api/auth/google"
    } catch (error) {
      console.error("❌ Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("👋 Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Sign out error:", error)
        throw error
      }
      console.log("✅ Signed out successfully")
    } catch (error) {
      console.error("❌ Error signing out:", error)
      throw error
    }
  }

  return (
    <SupabaseContext.Provider
      value={{
        user,
        isLoading,
        supabase,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
