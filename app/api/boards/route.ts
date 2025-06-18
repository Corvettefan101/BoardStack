import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server" // Direct import for API routes

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

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("❌ No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.id)

    // Parse request body
    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    console.log("📝 Creating board with title:", title)

    // Create the board
    const { data: board, error: boardError } = await supabase
      .from("boards")
      .insert({
        title,
        description: description || "",
        user_id: user.id,
        is_archived: false,
      })
      .select()
      .single()

    if (boardError) {
      console.error("❌ Database error creating board:", boardError)
      return NextResponse.json({ error: "Failed to create board", details: boardError }, { status: 500 })
    }

    console.log("✅ Board created successfully:", board.id)

    return NextResponse.json({ board })
  } catch (error) {
    console.error("❌ Unexpected error in POST /api/boards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
