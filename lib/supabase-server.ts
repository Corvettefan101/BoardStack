import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

/**
 * Server-side Supabase client
 * Use this in Server Components and API routes
 */
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}

export const getServerSupabaseClient = createServerSupabaseClient
