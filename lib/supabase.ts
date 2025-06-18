/**
 * Shared Supabase helpers
 *
 * • supabase, getSupabaseClient – client-side utilities
 * • createServerSupabaseClient  – server-only helper
 *
 * IMPORTANT:  We avoid importing `next/headers` at module scope so
 *             the client bundle never pulls it in.
 */

export { supabase, getSupabaseClient } from "./supabase-client"

/**
 * Server-only factory.
 * Uses `require` inside the function so the dependency on
 * `next/headers` is never evaluated in the browser bundle.
 */
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

export function createServerSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabaseClient can only be used on the server")
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createServerComponentClient } = require("@supabase/auth-helpers-nextjs") as typeof import(
    "@supabase/auth-helpers-nextjs",
  )
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { cookies } = require("next/headers") as typeof import("next/headers")

  return createServerComponentClient<Database>({ cookies })
}
