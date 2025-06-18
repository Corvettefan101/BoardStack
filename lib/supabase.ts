import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Environment variables with detailed logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("=== SUPABASE CONFIGURATION DEBUG ===")
console.log("Environment:", process.env.NODE_ENV)
console.log("Supabase URL from env:", supabaseUrl)
console.log("Has Anon Key:", !!supabaseAnonKey)
console.log("Expected URL: https://oiqjcwyklhfndtgqxjda.supabase.co")
console.log("URL Match:", supabaseUrl === "https://oiqjcwyklhfndtgqxjda.supabase.co")
console.log("=====================================")

// Validate environment variables
if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Check if we're still using the old URL
if (supabaseUrl.includes("gjtymdtezxtyvdkwqiau")) {
  console.error("❌ STILL USING OLD SUPABASE URL!")
  console.error("Current URL:", supabaseUrl)
  console.error("Expected URL: https://oiqjcwyklhfndtgqxjda.supabase.co")
  throw new Error("Environment variables not updated - still using old Supabase URL")
}

// Basic URL validation
if (!supabaseUrl.startsWith("http")) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://")
  throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format")
}

console.log("✅ Supabase configuration validated successfully")

// Global singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Create singleton browser client
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    try {
      console.log("🔄 Creating Supabase client with URL:", supabaseUrl)

      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })

      console.log("✅ Supabase client created successfully")
    } catch (error) {
      console.error("❌ Failed to create Supabase client:", error)
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
    console.log("🔄 Creating server Supabase client with URL:", supabaseUrl)

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("❌ Failed to create server Supabase client:", error)
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
    console.log("🔄 Creating admin Supabase client with URL:", supabaseUrl)

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.error("❌ Failed to create admin Supabase client:", error)
    throw error
  }
}
