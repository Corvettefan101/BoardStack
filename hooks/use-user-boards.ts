"use client"

import { useCallback } from "react"
import { useBoardStore } from "@/store/board-store"
import { useAuthStore } from "@/store/auth-store"
import type { Board, Column, Card } from "@/types"

export function useUserBoards() {
  const { currentUser } = useAuthStore()
  const {
    userBoards,
    getCurrentUserBoards,
    initializeUserBoards,
    clearUserData,
    exportUserData,
    importUserData,
    isLoaded,
  } = useBoardStore()

  const userId = currentUser?.id

  // Initialize user boards when user is available
  const ensureUserBoards = useCallback(() => {
    if (userId && !userBoards[userId]) {
      initializeUserBoards(userId)
    }
  }, [userId, userBoards, initializeUserBoards])

  // Get current user's boards
  const boards = getCurrentUserBoards(userId)

  // Board operations
  const createBoard = useCallback(
    (title: string) => {
      if (!userId) return

      ensureUserBoards()

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

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: [...userBoards, newBoard],
          },
        }
      })
    },
    [userId, ensureUserBoards],
  )

  const updateBoard = useCallback(
    (id: string, updates: Partial<Board>) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => (board.id === id ? { ...board, ...updates } : board)),
          },
        }
      })
    },
    [userId],
  )

  const deleteBoard = useCallback(
    (id: string) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.filter((board) => board.id !== id),
          },
        }
      })
    },
    [userId],
  )

  // Column operations
  const createColumn = useCallback(
    (boardId: string, title: string) => {
      if (!userId) return

      const newColumn: Column = {
        id: `col-${Date.now()}`,
        title,
        boardId,
        cards: [],
      }

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) =>
              board.id === boardId ? { ...board, columns: [...board.columns, newColumn] } : board,
            ),
          },
        }
      })
    },
    [userId],
  )

  const updateColumn = useCallback(
    (columnId: string, updates: Partial<Column>) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => ({
              ...board,
              columns: board.columns.map((column) => (column.id === columnId ? { ...column, ...updates } : column)),
            })),
          },
        }
      })
    },
    [userId],
  )

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => ({
              ...board,
              columns: board.columns.filter((column) => column.id !== columnId),
            })),
          },
        }
      })
    },
    [userId],
  )

  // Card operations
  const createCard = useCallback(
    (columnId: string, title: string) => {
      if (!userId) return

      const newCard: Card = {
        id: `card-${Date.now()}`,
        title,
        columnId,
        tags: [],
      }

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => ({
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId ? { ...column, cards: [...column.cards, newCard] } : column,
              ),
            })),
          },
        }
      })
    },
    [userId],
  )

  const updateCard = useCallback(
    (cardId: string, updates: Partial<Card>) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => ({
              ...board,
              columns: board.columns.map((column) => ({
                ...column,
                cards: column.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
              })),
            })),
          },
        }
      })
    },
    [userId],
  )

  const deleteCard = useCallback(
    (cardId: string) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        return {
          userBoards: {
            ...state.userBoards,
            [userId]: userBoards.map((board) => ({
              ...board,
              columns: board.columns.map((column) => ({
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              })),
            })),
          },
        }
      })
    },
    [userId],
  )

  const moveCard = useCallback(
    (cardId: string, newColumnId: string) => {
      if (!userId) return

      useBoardStore.setState((state) => {
        const userBoards = state.userBoards[userId] || []
        let cardToMove: Card | null = null

        // Find and remove the card from its current column
        const updatedBoards = userBoards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => {
            const cardIndex = column.cards.findIndex((card) => card.id === cardId)
            if (cardIndex !== -1) {
              cardToMove = { ...column.cards[cardIndex], columnId: newColumnId }
              return {
                ...column,
                cards: column.cards.filter((card) => card.id !== cardId),
              }
            }
            return column
          }),
        }))

        // Add the card to the new column
        if (cardToMove) {
          const finalBoards = updatedBoards.map((board) => ({
            ...board,
            columns: board.columns.map((column) =>
              column.id === newColumnId ? { ...column, cards: [...column.cards, cardToMove!] } : column,
            ),
          }))

          return {
            userBoards: {
              ...state.userBoards,
              [userId]: finalBoards,
            },
          }
        }

        return {
          userBoards: {
            ...state.userBoards,
            [userId]: updatedBoards,
          },
        }
      })
    },
    [userId],
  )

  // Data management
  const handleClearUserData = useCallback(() => {
    if (userId) {
      clearUserData(userId)
    }
  }, [userId, clearUserData])

  const handleExportUserData = useCallback(() => {
    if (userId) {
      return exportUserData(userId)
    }
    return ""
  }, [userId, exportUserData])

  const handleImportUserData = useCallback(
    (data: string) => {
      if (userId) {
        return importUserData(userId, data)
      }
      return false
    },
    [userId, importUserData],
  )

  return {
    boards,
    isLoaded,
    createBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    clearUserData: handleClearUserData,
    exportUserData: handleExportUserData,
    importUserData: handleImportUserData,
    ensureUserBoards,
  }
}
