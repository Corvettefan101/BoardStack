"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useUserBoards } from "@/hooks/use-user-boards"
import { BoardView } from "@/components/board-view"
import { LoadingScreen } from "@/components/loading-screen"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const { currentUser, isLoading: authLoading } = useAuth()
  const { boards, isLoading, error, refetch } = useUserBoards()
  const [refreshing, setRefreshing] = useState(false)

  const boardId = params.id as string
  const board = boards.find((b) => b.id === boardId)

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
    console.log(
      "BoardPage - Board data updated:",
      board?.id,
      board?.columns?.length,
      board?.columns?.map((c) => c.cards?.length),
    )
  }, [board])

  if (authLoading || isLoading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    router.push("/login")
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Board</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{typeof error === "string" ? error : error.message}</p>
          <div className="space-x-4">
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Board Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The board you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="border-b bg-white dark:bg-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{board.title}</h1>
              {board.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{board.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <BoardView
          key={`board-${board.id}-${board.columns?.length || 0}-${board.columns?.map((c) => `${c.id}-${c.cards?.length || 0}`).join("-")}`}
          board={board}
        />
      </div>
    </div>
  )
}
