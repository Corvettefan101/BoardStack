import { query } from "./_generated/server"
import { v } from "convex/values"

export const getBoardActivities = query({
  args: {
    boardId: v.id("boards"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_board_created", (q) => q.eq("boardId", args.boardId))
      .order("desc")
      .take(limit)

    return Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), activity.userId))
          .first()

        return {
          id: activity._id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          details: activity.details ? JSON.parse(activity.details) : null,
          createdAt: activity.createdAt,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              }
            : null,
        }
      }),
    )
  },
})

export const getUserActivities = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit)

    return Promise.all(
      activities.map(async (activity) => {
        const board = await ctx.db.get(activity.boardId)

        return {
          id: activity._id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          details: activity.details ? JSON.parse(activity.details) : null,
          createdAt: activity.createdAt,
          board: board
            ? {
                id: board._id,
                title: board.title,
              }
            : null,
        }
      }),
    )
  },
})
