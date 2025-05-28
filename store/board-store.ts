import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Board, Column, Card } from "@/types"

interface BoardStore {
  userBoards: Record<string, Board[]> // userId -> boards
  isLoaded: boolean
  createBoard: (title: string) => void
  updateBoard: (id: string, updates: Partial<Board>) => void
  deleteBoard: (id: string) => void
  createColumn: (boardId: string, title: string) => void
  updateColumn: (columnId: string, updates: Partial<Column>) => void
  deleteColumn: (columnId: string) => void
  createCard: (columnId: string, title: string) => void
  updateCard: (cardId: string, updates: Partial<Card>) => void
  deleteCard: (cardId: string) => void
  moveCard: (cardId: string, newColumnId: string) => void
  clearUserData: (userId: string) => void
  exportUserData: (userId: string) => string
  importUserData: (userId: string, data: string) => boolean
  getCurrentUserBoards: (userId?: string) => Board[]
  initializeUserBoards: (userId: string) => void
}

const createDefaultBoards = (): Board[] => [
  {
    id: "1",
    title: "Welcome to BoardStack",
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: "col-1",
        title: "To Do",
        boardId: "1",
        cards: [
          {
            id: "card-1",
            title: "Welcome to BoardStack!",
            description: "This is your first card. Click the pencil icon to edit it and explore all the features.",
            columnId: "col-1",
            tags: [{ id: "tag-1", name: "Welcome", color: "#3b82f6" }],
          },
          {
            id: "card-2",
            title: "Try drag and drop",
            description: "Drag this card to the 'In Progress' column to see how smooth the experience is!",
            columnId: "col-1",
            tags: [{ id: "tag-2", name: "Tutorial", color: "#10b981" }],
          },
        ],
      },
      {
        id: "col-2",
        title: "In Progress",
        boardId: "1",
        cards: [
          {
            id: "card-3",
            title: "Explore card editing",
            description: "Click the pencil icon to edit cards, add tags, set due dates, and assign users.",
            columnId: "col-2",
            tags: [
              { id: "tag-3", name: "Feature", color: "#8b5cf6" },
              { id: "tag-4", name: "Important", color: "#ef4444" },
            ],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        ],
      },
      {
        id: "col-3",
        title: "Done",
        boardId: "1",
        cards: [
          {
            id: "card-4",
            title: "User authentication added!",
            description: "You now have your own personal account with secure login and data separation.",
            columnId: "col-3",
            tags: [
              { id: "tag-5", name: "Completed", color: "#10b981" },
              { id: "tag-6", name: "Auth", color: "#06b6d4" },
            ],
          },
        ],
      },
    ],
  },
]

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      userBoards: {},
      isLoaded: false,

      getCurrentUserBoards: (userId?: string) => {
        const { userBoards } = get()
        if (!userId) return []
        return userBoards[userId] || []
      },

      initializeUserBoards: (userId: string) => {
        const { userBoards } = get()
        if (!userBoards[userId]) {
          set((state) => ({
            userBoards: {
              ...state.userBoards,
              [userId]: createDefaultBoards(),
            },
          }))
        }
      },

      createBoard: (title) => {
        // We'll pass userId from the component
        const newBoard: Board = {
          id: `board-${Date.now()}`,
          title,
          createdAt: new Date().toISOString(),
          columns: [
            {
              id: `col-${Date.now()}-1`,
              title: "To Do",
              boardId: `board-${Date.now()}`,
              cards: [],
            },
            {
              id: `col-${Date.now()}-2`,
              title: "In Progress",
              boardId: `board-${Date.now()}`,
              cards: [],
            },
            {
              id: `col-${Date.now()}-3`,
              title: "Done",
              boardId: `board-${Date.now()}`,
              cards: [],
            },
          ],
        }

        // This will be called from components that have access to currentUser
        return newBoard
      },

      updateBoard: (id, updates) => {
        // This will be updated to accept userId parameter
      },

      deleteBoard: (id) => {
        // This will be updated to accept userId parameter
      },

      createColumn: (boardId, title) => {
        const newColumn: Column = {
          id: `col-${Date.now()}`,
          title,
          boardId,
          cards: [],
        }
        return newColumn
      },

      updateColumn: (columnId, updates) => {
        // Implementation will be updated
      },

      deleteColumn: (columnId) => {
        // Implementation will be updated
      },

      createCard: (columnId, title) => {
        const newCard: Card = {
          id: `card-${Date.now()}`,
          title,
          columnId,
          tags: [],
        }
        return newCard
      },

      updateCard: (cardId, updates) => {
        // Implementation will be updated
      },

      deleteCard: (cardId) => {
        // Implementation will be updated
      },

      moveCard: (cardId, newColumnId) => {
        // Implementation will be updated
      },

      clearUserData: (userId) => {
        set((state) => ({
          userBoards: {
            ...state.userBoards,
            [userId]: createDefaultBoards(),
          },
        }))
      },

      exportUserData: (userId) => {
        const { userBoards } = get()
        const exportData = {
          boards: userBoards[userId] || [],
          exportDate: new Date().toISOString(),
          version: "1.0",
        }
        return JSON.stringify(exportData, null, 2)
      },

      importUserData: (userId, data) => {
        try {
          const parsedData = JSON.parse(data)
          if (parsedData.boards) {
            set((state) => ({
              userBoards: {
                ...state.userBoards,
                [userId]: parsedData.boards,
              },
            }))
            return true
          }
          return false
        } catch (error) {
          console.error("Failed to import data:", error)
          return false
        }
      },
    }),
    {
      name: "boardstack-boards",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true
        }
      },
    },
  ),
)
