"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/lib/convex-api"
import { mockConvexFunctions } from "@/lib/mock-convex-functions"

// Create context for our mock Convex client
interface ConvexContextType {
  useQuery: <T>(queryName: string, args?: any) => T | undefined
  useMutation: <T>(mutationName: string) => (args: any) => Promise<T>
}

const ConvexContext = createContext<ConvexContextType | null>(null)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mock implementation of useQuery
  function useQuery<T>(queryName: string, args: any = "skip"): T | undefined {
    const [data, setData] = useState<T | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      if (!isClient || args === "skip") return

      const fetchData = async () => {
        try {
          let result

          // Route to the appropriate mock function
          if (queryName === api.boards.getBoards) {
            result = await mockConvexFunctions.boards.getBoards(args)
          } else if (queryName === api.users.getUser) {
            result = await mockConvexFunctions.users.getUser(args)
          } else if (queryName === api.activities.getBoardActivities) {
            result = await mockConvexFunctions.activities.getBoardActivities(args)
          } else if (queryName === api.activities.getUserActivities) {
            result = await mockConvexFunctions.activities.getUserActivities(args)
          } else if (queryName === api.notifications.getUserNotifications) {
            result = await mockConvexFunctions.notifications.getUserNotifications(args)
          } else if (queryName === api.tags.getUserTags) {
            result = await mockConvexFunctions.tags.getUserTags(args)
          } else {
            result = undefined
          }

          setData(result as T)
        } catch (error) {
          console.error("Error in useQuery:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }, [queryName, JSON.stringify(args), isClient])

    return data
  }

  // Mock implementation of useMutation
  function useMutation<T>(mutationName: string) {
    return async (args: any): Promise<T> => {
      try {
        let result

        // Route to the appropriate mock function
        if (mutationName === api.users.signup) {
          result = await mockConvexFunctions.users.signup(args)
        } else if (mutationName === api.users.login) {
          result = await mockConvexFunctions.users.login(args)
        } else if (mutationName === api.users.updateProfile) {
          result = await mockConvexFunctions.users.updateProfile(args)
        } else if (mutationName === api.users.changePassword) {
          result = await mockConvexFunctions.users.changePassword(args)
        } else if (mutationName === api.users.deleteAccount) {
          result = await mockConvexFunctions.users.deleteAccount(args)
        } else if (mutationName === api.boards.createBoard) {
          result = await mockConvexFunctions.boards.createBoard(args)
        } else if (mutationName === api.boards.updateBoard) {
          result = await mockConvexFunctions.boards.updateBoard(args)
        } else if (mutationName === api.boards.deleteBoard) {
          result = await mockConvexFunctions.boards.deleteBoard(args)
        } else if (mutationName === api.columns.createColumn) {
          result = await mockConvexFunctions.columns.createColumn(args)
        } else if (mutationName === api.columns.updateColumn) {
          result = await mockConvexFunctions.columns.updateColumn(args)
        } else if (mutationName === api.columns.deleteColumn) {
          result = await mockConvexFunctions.columns.deleteColumn(args)
        } else if (mutationName === api.cards.createCard) {
          result = await mockConvexFunctions.cards.createCard(args)
        } else if (mutationName === api.cards.updateCard) {
          result = await mockConvexFunctions.cards.updateCard(args)
        } else if (mutationName === api.cards.moveCard) {
          result = await mockConvexFunctions.cards.moveCard(args)
        } else if (mutationName === api.cards.deleteCard) {
          result = await mockConvexFunctions.cards.deleteCard(args)
        } else if (mutationName === api.migration.migrateUserData) {
          result = await mockConvexFunctions.migration.migrateUserData(args)
        } else if (mutationName === api.notifications.markNotificationAsRead) {
          result = await mockConvexFunctions.notifications.markNotificationAsRead(args)
        } else if (mutationName === api.notifications.markAllNotificationsAsRead) {
          result = await mockConvexFunctions.notifications.markAllNotificationsAsRead(args)
        } else if (mutationName === api.notifications.deleteNotification) {
          result = await mockConvexFunctions.notifications.deleteNotification(args)
        } else if (mutationName === api.tags.createTag) {
          result = await mockConvexFunctions.tags.createTag(args)
        } else if (mutationName === api.tags.addTagToCard) {
          result = await mockConvexFunctions.tags.addTagToCard(args)
        } else if (mutationName === api.tags.removeTagFromCard) {
          result = await mockConvexFunctions.tags.removeTagFromCard(args)
        } else if (mutationName === api.tags.deleteTag) {
          result = await mockConvexFunctions.tags.deleteTag(args)
        } else {
          result = { success: true }
        }

        return result as T
      } catch (error) {
        console.error("Error in useMutation:", error)
        throw error
      }
    }
  }

  return <ConvexContext.Provider value={{ useQuery, useMutation }}>{children}</ConvexContext.Provider>
}

// Export hooks that match the Convex API
export function useQuery<T>(queryName: string, args?: any): T | undefined {
  const context = useContext(ConvexContext)
  if (!context) {
    throw new Error("useQuery must be used within ConvexClientProvider")
  }
  return context.useQuery<T>(queryName, args)
}

export function useMutation<T>(mutationName: string) {
  const context = useContext(ConvexContext)
  if (!context) {
    throw new Error("useMutation must be used within ConvexClientProvider")
  }
  return context.useMutation<T>(mutationName)
}
