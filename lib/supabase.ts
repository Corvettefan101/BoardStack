import {
  createClientComponentClient,
  createServerComponentClient,
  type SupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

/**
 * ──────────────────────────────────────────────────────────────
 *  Shared Supabase utilities
 *  These named exports are expected by many legacy files.
 *  All of them internally rely on the official Auth-Helpers.
 * ──────────────────────────────────────────────────────────────
 */

/* ------------------------------------------------------------
 * 1. Singleton browser client (prevents duplicates on the client)
 * ---------------------------------------------------------- */
let browserClient: SupabaseClient<Database> | null = null

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClientComponentClient<Database>()
  }
  return browserClient
}

/* ------------------------------------------------------------
 * 2. Immediately-usable export (‘supabase’) for most client code
 * ---------------------------------------------------------- */
export const supabase =
  typeof window === "undefined"
    ? // On the server use a fresh client per request
      createServerComponentClient<Database>({ cookies })
    : // In the browser share a singleton
      getBrowserClient()

/* ------------------------------------------------------------
 * 3. Helper that returns the right client for the current context
 * ---------------------------------------------------------- */
export function getSupabaseClient() {
  return typeof window === "undefined" ? createServerComponentClient<Database>({ cookies }) : getBrowserClient()
}

/* ------------------------------------------------------------
 * 4. Explicit factory for server-side use (RSCs, Route Handlers, etc.)
 * ---------------------------------------------------------- */
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}
