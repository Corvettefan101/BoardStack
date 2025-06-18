import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

/**
 * Client-side Supabase client
 * Use this in client components and hooks
 */
let browserClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClientComponentClient<Database>()
  }
  return browserClient
}

export const supabase = getBrowserClient()
export const getSupabaseClient = getBrowserClient
