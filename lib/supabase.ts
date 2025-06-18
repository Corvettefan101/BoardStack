/**
 * Barrel file so older imports like
 *   import { supabase } from "@/lib/supabase"
 * keep working.
 *
 * It re-exports:
 *   • supabase               – client-side singleton
 *   • getSupabaseClient      – helper to obtain the client on demand
 *   • createServerSupabaseClient – helper for Server Components / Route Handlers
 */

export { supabase, getSupabaseClient } from "./supabase-client"
export { createServerSupabaseClient } from "./supabase-server"
