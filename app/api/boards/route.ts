import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/boards - Starting request")

    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("❌ No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    // Get boards for the user
    const { data: boards, error: boardsError } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })

    if (boardsError) {
      console.error("❌ Database error fetching boards:", boardsError)
      return NextResponse.json({ error: "Failed to fetch boards", details: boardsError }, { status: 500 })
    }

    console.log("✅ Boards fetched successfully:", boards?.length || 0)

    return NextResponse.json({ boards: boards || [] })
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/boards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 POST /api/boards - Starting request")

    const supabase = createServerSupabaseClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    // Parse request body
    const body = await request.json()
    const { title, description } = body

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    console.log("📝 Creating board:", title)

    // Create the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        user_id: user.id,
        is_archived: false,
        is_public: false,
      })
      .select()
      .single()

    if (boardError) {
      console.error("❌ Database error:", boardError)
      return NextResponse.json(
        {
          error: "Failed to create board",
          details: boardError,
        },
        { status: 500 },
      )
    }

    console.log("✅ Board created successfully:", board.id)
    return NextResponse.json({ board })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
