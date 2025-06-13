-- Create indexes for better performance

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
