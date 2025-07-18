"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { Board, Column, Card, Tag } from "@/types"
import { supabase } from "@/lib/supabase-client"
import type { PostgrestError, RealtimeChannel } from "@supabase/supabase-js"

export function useUserBoards() {
  const { currentUser } = useAuth()
  const userId = currentUser?.id

  const [boards, setBoards] = useState<Board[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | string | null>(null)

  // Fetch boards
  const fetchBoards = useCallback(async () => {
    if (!userId) {
      setBoards([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("🔍 Fetching boards...")

      // Get boards where user is owner or member
      const { data: boardsData, error: boardsError } = await supabase
        .from("boards")
        .select("*")
        .eq("is_archived", false)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (boardsError) {
        setError(boardsError)
        return
      }

      // Get shared boards
      const { data: memberBoards, error: memberBoardsError } = await supabase
        .from("board_members")
        .select("board_id")
        .eq("user_id", userId)
        .eq("is_active", true)

      if (memberBoardsError) {
        setError(memberBoardsError)
        return
      }

      const memberBoardIds = memberBoards?.map((mb) => mb.board_id) || []

      let sharedBoardsData: any[] = []
      if (memberBoardIds.length > 0) {
        const { data: sharedBoards, error: sharedBoardsError } = await supabase
          .from("boards")
          .select("*")
          .in("id", memberBoardIds)
          .eq("is_archived", false)
          .order("created_at", { ascending: false })

        if (sharedBoardsError) {
          setError(sharedBoardsError)
        } else {
          sharedBoardsData = sharedBoards || []
        }
      }

      const allBoardsData = [...(boardsData || []), ...sharedBoardsData]

      // For each board, get columns and cards
      const boardsWithDetails = await Promise.all(
        allBoardsData.map(async (board) => {
          // Get columns
          const { data: columnsData, error: columnsError } = await supabase
            .from("columns")
            .select("*")
            .eq("board_id", board.id)
            .order("order", { ascending: true })

          if (columnsError) {
            setError(columnsError)
            return null
          }

          const columnsWithCards = await Promise.all(
            (columnsData || []).map(async (column) => {
              // Get cards
              const { data: cardsData, error: cardsError } = await supabase
                .from("cards")
                .select("*")
                .eq("column_id", column.id)
                .order("order", { ascending: true })

              if (cardsError) {
                setError(cardsError)
                return null
              }

              const cardsWithTags = await Promise.all(
                (cardsData || []).map(async (card) => {
                  // Get card tags
                  const { data: cardTagsData, error: cardTagsError } = await supabase
                    .from("card_tags")
                    .select("tag_id")
                    .eq("card_id", card.id)

                  if (cardTagsError) {
                    setError(cardTagsError)
                    return null
                  }

                  let tags: Tag[] = []
                  if (cardTagsData && cardTagsData.length > 0) {
                    const tagIds = cardTagsData.map((ct) => ct.tag_id)
                    const { data: tagsData } = await supabase.from("tags").select("*").in("id", tagIds)

                    tags = (tagsData || []).map((tag) => ({
                      id: tag.id,
                      name: tag.name,
                      color: tag.color,
                    }))
                  }

                  // Get assigned user if any
                  let assignedUser = undefined
                  if (card.assigned_user_id) {
                    const { data: userData } = await supabase
                      .from("profiles")
                      .select("*")
                      .eq("id", card.assigned_user_id)
                      .single()

                    if (userData) {
                      assignedUser = {
                        id: userData.id,
                        name: userData.name,
                        email: "", // Email is not stored in profiles for privacy
                        avatar: userData.avatar_url,
                      }
                    }
                  }

                  return {
                    id: card.id,
                    title: card.title,
                    description: card.description || "",
                    columnId: column.id,
                    dueDate: card.due_date,
                    assignedUser,
                    tags,
                    priority: card.priority,
                    estimatedHours: card.estimated_hours,
                    actualHours: card.actual_hours,
                    isCompleted: card.is_completed || false,
                  } as Card
                }),
              )

              return {
                id: column.id,
                title: column.title,
                boardId: board.id,
                cards: cardsWithTags.filter(Boolean) as Card[],
                color: column.color,
                isCollapsed: column.is_collapsed || false,
                cardLimit: column.card_limit,
              } as Column
            }),
          )

          return {
            id: board.id,
            title: board.title,
            description: board.description || "",
            createdAt: board.created_at,
            columns: columnsWithCards.filter(Boolean) as Column[],
          } as Board
        }),
      )

      setBoards(boardsWithDetails.filter(Boolean) as Board[])
      console.log("✅ Boards fetched successfully:", allBoardsData?.length || 0)
    } catch (err) {
      console.error("❌ Error fetching boards:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch boards")
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
    }
  }, [userId])

  // Add a force update counter
  const [updateCounter, setUpdateCounter] = useState(0)

  // Add this function after fetchBoards
  const forceUpdate = useCallback(() => {
    setUpdateCounter((prev) => prev + 1)
    fetchBoards()
  }, [fetchBoards])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return

    let channels: RealtimeChannel[] = []

    const setupRealtimeSubscriptions = () => {
      // Subscribe to boards changes
      const boardsChannel = supabase
        .channel("boards-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "boards",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("🔄 Board change detected:", payload)
            // Force immediate refetch
            setTimeout(() => fetchBoards(), 100)
          },
        )
        .subscribe()

      // Subscribe to columns changes
      const columnsChannel = supabase
        .channel("columns-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "columns",
          },
          (payload) => {
            console.log("🔄 Column change detected:", payload)
            // Force immediate refetch
            setTimeout(() => fetchBoards(), 100)
          },
        )
        .subscribe()

      // Subscribe to cards changes
      const cardsChannel = supabase
        .channel("cards-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "cards",
          },
          (payload) => {
            console.log("🔄 Card change detected:", payload)
            // Force immediate refetch
            setTimeout(() => fetchBoards(), 100)
          },
        )
        .subscribe()

      channels = [boardsChannel, columnsChannel, cardsChannel]
    }

    setupRealtimeSubscriptions()

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel)
      })
    }
  }, [userId, fetchBoards])

  // Initial fetch
  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // Board operations
  const createBoard = useCallback(
    async (title: string, description?: string): Promise<Board | undefined> => {
      if (!userId) return undefined

      try {
        console.log("🔍 Creating board via API route:", { title, description })

        // Use the API route instead of direct Supabase call
        const response = await fetch("/api/boards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description: description || "",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("❌ API route error:", errorData)
          setError(errorData.error || "Failed to create board")
          return undefined
        }

        const { board } = await response.json()
        console.log("✅ Board created successfully via API route:", board)

        // Optimistically add the board to local state
        const newBoard: Board = {
          id: board.id,
          title: board.title,
          description: board.description || "",
          createdAt: board.created_at,
          columns: [],
        }

        setBoards((prev) => [newBoard, ...prev])
        return newBoard
      } catch (err) {
        console.error("❌ Error creating board:", err)
        setError(err instanceof Error ? err.message : "Failed to create board")
        throw err
      }
    },
    [userId],
  )

  const updateBoard = useCallback(
    async (id: string, updates: Partial<Board>): Promise<Board | undefined> => {
      if (!userId) return undefined

      try {
        console.log("🔍 Updating board:", { id, updates })

        // Optimistically update local state
        setBoards((prev) => prev.map((board) => (board.id === id ? { ...board, ...updates } : board)))

        const { data, error } = await supabase
          .from("boards")
          .update({
            title: updates.title,
            description: updates.description,
          })
          .eq("id", id)
          .select()
          .single()

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return undefined
        }

        console.log("✅ Board updated successfully:", data)
        return data as Board
      } catch (err) {
        console.error("❌ Error updating board:", err)
        // Revert optimistic update on error
        fetchBoards()
        throw err
      }
    },
    [userId, fetchBoards],
  )

  const deleteBoard = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) return

      try {
        console.log("🔍 Deleting board:", id)

        // Optimistically remove from local state
        setBoards((prev) => prev.filter((board) => board.id !== id))

        const { error } = await supabase.from("boards").update({ is_archived: true }).eq("id", id)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }

        console.log("✅ Board deleted successfully")
      } catch (err) {
        console.error("❌ Error deleting board:", err)
        // Revert optimistic update on error
        fetchBoards()
        throw err
      }
    },
    [userId, fetchBoards],
  )

  // Column operations
  const createColumn = useCallback(
    async (boardId: string, title: string) => {
      if (!userId) return

      try {
        // Get max order
        const { data: columnsData } = await supabase
          .from("columns")
          .select("order")
          .eq("board_id", boardId)
          .order("order", { ascending: false })
          .limit(1)

        const maxOrder = columnsData && columnsData.length > 0 ? columnsData[0].order : -1

        // Optimistically add column to local state
        const tempId = `temp-${Date.now()}`
        const newColumn: Column = {
          id: tempId,
          title,
          boardId,
          cards: [],
          color: null,
          isCollapsed: false,
          cardLimit: null,
        }

        setBoards((prev) =>
          prev.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: [...board.columns, newColumn],
              }
            }
            return board
          }),
        )

        const { data, error } = await supabase
          .from("columns")
          .insert({
            title,
            board_id: boardId,
            order: maxOrder + 1,
          })
          .select()
          .single()

        if (error) {
          setError(error)
          // Revert optimistic update on error
          setBoards((prev) =>
            prev.map((board) => {
              if (board.id === boardId) {
                return {
                  ...board,
                  columns: board.columns.filter((col) => col.id !== tempId),
                }
              }
              return board
            }),
          )
          return
        }

        // Replace temp column with real data
        setBoards((prev) =>
          prev.map((board) => {
            if (board.id === boardId) {
              return {
                ...board,
                columns: board.columns.map((col) =>
                  col.id === tempId
                    ? {
                        id: data.id,
                        title: data.title,
                        boardId,
                        cards: [],
                        color: data.color,
                        isCollapsed: data.is_collapsed || false,
                        cardLimit: data.card_limit,
                      }
                    : col,
                ),
              }
            }
            return board
          }),
        )
      } catch (err) {
        console.error("Error creating column:", err)
      }
    },
    [userId],
  )

  const updateColumn = useCallback(
    async (columnId: string, updates: Partial<Column>) => {
      if (!userId) return

      try {
        // Optimistically update local state
        setBoards((prev) =>
          prev.map((board) => {
            const columnIndex = board.columns.findIndex((col) => col.id === columnId)
            if (columnIndex !== -1) {
              const updatedColumns = [...board.columns]
              updatedColumns[columnIndex] = {
                ...updatedColumns[columnIndex],
                ...updates,
              }
              return { ...board, columns: updatedColumns }
            }
            return board
          }),
        )

        const { error } = await supabase
          .from("columns")
          .update({
            title: updates.title,
            color: updates.color,
            is_collapsed: updates.isCollapsed,
            card_limit: updates.cardLimit,
          })
          .eq("id", columnId)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }
      } catch (err) {
        console.error("Error updating column:", err)
        // Revert optimistic update on error
        fetchBoards()
      }
    },
    [userId, fetchBoards],
  )

  const deleteColumn = useCallback(
    async (columnId: string) => {
      if (!userId) return

      try {
        // Optimistically remove from local state
        setBoards((prev) =>
          prev.map((board) => {
            const columnIndex = board.columns.findIndex((col) => col.id === columnId)
            if (columnIndex !== -1) {
              const updatedColumns = board.columns.filter((col) => col.id !== columnId)
              return { ...board, columns: updatedColumns }
            }
            return board
          }),
        )

        const { error } = await supabase.from("columns").delete().eq("id", columnId)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }
      } catch (err) {
        console.error("Error deleting column:", err)
        // Revert optimistic update on error
        fetchBoards()
      }
    },
    [userId, fetchBoards],
  )

  // Card operations
  const createCard = useCallback(
    async (columnId: string, title: string) => {
      if (!userId) return

      try {
        // Get max order
        const { data: cardsData } = await supabase
          .from("cards")
          .select("order")
          .eq("column_id", columnId)
          .order("order", { ascending: false })
          .limit(1)

        const maxOrder = cardsData && cardsData.length > 0 ? cardsData[0].order : -1

        // Optimistically add card to local state
        const tempId = `temp-${Date.now()}`
        const newCard: Card = {
          id: tempId,
          title,
          description: "",
          columnId,
          tags: [],
        }

        setBoards((prev) =>
          prev.map((board) => {
            const columnIndex = board.columns.findIndex((col) => col.id === columnId)
            if (columnIndex !== -1) {
              const updatedColumns = [...board.columns]
              updatedColumns[columnIndex].cards.push(newCard)
              return { ...board, columns: updatedColumns }
            }
            return board
          }),
        )

        const { data, error } = await supabase
          .from("cards")
          .insert({
            title,
            column_id: columnId,
            order: maxOrder + 1,
          })
          .select()
          .single()

        if (error) {
          setError(error)
          // Revert optimistic update on error
          setBoards((prev) =>
            prev.map((board) => {
              const columnIndex = board.columns.findIndex((col) => col.id === columnId)
              if (columnIndex !== -1) {
                const updatedColumns = [...board.columns]
                updatedColumns[columnIndex].cards = updatedColumns[columnIndex].cards.filter(
                  (card) => card.id !== tempId,
                )
                return { ...board, columns: updatedColumns }
              }
              return board
            }),
          )
          return
        }

        // Replace temp card with real data
        setBoards((prev) =>
          prev.map((board) => {
            const columnIndex = board.columns.findIndex((col) => col.id === columnId)
            if (columnIndex !== -1) {
              const updatedColumns = [...board.columns]
              updatedColumns[columnIndex].cards = updatedColumns[columnIndex].cards.map((card) =>
                card.id === tempId
                  ? {
                      id: data.id,
                      title: data.title,
                      description: data.description || "",
                      columnId,
                      tags: [],
                    }
                  : card,
              )
              return { ...board, columns: updatedColumns }
            }
            return board
          }),
        )
      } catch (err) {
        console.error("Error creating card:", err)
      }
    },
    [userId],
  )

  const updateCard = useCallback(
    async (cardId: string, updates: Partial<Card>) => {
      if (!userId) return

      try {
        // Optimistically update local state
        setBoards((prev) =>
          prev.map((board) => {
            const updatedBoard = { ...board }

            for (let i = 0; i < updatedBoard.columns.length; i++) {
              const cardIndex = updatedBoard.columns[i].cards.findIndex((card) => card.id === cardId)
              if (cardIndex !== -1) {
                updatedBoard.columns[i].cards[cardIndex] = {
                  ...updatedBoard.columns[i].cards[cardIndex],
                  ...updates,
                }
                break
              }
            }

            return updatedBoard
          }),
        )

        const { error } = await supabase
          .from("cards")
          .update({
            title: updates.title,
            description: updates.description,
            due_date: updates.dueDate,
            assigned_user_id: updates.assignedUser?.id,
            priority: updates.priority,
            estimated_hours: updates.estimatedHours,
            actual_hours: updates.actualHours,
            is_completed: updates.isCompleted,
          })
          .eq("id", cardId)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }
      } catch (err) {
        console.error("Error updating card:", err)
        // Revert optimistic update on error
        fetchBoards()
      }
    },
    [userId, fetchBoards],
  )

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!userId) return

      try {
        // Optimistically remove from local state
        setBoards((prev) =>
          prev.map((board) => {
            const updatedBoard = { ...board }

            for (let i = 0; i < updatedBoard.columns.length; i++) {
              const cardIndex = updatedBoard.columns[i].cards.findIndex((card) => card.id === cardId)
              if (cardIndex !== -1) {
                updatedBoard.columns[i].cards = updatedBoard.columns[i].cards.filter((card) => card.id !== cardId)
                break
              }
            }

            return updatedBoard
          }),
        )

        const { error } = await supabase.from("cards").delete().eq("id", cardId)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }
      } catch (err) {
        console.error("Error deleting card:", err)
        // Revert optimistic update on error
        fetchBoards()
      }
    },
    [userId, fetchBoards],
  )

  const moveCard = useCallback(
    async (cardId: string, newColumnId: string) => {
      if (!userId) return

      try {
        // Optimistically update local state first
        setBoards((prev) => {
          return prev.map((board) => {
            const updatedBoard = { ...board }
            let movedCard: Card | null = null

            // Find and remove the card from its current column
            for (let i = 0; i < updatedBoard.columns.length; i++) {
              const cardIndex = updatedBoard.columns[i].cards.findIndex((card) => card.id === cardId)
              if (cardIndex !== -1) {
                movedCard = updatedBoard.columns[i].cards[cardIndex]
                updatedBoard.columns[i].cards = updatedBoard.columns[i].cards.filter((card) => card.id !== cardId)
                break
              }
            }

            // Add the card to the new column
            if (movedCard) {
              const newColumnIndex = updatedBoard.columns.findIndex((col) => col.id === newColumnId)
              if (newColumnIndex !== -1) {
                updatedBoard.columns[newColumnIndex].cards.push({
                  ...movedCard,
                  columnId: newColumnId,
                })
              }
            }

            return updatedBoard
          })
        })

        // Get max order in the new column
        const { data: cardsData } = await supabase
          .from("cards")
          .select("order")
          .eq("column_id", newColumnId)
          .order("order", { ascending: false })
          .limit(1)

        const maxOrder = cardsData && cardsData.length > 0 ? cardsData[0].order : -1

        // Update the card in database
        const { error } = await supabase
          .from("cards")
          .update({
            column_id: newColumnId,
            order: maxOrder + 1,
          })
          .eq("id", cardId)

        if (error) {
          setError(error)
          // Revert optimistic update on error
          fetchBoards()
          return
        }
      } catch (err) {
        console.error("Error moving card:", err)
        // Revert optimistic update on error
        fetchBoards()
      }
    },
    [userId, fetchBoards],
  )

  // Data management
  const clearUserData = useCallback(async () => {
    if (!userId) return

    try {
      // Archive all boards instead of deleting
      const { error } = await supabase.from("boards").update({ is_archived: true }).eq("user_id", userId)

      if (error) {
        setError(error)
        return
      }

      // Update local state
      setBoards([])
    } catch (err) {
      console.error("Error clearing user data:", err)
    }
  }, [userId])

  const exportUserData = useCallback(() => {
    if (!userId || !boards) return ""

    const exportData = {
      boards,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    return JSON.stringify(exportData, null, 2)
  }, [userId, boards])

  const importUserData = useCallback(
    async (data: string) => {
      if (!userId) return false

      try {
        const parsedData = JSON.parse(data)
        if (!parsedData.boards || !Array.isArray(parsedData.boards)) {
          return false
        }

        // Import boards one by one
        for (const board of parsedData.boards) {
          // Create board
          const { data: boardData, error: boardError } = await supabase
            .from("boards")
            .insert({
              title: board.title,
              description: board.description || "",
              user_id: userId,
            })
            .select()
            .single()

          if (boardError) {
            console.error("Error importing board:", boardError)
            continue
          }

          // Create columns
          for (const column of board.columns) {
            const { data: columnData, error: columnError } = await supabase
              .from("columns")
              .insert({
                title: column.title,
                board_id: boardData.id,
                order: column.order || 0,
                color: column.color,
              })
              .select()
              .single()

            if (columnError) {
              console.error("Error importing column:", columnError)
              continue
            }

            // Create cards
            for (const card of column.cards) {
              const { data: cardData, error: cardError } = await supabase
                .from("cards")
                .insert({
                  title: card.title,
                  description: card.description || "",
                  column_id: columnData.id,
                  order: card.order || 0,
                  due_date: card.dueDate,
                  priority: card.priority || "medium",
                  is_completed: card.isCompleted || false,
                })
                .select()
                .single()

              if (cardError) {
                console.error("Error importing card:", cardError)
                continue
              }

              // Import tags
              if (card.tags && Array.isArray(card.tags)) {
                for (const tag of card.tags) {
                  // Check if tag exists
                  const { data: existingTags } = await supabase
                    .from("tags")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("name", tag.name)
                    .eq("color", tag.color)

                  let tagId
                  if (existingTags && existingTags.length > 0) {
                    tagId = existingTags[0].id
                  } else {
                    // Create tag
                    const { data: tagData, error: tagError } = await supabase
                      .from("tags")
                      .insert({
                        name: tag.name,
                        color: tag.color,
                        user_id: userId,
                      })
                      .select()
                      .single()

                    if (tagError) {
                      console.error("Error importing tag:", tagError)
                      continue
                    }

                    tagId = tagData.id
                  }

                  // Associate tag with card
                  await supabase.from("card_tags").insert({
                    card_id: cardData.id,
                    tag_id: tagId,
                  })
                }
              }
            }
          }
        }

        // Refetch boards
        fetchBoards()
        return true
      } catch (err) {
        console.error("Error importing data:", err)
        return false
      }
    },
    [userId, fetchBoards],
  )

  // Ensure user boards
  const ensureUserBoards = useCallback(() => {
    fetchBoards()
  }, [fetchBoards])

  return {
    boards,
    isLoaded,
    isLoading,
    error,
    updateCounter, // Add this
    forceUpdate, // Add this
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
    clearUserData,
    exportUserData,
    importUserData,
    ensureUserBoards,
    refetch: fetchBoards,
  }
}
