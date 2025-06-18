/**
 * Barrel file that conditionally exports client/server utilities
 * to avoid importing next/headers on the client side
 */

// Always safe to export client-side utilities
export { supabase, getSupabaseClient } from "./supabase-client"

// Conditionally export server utilities only when on server
export const createServerSupabaseClient = (() => {
  // Only import server utilities when actually on the server
  if (typeof window === "undefined") {
    // Dynamic import to avoid bundling server code on client
    return async () => {
      const { createServerSupabaseClient: serverClient } = await import("./supabase-server")
      return serverClient()
    }
  }

  // Return a no-op function for client-side (should never be called)
  return () => {
    throw new Error("createServerSupabaseClient can only be used on the server side")
  }
})()
