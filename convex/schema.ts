import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(), // In production, use a proper auth provider like Clerk
    avatar: v.optional(v.string()),
    createdAt: v.string(),
    lastLoginAt: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_created_at", ["createdAt"])
    .index("by_active", ["isActive"]),

  boards: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    isArchived: v.optional(v.boolean()),
    backgroundColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isArchived"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),

  columns: defineTable({
    title: v.string(),
    boardId: v.id("boards"),
    order: v.number(),
    color: v.optional(v.string()),
    isCollapsed: v.optional(v.boolean()),
    cardLimit: v.optional(v.number()),
  })
    .index("by_board", ["boardId"])
    .index("by_board_order", ["boardId", "order"]),

  cards: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    columnId: v.id("columns"),
    dueDate: v.optional(v.string()),
    assignedUserId: v.optional(v.string()),
    order: v.number(),
    priority: v.optional(v.string()), // "low", "medium", "high", "urgent"
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    isCompleted: v.optional(v.boolean()),
    completedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_column", ["columnId"])
    .index("by_column_order", ["columnId", "order"])
    .index("by_assigned_user", ["assignedUserId"])
    .index("by_due_date", ["dueDate"])
    .index("by_priority", ["priority"])
    .index("by_completed", ["isCompleted"]),

  tags: defineTable({
    name: v.string(),
    color: v.string(),
    userId: v.string(), // Global tags per user
    description: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  cardTags: defineTable({
    cardId: v.id("cards"),
    tagId: v.id("tags"),
    createdAt: v.string(),
  })
    .index("by_card", ["cardId"])
    .index("by_tag", ["tagId"])
    .index("by_card_tag", ["cardId", "tagId"]),

  // New tables for enhanced features
  boardMembers: defineTable({
    boardId: v.id("boards"),
    userId: v.string(),
    role: v.string(), // "owner", "admin", "member", "viewer"
    invitedBy: v.string(),
    joinedAt: v.string(),
    isActive: v.boolean(),
  })
    .index("by_board", ["boardId"])
    .index("by_user", ["userId"])
    .index("by_board_user", ["boardId", "userId"])
    .index("by_board_active", ["boardId", "isActive"]),

  activities: defineTable({
    boardId: v.id("boards"),
    userId: v.string(),
    action: v.string(), // "created", "updated", "deleted", "moved", "assigned", etc.
    entityType: v.string(), // "board", "column", "card", "tag"
    entityId: v.string(),
    details: v.optional(v.string()), // JSON string with additional details
    createdAt: v.string(),
  })
    .index("by_board", ["boardId"])
    .index("by_board_created", ["boardId", "createdAt"])
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"]),

  comments: defineTable({
    cardId: v.id("cards"),
    userId: v.string(),
    content: v.string(),
    createdAt: v.string(),
    updatedAt: v.optional(v.string()),
    isEdited: v.optional(v.boolean()),
    parentCommentId: v.optional(v.id("comments")), // For threaded comments
  })
    .index("by_card", ["cardId"])
    .index("by_card_created", ["cardId", "createdAt"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentCommentId"]),

  attachments: defineTable({
    cardId: v.id("cards"),
    userId: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    fileUrl: v.string(), // URL to the stored file
    uploadedAt: v.string(),
  })
    .index("by_card", ["cardId"])
    .index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(), // "card_assigned", "due_date_reminder", "board_invite", etc.
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.string(),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_user_created", ["userId", "createdAt"]),
})
