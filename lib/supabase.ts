import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Basic URL validation (less strict)
if (!supabaseUrl.startsWith("http")) {
  console.error("NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://")
  throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format")
}

console.log("Supabase configuration:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
})

// Global singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Create singleton browser client
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })

      console.log("Supabase client created successfully")
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      throw error
    }
  }
  return supabaseInstance
}

// Export the singleton instance
export const supabase = getSupabaseClient()

// Server-side client factory (creates new instances for server use)
export const createServerSupabaseClient = () => {
  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    throw error
  }
}

// Admin client factory
export const createServerAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
  }

  try {
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("Failed to create admin Supabase client:", error)
    throw error
  }
}
