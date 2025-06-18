import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: boards, error } = await supabase
    .from("boards")
    .select("id, title, description, created_at, updated_at, is_archived, background_color, is_public")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching boards:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ boards })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, description, background_color, is_public } = await request.json()

    console.log("Creating board for user:", user.id)
    console.log("Board data:", { title, description, background_color, is_public })

    const { data, error } = await supabase
      .from("boards")
      .insert([
        {
          user_id: user.id,
          title,
          description,
          background_color,
          is_public: is_public || false,
        },
      ])
      .select()

    if (error) {
      console.error("Database error creating board:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Board created successfully:", data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/boards:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
