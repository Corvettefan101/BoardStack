import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Simple hash function for demo purposes (use proper auth in production)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: simpleHash(args.password),
      createdAt: new Date().toISOString(),
    })

    return { userId }
  },
})

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (!user || user.password !== simpleHash(args.password)) {
      return { success: false, user: null }
    }

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    }
  },
})

export const updateProfile = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

    if (Object.keys(filteredUpdates).length === 0) {
      return { success: true }
    }

    await ctx.db.patch(userId, filteredUpdates)
    return { success: true }
  },
})

export const changePassword = mutation({
  args: {
    userId: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)

    if (!user || user.password !== simpleHash(args.currentPassword)) {
      return { success: false }
    }

    await ctx.db.patch(args.userId, {
      password: simpleHash(args.newPassword),
    })

    return { success: true }
  },
})

export const deleteAccount = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete user's boards, columns, cards, and tags
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    for (const board of boards) {
      const columns = await ctx.db
        .query("columns")
        .withIndex("by_board", (q) => q.eq("boardId", board._id))
        .collect()

      for (const column of columns) {
        const cards = await ctx.db
          .query("cards")
          .withIndex("by_column", (q) => q.eq("columnId", column._id))
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

        await ctx.db.delete(column._id)
      }

      await ctx.db.delete(board._id)
    }

    // Delete user's tags
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    for (const tag of tags) {
      await ctx.db.delete(tag._id)
    }

    // Delete user
    await ctx.db.delete(args.userId)

    return { success: true }
  },
})

export const getUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)

    if (!user) {
      return null
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    }
  },
})
