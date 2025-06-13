import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getUserTags = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    return tags.map((tag) => ({
      id: tag._id,
      name: tag.name,
      color: tag.color,
    }))
  },
})

export const createTag = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const tagId = await ctx.db.insert("tags", {
      name: args.name,
      color: args.color,
      userId: args.userId,
    })

    return { tagId }
  },
})

export const addTagToCard = mutation({
  args: {
    cardId: v.id("cards"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    // Check if the tag is already added to the card
    const existingCardTag = await ctx.db
      .query("cardTags")
      .filter((q) => q.and(q.eq(q.field("cardId"), args.cardId), q.eq(q.field("tagId"), args.tagId)))
      .first()

    if (existingCardTag) {
      return { success: true }
    }

    await ctx.db.insert("cardTags", {
      cardId: args.cardId,
      tagId: args.tagId,
    })

    return { success: true }
  },
})

export const removeTagFromCard = mutation({
  args: {
    cardId: v.id("cards"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    const cardTag = await ctx.db
      .query("cardTags")
      .filter((q) => q.and(q.eq(q.field("cardId"), args.cardId), q.eq(q.field("tagId"), args.tagId)))
      .first()

    if (cardTag) {
      await ctx.db.delete(cardTag._id)
    }

    return { success: true }
  },
})

export const deleteTag = mutation({
  args: {
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    // Delete all card-tag associations
    const cardTags = await ctx.db
      .query("cardTags")
      .filter((q) => q.eq(q.field("tagId"), args.tagId))
      .collect()

    for (const cardTag of cardTags) {
      await ctx.db.delete(cardTag._id)
    }

    await ctx.db.delete(args.tagId)
    return { success: true }
  },
})
