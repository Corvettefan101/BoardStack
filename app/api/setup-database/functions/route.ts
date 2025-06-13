import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This code only runs on the server
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    // Create functions and triggers
    await supabaseAdmin.sql`
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
      $$ LANGUAGE plpgsql;

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
      $$ LANGUAGE plpgsql;

      -- Trigger for boards table
      DROP TRIGGER IF EXISTS on_board_created ON boards;
      CREATE TRIGGER on_board_created
      AFTER INSERT ON boards
      FOR EACH ROW
      EXECUTE FUNCTION create_default_columns();

      -- Function to create activity log
      CREATE OR REPLACE FUNCTION log_activity(
        p_board_id UUID,
        p_user_id UUID,
        p_action TEXT,
        p_entity_type TEXT,
        p_entity_id UUID,
        p_details JSONB
      )
      RETURNS UUID AS $$
      DECLARE
        activity_id UUID;
      BEGIN
        INSERT INTO activities (board_id, user_id, action, entity_type, entity_id, details)
        VALUES (p_board_id, p_user_id, p_action, p_entity_type, p_entity_id, p_details)
        RETURNING id INTO activity_id;
        
        RETURN activity_id;
      END;
      $$ LANGUAGE plpgsql;

      -- Function to delete user account and all related data
      CREATE OR REPLACE FUNCTION delete_user_account()
      RETURNS VOID AS $$
      DECLARE
        user_id UUID;
      BEGIN
        user_id := auth.uid();
        
        -- Delete all boards (cascades to columns, cards, etc.)
        DELETE FROM boards WHERE user_id = user_id;
        
        -- Delete tags
        DELETE FROM tags WHERE user_id = user_id;
        
        -- Delete profile
        DELETE FROM profiles WHERE id = user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    return NextResponse.json({ success: true, message: "Functions and triggers created successfully" })
  } catch (error) {
    console.error("Error creating functions:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
