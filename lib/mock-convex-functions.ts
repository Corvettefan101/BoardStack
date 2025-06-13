// Enhanced mock storage using localStorage
class MockConvexStorage {
  private getItem(key: string): any {
    if (typeof window === "undefined") return null
    const item = localStorage.getItem(`convex_${key}`)
    return item ? JSON.parse(item) : null
  }

  private setItem(key: string, value: any): void {
    if (typeof window === "undefined") return
    localStorage.setItem(`convex_${key}`, JSON.stringify(value))
  }

  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Users
  getUsers(): any[] {
    return this.getItem("users") || []
  }

  setUsers(users: any[]): void {
    this.setItem("users", users)
  }

  // Boards
  getBoards(): any[] {
    return this.getItem("boards") || []
  }

  setBoards(boards: any[]): void {
    this.setItem("boards", boards)
  }

  // Columns
  getColumns(): any[] {
    return this.getItem("columns") || []
  }

  setColumns(columns: any[]): void {
    this.setItem("columns", columns)
  }

  // Cards
  getCards(): any[] {
    return this.getItem("cards") || []
  }

  setCards(cards: any[]): void {
    this.setItem("cards", cards)
  }

  // Tags
  getTags(): any[] {
    return this.getItem("tags") || []
  }

  setTags(tags: any[]): void {
    this.setItem("tags", tags)
  }

  // Card Tags
  getCardTags(): any[] {
    return this.getItem("card_tags") || []
  }

  setCardTags(cardTags: any[]): void {
    this.setItem("card_tags", cardTags)
  }

  // Activities
  getActivities(): any[] {
    return this.getItem("activities") || []
  }

  setActivities(activities: any[]): void {
    this.setItem("activities", activities)
  }

  // Notifications
  getNotifications(): any[] {
    return this.getItem("notifications") || []
  }

  setNotifications(notifications: any[]): void {
    this.setItem("notifications", notifications)
  }
}

const storage = new MockConvexStorage()

// Simple hash function for demo purposes
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString()
}

