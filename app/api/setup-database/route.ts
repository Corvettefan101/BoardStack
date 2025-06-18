import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This code only runs on the server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting database setup...")

    // Step 1: Create tables
    console.log("📋 Creating tables...")
    const { error: tablesError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
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
      `,
    })

    if (tablesError) {
      console.error("❌ Error creating tables:", tablesError)
      return NextResponse.json({ error: `Failed to create tables: ${tablesError.message}` }, { status: 500 })
    }

    console.log("✅ Tables created successfully")

    // Step 2: Create functions and triggers
    console.log("⚙️ Creating functions and triggers...")
    const { error: functionsError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        -- Function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Trigger for boards table
        DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
        CREATE TRIGGER update_boards_updated_at
        BEFORE UPDATE ON boards
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- Trigger for cards table
        DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
        CREATE TRIGGER update_cards_updated_at
        BEFORE UPDATE ON cards
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- Trigger for profiles table
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- Function to handle new user signup
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO profiles (id, name, avatar_url)
          VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'avatar_url'
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger for auth.users
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_user();

        -- Function to create default columns when a board is created
        CREATE OR REPLACE FUNCTION create_default_columns()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Create To Do column
          INSERT INTO columns (title, board_id, "order", color)
          VALUES ('To Do', NEW.id, 0, '#e2e8f0');
          
          -- Create In Progress column
          INSERT INTO columns (title, board_id, "order", color)
          VALUES ('In Progress', NEW.id, 1, '#fef3c7');
          
          -- Create Done column
          INSERT INTO columns (title, board_id, "order", color)
          VALUES ('Done', NEW.id, 2, '#d1fae5');
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger for boards table
        DROP TRIGGER IF EXISTS on_board_created ON boards;
        CREATE TRIGGER on_board_created
        AFTER INSERT ON boards
        FOR EACH ROW
        EXECUTE FUNCTION create_default_columns();
      `,
    })

    if (functionsError) {
      console.error("❌ Error creating functions:", functionsError)
      return NextResponse.json({ error: `Failed to create functions: ${functionsError.message}` }, { status: 500 })
    }

    console.log("✅ Functions and triggers created successfully")

    // Step 3: Create indexes
    console.log("📊 Creating indexes...")
    const { error: indexesError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
        -- Boards indexes
        CREATE INDEX IF NOT EXISTS boards_user_id_idx ON boards(user_id);
        CREATE INDEX IF NOT EXISTS boards_is_archived_idx ON boards(is_archived);
        CREATE INDEX IF NOT EXISTS boards_created_at_idx ON boards(created_at);

        -- Columns indexes
        CREATE INDEX IF NOT EXISTS columns_board_id_idx ON columns(board_id);
        CREATE INDEX IF NOT EXISTS columns_board_id_order_idx ON columns(board_id, "order");

        -- Cards indexes
        CREATE INDEX IF NOT EXISTS cards_column_id_idx ON cards(column_id);
        CREATE INDEX IF NOT EXISTS cards_column_id_order_idx ON cards(column_id, "order");
        CREATE INDEX IF NOT EXISTS cards_assigned_user_id_idx ON cards(assigned_user_id);
        CREATE INDEX IF NOT EXISTS cards_due_date_idx ON cards(due_date);
        CREATE INDEX IF NOT EXISTS cards_is_completed_idx ON cards(is_completed);

        -- Tags indexes
        CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);

        -- Card Tags indexes
        CREATE INDEX IF NOT EXISTS card_tags_card_id_idx ON card_tags(card_id);
        CREATE INDEX IF NOT EXISTS card_tags_tag_id_idx ON card_tags(tag_id);

        -- Board Members indexes
        CREATE INDEX IF NOT EXISTS board_members_board_id_idx ON board_members(board_id);
        CREATE INDEX IF NOT EXISTS board_members_user_id_idx ON board_members(user_id);
        CREATE INDEX IF NOT EXISTS board_members_board_id_user_id_idx ON board_members(board_id, user_id);

        -- Activities indexes
        CREATE INDEX IF NOT EXISTS activities_board_id_idx ON activities(board_id);
        CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
        CREATE INDEX IF NOT EXISTS activities_board_id_created_at_idx ON activities(board_id, created_at);

        -- Comments indexes
        CREATE INDEX IF NOT EXISTS comments_card_id_idx ON comments(card_id);
        CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
        CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON comments(parent_comment_id);

        -- Attachments indexes
        CREATE INDEX IF NOT EXISTS attachments_card_id_idx ON attachments(card_id);

        -- Notifications indexes
        CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS notifications_user_id_is_read_idx ON notifications(user_id, is_read);
        CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx ON notifications(user_id, created_at);
      `,
    })

    if (indexesError) {
      console.error("❌ Error creating indexes:", indexesError)
      return NextResponse.json({ error: `Failed to create indexes: ${indexesError.message}` }, { status: 500 })
    }

    console.log("✅ Indexes created successfully")

    // Step 4: Set up RLS policies
    console.log("🔒 Setting up RLS policies...")
    const { error: policiesError } = await supabaseAdmin.rpc("exec_sql", {
      sql: `
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

        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
        CREATE POLICY "Users can insert their own profile"
          ON profiles FOR INSERT
          WITH CHECK (auth.uid() = id);

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

        -- Cards policies (similar pattern for other tables)
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
      `,
    })

    if (policiesError) {
      console.error("❌ Error creating policies:", policiesError)
      return NextResponse.json({ error: `Failed to create policies: ${policiesError.message}` }, { status: 500 })
    }

    console.log("✅ RLS policies created successfully")
    console.log("🎉 Database setup completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database schema set up successfully in BoardStackDB",
      steps: [
        { name: "tables", status: "completed" },
        { name: "functions", status: "completed" },
        { name: "indexes", status: "completed" },
        { name: "policies", status: "completed" },
      ],
    })
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
