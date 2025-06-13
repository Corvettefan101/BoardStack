import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This code only runs on the server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["boards", "columns", "cards", "profiles", "tags"])

    if (tablesError) {
      throw new Error(`Error checking tables: ${tablesError.message}`)
    }

    const existingTables = tables.map((t) => t.table_name)
    const requiredTables = ["boards", "columns", "cards", "profiles", "tags"]
    const missingTables = requiredTables.filter((t) => !existingTables.includes(t))

    // Check if functions exist
    const { data: functions, error: functionsError } = await supabaseAdmin
      .from("information_schema.routines")
      .select("routine_name")
      .eq("routine_schema", "public")
      .in("routine_name", [
        "update_updated_at_column",
        "handle_new_user",
        "create_default_columns",
        "log_activity",
        "delete_user_account",
      ])

    if (functionsError) {
      throw new Error(`Error checking functions: ${functionsError.message}`)
    }

    const existingFunctions = functions.map((f) => f.routine_name)
    const requiredFunctions = [
      "update_updated_at_column",
      "handle_new_user",
      "create_default_columns",
      "log_activity",
      "delete_user_account",
    ]
    const missingFunctions = requiredFunctions.filter((f) => !existingFunctions.includes(f))

    const isSetup = missingTables.length === 0 && missingFunctions.length === 0

    return NextResponse.json({
      isSetup,
      tables: {
        existing: existingTables,
        missing: missingTables,
        status: missingTables.length === 0 ? "complete" : "incomplete",
      },
      functions: {
        existing: existingFunctions,
        missing: missingFunctions,
        status: missingFunctions.length === 0 ? "complete" : "incomplete",
      },
    })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
