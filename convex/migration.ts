import { mutation } from "./_generated/server"
import { v } from "convex/values"

export const migrateUserData = mutation({
  args: {
    userId: v.string(),
    boards: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        createdAt: v.string(),
        columns: v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            boardId: v.string(),
            cards: v.array(
              v.object({
                id: v.string(),
                title: v.string(),
                description: v.optional(v.string()),
                columnId: v.string(),
                dueDate: v.optional(v.string()),
                tags: v.array(
                  v.object({
                    id: v.string(),
                    name: v.string(),
                    color: v.string(),
                  }),
                ),
                assignedUser: v.optional(
                  v.object({
                    id: v.string(),
                    name: v.string(),
                    email: v.string(),
                  }),
                ),
              }),
            ),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, boards } = args

    // Create a map to store old ID to new ID mappings
    const idMap = new Map<string, string>()
    const tagMap = new Map<string, string>()

    // Process each board
    for (const board of boards) {
      const boardId = await ctx.db.insert("boards", {
        title: board.title,
        userId,
        createdAt: board.createdAt,
      })

      idMap.set(board.id, boardId)

      // Process columns
      for (let i = 0; i < board.columns.length; i++) {
        const column = board.columns[i]
        const columnId = await ctx.db.insert("columns", {
          title: column.title,
          boardId,
          order: i,
        })

        idMap.set(column.id, columnId)

        // Process cards
        for (let j = 0; j < column.cards.length; j++) {
          const card = column.cards[j]

          // Create card
          const cardId = await ctx.db.insert("cards", {
            title: card.title,
            description: card.description,
            columnId,
            dueDate: card.dueDate,
            assignedUserId: card.assignedUser?.id,
            order: j,
          })

          idMap.set(card.id, cardId)

          // Process tags
          for (const tag of card.tags) {
            let tagId: string

            // Check if we've already created this tag
            if (tagMap.has(tag.id)) {
              tagId = tagMap.get(tag.id)!
            } else {
              // Create new tag
              tagId = await ctx.db.insert("tags", {
                name: tag.name,
                color: tag.color,
                userId,
              })

              tagMap.set(tag.id, tagId)
            }

            // Associate tag with card
            await ctx.db.insert("cardTags", {
              cardId,
              tagId,
            })
          }
        }
      }
    }

    return { success: true }
  },
})
