"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type SupabaseContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  supabase: typeof supabase
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error)
        }

        if (mounted) {
          console.log("Initial session check:", session ? "Session found" : "No session")
          setSession(session)
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session")

      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // Handle specific auth events
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, redirecting to dashboard")
          router.push("/dashboard")
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out, redirecting to login")
          router.push("/login")
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const signInWithGoogle = async () => {
    console.log("Attempting to sign in with Google...")
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log("Sign in response:", { data, error })

      if (error) {
        console.error("Google sign in error:", error)
        throw error
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
    supabase,
  }

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}
