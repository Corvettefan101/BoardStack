import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const createCard = mutation({
  args: {
    columnId: v.id("columns"),
    title: v.string(),
    description: v.optional(v.string()),
    assignedUserId: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    priority: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the highest order value
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect()

    const maxOrder = cards.reduce((max, card) => Math.max(max, card.order), -1)
    const now = new Date().toISOString()

    const cardId = await ctx.db.insert("cards", {
      title: args.title,
      description: args.description,
      columnId: args.columnId,
      assignedUserId: args.assignedUserId,
      dueDate: args.dueDate,
      priority: args.priority || "medium",
      estimatedHours: args.estimatedHours,
      order: maxOrder + 1,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    })

    // Get board ID for activity logging
    const column = await ctx.db.get(args.columnId)
    if (column) {
      await ctx.db.insert("activities", {
        boardId: column.boardId,
        userId: args.assignedUserId || "system",
        action: "created",
        entityType: "card",
        entityId: cardId,
        details: JSON.stringify({ title: args.title, columnTitle: column.title }),
        createdAt: now,
      })

      // Create notification if card is assigned
      if (args.assignedUserId) {
        await ctx.db.insert("notifications", {
          userId: args.assignedUserId,
          type: "card_assigned",
          title: "Card Assigned",
          message: `You've been assigned to "${args.title}"`,
          isRead: false,
          createdAt: now,
          relatedEntityType: "card",
          relatedEntityId: cardId,
        })
      }
    }

    return { cardId }
  },
})

export const updateCard = mutation({
  args: {
    cardId: v.id("cards"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    assignedUserId: v.optional(v.string()),
    priority: v.optional(v.string()),
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    isCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { cardId, ...updates } = args
    const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

    if (Object.keys(filteredUpdates).length === 0) {
      return { success: true }
    }

    const card = await ctx.db.get(cardId)
    if (!card) {
      throw new Error("Card not found")
    }

    // Handle completion status change
    if (updates.isCompleted !== undefined && updates.isCompleted !== card.isCompleted) {
      if (updates.isCompleted) {
        filteredUpdates.completedAt = new Date().toISOString()
      } else {
        filteredUpdates.completedAt = undefined
      }
    }

    await ctx.db.patch(cardId, {
      ...filteredUpdates,
      updatedAt: new Date().toISOString(),
    })

    // Log activity
    const column = await ctx.db.get(card.columnId)
    if (column) {
      await ctx.db.insert("activities", {
        boardId: column.boardId,
        userId: updates.assignedUserId || card.assignedUserId || "system",
        action: "updated",
        entityType: "card",
        entityId: cardId,
        details: JSON.stringify({
          title: updates.title || card.title,
          changes: Object.keys(filteredUpdates),
        }),
        createdAt: new Date().toISOString(),
      })
    }

    return { success: true }
  },
})

export const moveCard = mutation({
  args: {
    cardId: v.id("cards"),
    newColumnId: v.id("columns"),
    newOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId)
    if (!card) {
      throw new Error("Card not found")
    }

    let order = args.newOrder
    if (order === undefined) {
      // Get the highest order value in the new column
      const cards = await ctx.db
        .query("cards")
        .withIndex("by_column", (q) => q.eq("columnId", args.newColumnId))
        .collect()

      const maxOrder = cards.reduce((max, card) => Math.max(max, card.order), -1)
      order = maxOrder + 1
    }

    await ctx.db.patch(args.cardId, {
      columnId: args.newColumnId,
      order,
      updatedAt: new Date().toISOString(),
    })

    // Log activity
    const oldColumn = await ctx.db.get(card.columnId)
    const newColumn = await ctx.db.get(args.newColumnId)

    if (oldColumn && newColumn) {
      await ctx.db.insert("activities", {
        boardId: newColumn.boardId,
        userId: card.assignedUserId || "system",
        action: "moved",
        entityType: "card",
        entityId: args.cardId,
        details: JSON.stringify({
          title: card.title,
          from: oldColumn.title,
          to: newColumn.title,
        }),
        createdAt: new Date().toISOString(),
      })
    }

    return { success: true }
  },
})

export const deleteCard = mutation({
  args: {
    cardId: v.id("cards"),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId)
    if (!card) {
      throw new Error("Card not found")
    }

    // Delete card tags
    const cardTags = await ctx.db
      .query("cardTags")
      .withIndex("by_card", (q) => q.eq("cardId", args.cardId))
      .collect()

    for (const cardTag of cardTags) {
      await ctx.db.delete(cardTag._id)
    }

    // Delete comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_card", (q) => q.eq("cardId", args.cardId))
      .collect()

    for (const comment of comments) {
      await ctx.db.delete(comment._id)
    }

    // Delete attachments
    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_card", (q) => q.eq("cardId", args.cardId))
      .collect()

    for (const attachment of attachments) {
      await ctx.db.delete(attachment._id)
    }

    await ctx.db.delete(args.cardId)

    // Log activity
    const column = await ctx.db.get(card.columnId)
    if (column) {
      await ctx.db.insert("activities", {
        boardId: column.boardId,
        userId: card.assignedUserId || "system",
        action: "deleted",
        entityType: "card",
        entityId: args.cardId,
        details: JSON.stringify({ title: card.title }),
        createdAt: new Date().toISOString(),
      })
    }

    return { success: true }
  },
})

export const reorderCards = mutation({
  args: {
    cardOrders: v.array(
      v.object({
        cardId: v.id("cards"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const { cardId, order } of args.cardOrders) {
      await ctx.db.patch(cardId, {
        order,
        updatedAt: new Date().toISOString(),
      })
    }
    return { success: true }
  },
})
