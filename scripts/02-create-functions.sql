-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for boards table
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cards table
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles table
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

-- Create RLS policies
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
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Boards policies
CREATE POLICY "Users can view their own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id OR is_public = true OR 
         EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND is_active = true));

CREATE POLICY "Users can insert their own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true));

CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- Columns policies
CREATE POLICY "Users can view columns of accessible boards"
  ON columns FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id AND 
    (boards.user_id = auth.uid() OR boards.is_public = true OR 
     EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND is_active = true))
  ));

CREATE POLICY "Users can insert columns to their boards"
  ON columns FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id AND 
    (boards.user_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
  ));

CREATE POLICY "Users can update columns of their boards"
  ON columns FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id AND 
    (boards.user_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin', 'member') AND is_active = true))
  ));

CREATE POLICY "Users can delete columns of their boards"
  ON columns FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM boards 
    WHERE boards.id = columns.board_id AND 
    (boards.user_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM board_members WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true))
  ));

-- Similar policies for cards, tags, etc.
-- (Abbreviated for brevity, but would follow the same pattern)
