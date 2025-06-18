"use client"

import { useCallback, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useAuthStore } from "@/store/auth-store"
import { supabase } from "@/lib/supabase-client"

export function useAuth() {
  const { user, session, isLoading: isSupabaseLoading, signInWithGoogle, signOut } = useSupabase()
  const { currentUser, setCurrentUser, clearCurrentUser, isLoaded: isStoreLoaded } = useAuthStore()

  // Sync Supabase user with our store
  useEffect(() => {
    if (user && !currentUser) {
      setCurrentUser({
        id: user.id,
        name: user.user_metadata.full_name || user.user_metadata.name || "User",
        email: user.email || "",
        avatar: user.user_metadata.avatar_url,
        createdAt: user.created_at,
      })
    } else if (!user && currentUser) {
      clearCurrentUser()
    }
  }, [user, currentUser, setCurrentUser, clearCurrentUser])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        return false
      }

      return !!data.user
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithGoogle()
      return true
    } catch (error) {
      console.error("Google login error:", error)
      return false
    }
  }, [signInWithGoogle])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        return false
      }

      return !!data.user
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut()
      clearCurrentUser()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [signOut, clearCurrentUser])

  const updateProfile = useCallback(
    async (updates: Partial<{ name: string; email: string; avatar?: string }>) => {
      if (!currentUser) return

      try {
        // Update auth metadata if name changed
        if (updates.name) {
          await supabase.auth.updateUser({
            data: { full_name: updates.name },
          })
        }

        // Update email if changed
        if (updates.email) {
          await supabase.auth.updateUser({
            email: updates.email,
          })
        }

        // Update profile in database
        const { error } = await supabase
          .from("profiles")
          .update({
            name: updates.name,
            avatar_url: updates.avatar,
          })
          .eq("id", currentUser.id)

        if (error) {
          console.error("Update profile error:", error)
          return
        }

        setCurrentUser({
          ...currentUser,
          ...updates,
        })
      } catch (error) {
        console.error("Update profile error:", error)
      }
    },
    [currentUser, setCurrentUser],
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!currentUser) return false

      try {
        // First verify the current password by trying to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: currentPassword,
        })

        if (signInError) {
          console.error("Current password verification failed:", signInError)
          return false
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (error) {
          console.error("Change password error:", error)
          return false
        }

        return true
      } catch (error) {
        console.error("Change password error:", error)
        return false
      }
    },
    [currentUser],
  )

  const deleteAccount = useCallback(async () => {
    if (!currentUser) return

    try {
      // Delete user data from database
      // This will cascade due to our database constraints
      const { error } = await supabase.rpc("delete_user_account")

      if (error) {
        console.error("Delete account error:", error)
        return
      }

      // Delete auth user
      await supabase.auth.admin.deleteUser(currentUser.id)

      clearCurrentUser()
    } catch (error) {
      console.error("Delete account error:", error)
    }
  }, [currentUser, clearCurrentUser])

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoaded: isStoreLoaded && !isSupabaseLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
  }
}
