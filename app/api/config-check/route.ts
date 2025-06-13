import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const config = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urls: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
        // Don't expose actual keys for security
      },
    }

    return NextResponse.json(config)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Configuration check failed",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
