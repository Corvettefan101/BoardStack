import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const createColumn = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the highest order value
    const columns = await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect()

    const maxOrder = columns.reduce((max, col) => Math.max(max, col.order), -1)

    const columnId = await ctx.db.insert("columns", {
      title: args.title,
      boardId: args.boardId,
      order: maxOrder + 1,
    })

    return { columnId }
  },
})

export const updateColumn = mutation({
  args: {
    columnId: v.id("columns"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.columnId, {
      title: args.title,
    })
    return { success: true }
  },
})

export const deleteColumn = mutation({
  args: {
    columnId: v.id("columns"),
  },
  handler: async (ctx, args) => {
    // Delete all cards in the column
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect()

    for (const card of cards) {
      // Delete card tags
      const cardTags = await ctx.db
        .query("cardTags")
        .withIndex("by_card", (q) => q.eq("cardId", card._id))
        .collect()

      for (const cardTag of cardTags) {
        await ctx.db.delete(cardTag._id)
      }

      await ctx.db.delete(card._id)
    }

    await ctx.db.delete(args.columnId)
    return { success: true }
  },
})

export const reorderColumns = mutation({
  args: {
    columnOrders: v.array(
      v.object({
        columnId: v.id("columns"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const { columnId, order } of args.columnOrders) {
      await ctx.db.patch(columnId, { order })
    }
    return { success: true }
  },
})
