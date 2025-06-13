import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This code only runs on the server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // Enable RLS and create policies
    await supabaseAdmin.sql`
      -- Enable RLS on all tables
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
      ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
      ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
      ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
      ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
      ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
      ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

      -- Profiles policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
      CREATE POLICY "Users can view their own profile"
        ON profiles FOR SELECT
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
      CREATE POLICY "Users can update their own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);

      -- Boards policies
      DROP POLICY IF EXISTS "Users can view their own boards" ON boards;
      CREATE POLICY "Users can view their own boards"
        ON boards FOR SELECT
        USING (auth.uid() = user_id OR is_public = true OR 
              EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND is_active = true));

      DROP POLICY IF EXISTS "Users can insert their own boards" ON boards;
      CREATE POLICY "Users can insert their own boards"
        ON boards FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own boards" ON boards;
      CREATE POLICY "Users can update their own boards"
        ON boards FOR UPDATE
        USING (auth.uid() = user_id OR 
              EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true));

      DROP POLICY IF EXISTS "Users can delete their own boards" ON boards;
      CREATE POLICY "Users can delete their own boards"
        ON boards FOR DELETE
        USING (auth.uid() = user_id);

      -- Columns policies
      DROP POLICY IF EXISTS "Users can view columns of accessible boards" ON columns;
      CREATE POLICY "Users can view columns of accessible boards"
        ON columns FOR SELECT
        USING (EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = columns.board_id AND 
          (boards.user_id = auth.uid() OR boards.is_public = true OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can insert columns to their boards" ON columns;
      CREATE POLICY "Users can insert columns to their boards"
        ON columns FOR INSERT
        WITH CHECK (EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = columns.board_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can update columns of their boards" ON columns;
      CREATE POLICY "Users can update columns of their boards"
        ON columns FOR UPDATE
        USING (EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = columns.board_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can delete columns of their boards" ON columns;
      CREATE POLICY "Users can delete columns of their boards"
        ON columns FOR DELETE
        USING (EXISTS (
          SELECT 1 FROM boards 
          WHERE boards.id = columns.board_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true))
        ));

      -- Cards policies
      DROP POLICY IF EXISTS "Users can view cards of accessible columns" ON cards;
      CREATE POLICY "Users can view cards of accessible columns"
        ON cards FOR SELECT
        USING (EXISTS (
          SELECT 1 FROM columns
          JOIN boards ON columns.board_id = boards.id
          WHERE columns.id = cards.column_id AND 
          (boards.user_id = auth.uid() OR boards.is_public = true OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can insert cards to their columns" ON cards;
      CREATE POLICY "Users can insert cards to their columns"
        ON cards FOR INSERT
        WITH CHECK (EXISTS (
          SELECT 1 FROM columns
          JOIN boards ON columns.board_id = boards.id
          WHERE columns.id = cards.column_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can update cards of their columns" ON cards;
      CREATE POLICY "Users can update cards of their columns"
        ON cards FOR UPDATE
        USING (EXISTS (
          SELECT 1 FROM columns
          JOIN boards ON columns.board_id = boards.id
          WHERE columns.id = cards.column_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
        ));

      DROP POLICY IF EXISTS "Users can delete cards of their columns" ON cards;
      CREATE POLICY "Users can delete cards of their columns"
        ON cards FOR DELETE
        USING (EXISTS (
          SELECT 1 FROM columns
          JOIN boards ON columns.board_id = boards.id
          WHERE columns.id = cards.column_id AND 
          (boards.user_id = auth.uid() OR 
          EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
        ));
    `

    return NextResponse.json({ success: true, message: "RLS policies created successfully" })
  } catch (error) {
    console.error("Error creating policies:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
