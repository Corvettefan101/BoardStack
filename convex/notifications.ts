import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getUserNotifications = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    let query = ctx.db.query("notifications").withIndex("by_user_created", (q) => q.eq("userId", args.userId))

    if (args.unreadOnly) {
      query = ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) => q.eq("userId", args.userId).eq("isRead", false))
    }

    const notifications = await query.order("desc").take(limit)

    return notifications.map((notification) => ({
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
    }))
  },
})

export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
    })

    return { success: true }
  },
})

export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect()

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      })
    }

    return { success: true }
  },
})

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId)
    return { success: true }
  },
})