// Mock implementation of all Convex functions
export const mockConvexFunctions = {
  users: {
    signup: async (args: { name: string; email: string; password: string }) => {
      const users = storage.getUsers()
      const existingUser = users.find((u: any) => u.email === args.email)

      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      const userId = storage.generateId()
      const newUser = {
        _id: userId,
        name: args.name,
        email: args.email,
        password: simpleHash(args.password),
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      users.push(newUser)
      storage.setUsers(users)

      return { userId }
    },

    login: async (args: { email: string; password: string }) => {
      const users = storage.getUsers()
      const user = users.find((u: any) => u.email === args.email)

      if (!user || user.password !== simpleHash(args.password)) {
        return { success: false, user: null }
      }

      // Update last login
      const userIndex = users.findIndex((u: any) => u._id === user._id)
      users[userIndex].lastLoginAt = new Date().toISOString()
      storage.setUsers(users)

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

    updateProfile: async (args: { userId: string; name?: string; email?: string; avatar?: string }) => {
      const users = storage.getUsers()
      const userIndex = users.findIndex((u: any) => u._id === args.userId)

      if (userIndex !== -1) {
        const { userId, ...updates } = args
        const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

        users[userIndex] = { ...users[userIndex], ...filteredUpdates }
        storage.setUsers(users)
      }

      return { success: true }
    },

    changePassword: async (args: { userId: string; currentPassword: string; newPassword: string }) => {
      const users = storage.getUsers()
      const user = users.find((u: any) => u._id === args.userId)

      if (!user || user.password !== simpleHash(args.currentPassword)) {
        return { success: false }
      }

      const userIndex = users.findIndex((u: any) => u._id === args.userId)
      users[userIndex].password = simpleHash(args.newPassword)
      storage.setUsers(users)

      return { success: true }
    },

    deleteAccount: async (args: { userId: string }) => {
      const users = storage.getUsers()
      const boards = storage.getBoards()
      const columns = storage.getColumns()
      const cards = storage.getCards()
      const tags = storage.getTags()
      const cardTags = storage.getCardTags()
      const activities = storage.getActivities()
      const notifications = storage.getNotifications()

      // Filter out user's data
      const filteredUsers = users.filter((u: any) => u._id !== args.userId)
      const userBoards = boards.filter((b: any) => b.userId === args.userId)
      const filteredBoards = boards.filter((b: any) => b.userId !== args.userId)

      // Get board IDs to delete related data
      const boardIds = userBoards.map((b: any) => b._id)
      const userColumns = columns.filter((c: any) => boardIds.includes(c.boardId))
      const columnIds = userColumns.map((c: any) => c._id)
      const userCards = cards.filter((c: any) => columnIds.includes(c.columnId))
      const cardIds = userCards.map((c: any) => c._id)

      const filteredColumns = columns.filter((c: any) => !boardIds.includes(c.boardId))
      const filteredCards = cards.filter((c: any) => !columnIds.includes(c.columnId))
      const filteredTags = tags.filter((t: any) => t.userId !== args.userId)
      const filteredCardTags = cardTags.filter((ct: any) => !cardIds.includes(ct.cardId))
      const filteredActivities = activities.filter((a: any) => !boardIds.includes(a.boardId))
      const filteredNotifications = notifications.filter((n: any) => n.userId !== args.userId)

      storage.setUsers(filteredUsers)
      storage.setBoards(filteredBoards)
      storage.setColumns(filteredColumns)
      storage.setCards(filteredCards)
      storage.setTags(filteredTags)
      storage.setCardTags(filteredCardTags)
      storage.setActivities(filteredActivities)
      storage.setNotifications(filteredNotifications)

      return { success: true }
    },

    getUser: async (args: { userId: string }) => {
      const users = storage.getUsers()
      const user = users.find((u: any) => u._id === args.userId)

      if (!user) return null

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      }
    },
  },

  boards: {
    getBoards: async (args: { userId: string }) => {
      const boards = storage.getBoards()
      const columns = storage.getColumns()
      const cards = storage.getCards()
      const tags = storage.getTags()
      const cardTags = storage.getCardTags()

      const userBoards = boards.filter((b: any) => b.userId === args.userId && !b.isArchived)

      return userBoards.map((board: any) => {
        const boardColumns = columns
          .filter((c: any) => c.boardId === board._id)
          .sort((a: any, b: any) => a.order - b.order)

        const columnsWithCards = boardColumns.map((column: any) => {
          const columnCards = cards
            .filter((c: any) => c.columnId === column._id)
            .sort((a: any, b: any) => a.order - b.order)

          const cardsWithTags = columnCards.map((card: any) => {
            const cardTagRelations = cardTags.filter((ct: any) => ct.cardId === card._id)
            const cardTagsData = cardTagRelations
              .map((ct: any) => {
                const tag = tags.find((t: any) => t._id === ct.tagId)
                return tag
                  ? {
                      id: tag._id,
                      name: tag.name,
                      color: tag.color,
                    }
                  : null
              })
              .filter(Boolean)

            return {
              id: card._id,
              title: card.title,
              description: card.description || "",
              columnId: column._id,
              dueDate: card.dueDate,
              assignedUser: card.assignedUserId
                ? {
                    id: card.assignedUserId,
                    name: "Mock User",
                    email: "mock@example.com",
                  }
                : undefined,
              tags: cardTagsData,
              priority: card.priority || "medium",
              estimatedHours: card.estimatedHours,
              actualHours: card.actualHours,
              isCompleted: card.isCompleted || false,
              createdAt: card.createdAt,
              updatedAt: card.updatedAt,
            }
          })

          return {
            id: column._id,
            title: column.title,
            boardId: board._id,
            cards: cardsWithTags,
            color: column.color,
            isCollapsed: column.isCollapsed || false,
            cardLimit: column.cardLimit,
          }
        })

        return {
          id: board._id,
          title: board.title,
          description: board.description,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          backgroundColor: board.backgroundColor,
          isPublic: board.isPublic || false,
          columns: columnsWithCards,
          members: [], // Mock empty members for now
        }
      })
    },

    createBoard: async (args: { userId: string; title: string; description?: string }) => {
      const boards = storage.getBoards()
      const columns = storage.getColumns()
      const activities = storage.getActivities()

      const boardId = storage.generateId()
      const now = new Date().toISOString()

      const newBoard = {
        _id: boardId,
        title: args.title,
        description: args.description,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      }

      boards.push(newBoard)
      storage.setBoards(boards)

      // Create default columns
      const defaultColumns = [
        { title: "To Do", order: 0, color: "#e2e8f0" },
        { title: "In Progress", order: 1, color: "#fef3c7" },
        { title: "Done", order: 2, color: "#d1fae5" },
      ]

      defaultColumns.forEach((col) => {
        const columnId = storage.generateId()
        columns.push({
          _id: columnId,
          title: col.title,
          boardId,
          order: col.order,
          color: col.color,
        })
      })

      storage.setColumns(columns)

      // Log activity
      const currentActivities = activities
      currentActivities.push({
        _id: storage.generateId(),
        boardId,
        userId: args.userId,
        action: "created",
        entityType: "board",
        entityId: boardId,
        details: JSON.stringify({ title: args.title }),
        createdAt: now,
      })
      storage.setActivities(currentActivities)

      return { boardId }
    },

    updateBoard: async (args: { boardId: string; title?: string; description?: string }) => {
      const boards = storage.getBoards()
      const boardIndex = boards.findIndex((b: any) => b._id === args.boardId)

      if (boardIndex !== -1) {
        const { boardId, ...updates } = args
        const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

        boards[boardIndex] = {
          ...boards[boardIndex],
          ...filteredUpdates,
          updatedAt: new Date().toISOString(),
        }
        storage.setBoards(boards)
      }

      return { success: true }
    },

    deleteBoard: async (args: { boardId: string }) => {
      const boards = storage.getBoards()
      const boardIndex = boards.findIndex((b: any) => b._id === args.boardId)

      if (boardIndex !== -1) {
        boards[boardIndex].isArchived = true
        boards[boardIndex].updatedAt = new Date().toISOString()
        storage.setBoards(boards)
      }

      return { success: true }
    },
  },

  columns: {
    createColumn: async (args: { boardId: string; title: string }) => {
      const columns = storage.getColumns()
      const boardColumns = columns.filter((c: any) => c.boardId === args.boardId)
      const maxOrder = boardColumns.reduce((max: number, col: any) => Math.max(max, col.order), -1)

      const columnId = storage.generateId()
      const newColumn = {
        _id: columnId,
        title: args.title,
        boardId: args.boardId,
        order: maxOrder + 1,
      }

      columns.push(newColumn)
      storage.setColumns(columns)

      return { columnId }
    },

    updateColumn: async (args: { columnId: string; title: string }) => {
      const columns = storage.getColumns()
      const columnIndex = columns.findIndex((c: any) => c._id === args.columnId)

      if (columnIndex !== -1) {
        columns[columnIndex].title = args.title
        storage.setColumns(columns)
      }

      return { success: true }
    },

    deleteColumn: async (args: { columnId: string }) => {
      const columns = storage.getColumns()
      const cards = storage.getCards()
      const cardTags = storage.getCardTags()

      // Get related data
      const columnCards = cards.filter((c: any) => c.columnId === args.columnId)
      const cardIds = columnCards.map((c: any) => c._id)

      // Filter out related data
      const filteredColumns = columns.filter((c: any) => c._id !== args.columnId)
      const filteredCards = cards.filter((c: any) => c.columnId !== args.columnId)
      const filteredCardTags = cardTags.filter((ct: any) => !cardIds.includes(ct.cardId))

      storage.setColumns(filteredColumns)
      storage.setCards(filteredCards)
      storage.setCardTags(filteredCardTags)

      return { success: true }
    },
  },

  cards: {
    createCard: async (args: { columnId: string; title: string; description?: string }) => {
      const cards = storage.getCards()
      const columnCards = cards.filter((c: any) => c.columnId === args.columnId)
      const maxOrder = columnCards.reduce((max: number, card: any) => Math.max(max, card.order), -1)

      const cardId = storage.generateId()
      const now = new Date().toISOString()

      const newCard = {
        _id: cardId,
        title: args.title,
        description: args.description,
        columnId: args.columnId,
        order: maxOrder + 1,
        priority: "medium",
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      }

      cards.push(newCard)
      storage.setCards(cards)

      return { cardId }
    },

    updateCard: async (args: {
      cardId: string
      title?: string
      description?: string
      dueDate?: string
      assignedUserId?: string
      priority?: string
      isCompleted?: boolean
    }) => {
      const cards = storage.getCards()
      const cardIndex = cards.findIndex((c: any) => c._id === args.cardId)

      if (cardIndex !== -1) {
        const { cardId, ...updates } = args
        const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))

        cards[cardIndex] = {
          ...cards[cardIndex],
          ...filteredUpdates,
          updatedAt: new Date().toISOString(),
        }
        storage.setCards(cards)
      }

      return { success: true }
    },

    moveCard: async (args: { cardId: string; newColumnId: string }) => {
      const cards = storage.getCards()
      const cardIndex = cards.findIndex((c: any) => c._id === args.cardId)

      if (cardIndex !== -1) {
        const columnCards = cards.filter((c: any) => c.columnId === args.newColumnId)
        const maxOrder = columnCards.reduce((max: number, card: any) => Math.max(max, card.order), -1)

        cards[cardIndex].columnId = args.newColumnId
        cards[cardIndex].order = maxOrder + 1
        cards[cardIndex].updatedAt = new Date().toISOString()
        storage.setCards(cards)
      }

      return { success: true }
    },

    deleteCard: async (args: { cardId: string }) => {
      const cards = storage.getCards()
      const cardTags = storage.getCardTags()

      const filteredCards = cards.filter((c: any) => c._id !== args.cardId)
      const filteredCardTags = cardTags.filter((ct: any) => ct.cardId !== args.cardId)

      storage.setCards(filteredCards)
      storage.setCardTags(filteredCardTags)

      return { success: true }
    },
  },

  migration: {
    migrateUserData: async (args: { userId: string; boards: any[] }) => {
      // This would handle migration from localStorage to the new format
      // For now, just return success
      return { success: true }
    },
  },

  // Placeholder implementations for new features
  activities: {
    getBoardActivities: async (args: { boardId: string; limit?: number }) => {
      return []
    },
    getUserActivities: async (args: { userId: string; limit?: number }) => {
      return []
    },
  },

  notifications: {
    getUserNotifications: async (args: { userId: string; limit?: number; unreadOnly?: boolean }) => {
      return []
    },
    markNotificationAsRead: async (args: { notificationId: string }) => {
      return { success: true }
    },
    markAllNotificationsAsRead: async (args: { userId: string }) => {
      return { success: true }
    },
    deleteNotification: async (args: { notificationId: string }) => {
      return { success: true }
    },
  },

  tags: {
    getUserTags: async (args: { userId: string }) => {
      return []
    },
    createTag: async (args: { userId: string; name: string; color: string }) => {
      return { tagId: storage.generateId() }
    },
    addTagToCard: async (args: { cardId: string; tagId: string }) => {
      return { success: true }
    },
    removeTagFromCard: async (args: { cardId: string; tagId: string }) => {
      return { success: true }
    },
    deleteTag: async (args: { tagId: string }) => {
      return { success: true }
    },
  },
}
