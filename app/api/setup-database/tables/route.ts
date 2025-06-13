import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This code only runs on the server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // Create tables
    await supabaseAdmin.sql`
      -- Users table (managed by Supabase Auth, we'll extend it with profiles)
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );

      -- Boards table
      CREATE TABLE IF NOT EXISTS boards (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        is_archived BOOLEAN DEFAULT FALSE,
        background_color TEXT,
        is_public BOOLEAN DEFAULT FALSE
      );

      -- Columns table
      CREATE TABLE IF NOT EXISTS columns (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        color TEXT,
        is_collapsed BOOLEAN DEFAULT FALSE,
        card_limit INTEGER
      );

      -- Cards table
      CREATE TABLE IF NOT EXISTS cards (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
        due_date TIMESTAMP WITH TIME ZONE,
        assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        "order" INTEGER NOT NULL,
        priority TEXT,
        estimated_hours NUMERIC,
        actual_hours NUMERIC,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );

      -- Card Tags junction table
      CREATE TABLE IF NOT EXISTS card_tags (
        card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        PRIMARY KEY (card_id, tag_id)
      );

      -- Board Members table
      CREATE TABLE IF NOT EXISTS board_members (
        board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        is_active BOOLEAN DEFAULT TRUE,
        PRIMARY KEY (board_id, user_id)
      );

      -- Activities table
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id UUID NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        is_edited BOOLEAN DEFAULT FALSE,
        parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE
      );

      -- Attachments table
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        related_entity_type TEXT,
        related_entity_id UUID
      );
    `

    return NextResponse.json({ success: true, message: "Tables created successfully" })
  } catch (error) {
    console.error("Error creating tables:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
