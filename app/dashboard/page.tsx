"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUserBoards } from "@/hooks/use-user-boards"
import { BoardGrid } from "@/components/board-grid"
import { LoadingScreen } from "@/components/loading-screen"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth()
  const { boards, isLoading, error, refetch } = useUserBoards()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  // Debug logging
  useEffect(() => {
    console.log("Dashboard - Boards updated:", boards.length, boards)
  }, [boards])

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in</h1>
          <p className="text-gray-600 dark:text-gray-300">You need to be logged in to view your boards.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Boards</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{typeof error === "string" ? error : error.message}</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser.name || currentUser.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {boards.length === 0
              ? "Create your first board to get started"
              : `You have ${boards.length} board${boards.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <BoardGrid
        key={`boards-${boards.length}-${boards.map((b) => `${b.id}-${b.columns?.length || 0}`).join("-")}`}
        boards={boards}
      />
    </div>
  )
}
