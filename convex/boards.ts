import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getBoards = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get boards where user is owner or member
    const ownedBoards = await ctx.db
      .query("boards")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isArchived", false))
      .collect()

    const memberBoards = await ctx.db
      .query("boardMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    const memberBoardIds = memberBoards.filter((member) => member.isActive).map((member) => member.boardId)

    const sharedBoards = await Promise.all(
      memberBoardIds.map(async (boardId) => {
        const board = await ctx.db.get(boardId)
        return board && !board.isArchived ? board : null
      }),
    )

    const allBoards = [...ownedBoards, ...sharedBoards.filter(Boolean)]

    return Promise.all(
      allBoards.map(async (board) => {
        const columns = await ctx.db
          .query("columns")
          .withIndex("by_board_order", (q) => q.eq("boardId", board._id))
          .collect()

        const columnsWithCards = await Promise.all(
          columns.map(async (column) => {
            const cards = await ctx.db
              .query("cards")
              .withIndex("by_column_order", (q) => q.eq("columnId", column._id))
              .collect()

            const cardsWithTags = await Promise.all(
              cards.map(async (card) => {
                const cardTags = await ctx.db
                  .query("cardTags")
                  .withIndex("by_card", (q) => q.eq("cardId", card._id))
                  .collect()

                const tags = await Promise.all(
                  cardTags.map(async (cardTag) => {
                    const tag = await ctx.db.get(cardTag.tagId)
                    return tag
                      ? {
                          id: tag._id,
                          name: tag.name,
                          color: tag.color,
                        }
                      : null
                  }),
                )

                let assignedUser = null
                if (card.assignedUserId) {
                  const user = await ctx.db
                    .query("users")
                    .filter((q) => q.eq(q.field("_id"), card.assignedUserId))
                    .first()
                  if (user) {
                    assignedUser = {
                      id: user._id,
                      name: user.name,
                      email: user.email,
                      avatar: user.avatar,
                    }
                  }
                }

                return {
                  id: card._id,
                  title: card.title,
                  description: card.description || "",
                  columnId: column._id,
                  dueDate: card.dueDate,
                  assignedUser,
                  tags: tags.filter(Boolean),
                  priority: card.priority,
                  estimatedHours: card.estimatedHours,
                  actualHours: card.actualHours,
                  isCompleted: card.isCompleted || false,
                  createdAt: card.createdAt,
                  updatedAt: card.updatedAt,
                }
              }),
            )

            return {
              id: column._id,
              title: column.title,
              boardId: board._id,
              cards: cardsWithTags,
              color: column.color,
              isCollapsed: column.isCollapsed || false,
              cardLimit: column.cardLimit,
            }
          }),
        )

        // Get board members
        const boardMembers = await ctx.db
          .query("boardMembers")
          .withIndex("by_board_active", (q) => q.eq("boardId", board._id).eq("isActive", true))
          .collect()

        const members = await Promise.all(
          boardMembers.map(async (member) => {
            const user = await ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("_id"), member.userId))
              .first()
            return user
              ? {
                  id: user._id,
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar,
                  role: member.role,
                  joinedAt: member.joinedAt,
                }
              : null
          }),
        )

        return {
          id: board._id,
          title: board.title,
          description: board.description,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          backgroundColor: board.backgroundColor,
          isPublic: board.isPublic || false,
          columns: columnsWithCards,
          members: members.filter(Boolean),
        }
      }),
    )
  },
})

export const createBoard = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()

    const boardId = await ctx.db.insert("boards", {
      title: args.title,
      description: args.description,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
      backgroundColor: args.backgroundColor,
      isPublic: args.isPublic || false,
      isArchived: false,
    })

    // Create default columns
    const columns = [
      { title: "To Do", order: 0, color: "#e2e8f0" },
      { title: "In Progress", order: 1, color: "#fef3c7" },
      { title: "Done", order: 2, color: "#d1fae5" },
    ]

    for (const column of columns) {
      await ctx.db.insert("columns", {
        title: column.title,
        boardId,
        order: column.order,
        color: column.color,
      })
    }

    // Log activity
    await ctx.db.insert("activities", {
      boardId,
      userId: args.userId,
      action: "created",
      entityType: "board",
      entityId: boardId,
      details: JSON.stringify({ title: args.title }),
      createdAt: now,
    })

    return { boardId }
  },
})

export const updateBoard = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { boardId, ...updates } = args
    const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

    if (Object.keys(filteredUpdates).length === 0) {
      return { success: true }
    }

    await ctx.db.patch(boardId, {
      ...filteredUpdates,
      updatedAt: new Date().toISOString(),
    })

    return { success: true }
  },
})

export const deleteBoard = mutation({
  args: {
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    // Archive instead of delete to preserve data integrity
    await ctx.db.patch(args.boardId, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    })

    return { success: true }
  },
})

export const inviteMember = mutation({
  args: {
    boardId: v.id("boards"),
    userId: v.string(),
    invitedUserId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is already a member
    const existingMember = await ctx.db
      .query("boardMembers")
      .withIndex("by_board_user", (q) => q.eq("boardId", args.boardId).eq("userId", args.invitedUserId))
      .first()

    if (existingMember) {
      if (existingMember.isActive) {
        throw new Error("User is already a member of this board")
      } else {
        // Reactivate the member
        await ctx.db.patch(existingMember._id, {
          isActive: true,
          role: args.role,
          joinedAt: new Date().toISOString(),
        })
        return { success: true }
      }
    }

    // Add new member
    await ctx.db.insert("boardMembers", {
      boardId: args.boardId,
      userId: args.invitedUserId,
      role: args.role,
      invitedBy: args.userId,
      joinedAt: new Date().toISOString(),
      isActive: true,
    })

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.invitedUserId,
      type: "board_invite",
      title: "Board Invitation",
      message: `You've been invited to join a board`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedEntityType: "board",
      relatedEntityId: args.boardId,
    })

    return { success: true }
  },
})

export const removeMember = mutation({
  args: {
    boardId: v.id("boards"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("boardMembers")
      .withIndex("by_board_user", (q) => q.eq("boardId", args.boardId).eq("userId", args.userId))
      .first()

    if (member) {
      await ctx.db.patch(member._id, {
        isActive: false,
      })
    }

    return { success: true }
  },
})
