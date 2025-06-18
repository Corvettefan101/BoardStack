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

  // Use the auth helpers client for consistency
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    console.log("Initial session check...")

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error)
        } else if (session?.user) {
          console.log("Initial session check: Session found")
          setUser(session.user)
        } else {
          console.log("Initial session check: No session")
        }
      } catch (error) {
        console.error("Error in initial session check:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session")

      if (session?.user) {
        setUser(session.user)
        if (event === "SIGNED_IN") {
          console.log("User signed in, redirecting to dashboard")
          router.push("/dashboard")
        }
      } else {
        setUser(null)
        if (event === "SIGNED_OUT") {
          console.log("User signed out, redirecting to login")
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-handler`,
        },
      })

      if (error) {
        console.error("Google sign-in error:", error)
        throw error
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        throw error
      }
    } catch (error) {
      console.error("Error signing out:", error)
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
