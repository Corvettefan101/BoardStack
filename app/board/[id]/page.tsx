"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { BoardView } from "@/components/board-view"
import { LoadingScreen } from "@/components/loading-screen"
import { ProtectedRoute } from "@/components/protected-route"
import { useUserBoards } from "@/hooks/use-user-boards"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BoardPage() {
  const [isClient, setIsClient] = useState(false)
  const params = useParams()
  const boardId = params.id as string
  const { boards, isLoaded, ensureUserBoards, forceRender } = useUserBoards()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && isLoaded) {
      ensureUserBoards()
    }
  }, [isClient, isLoaded, ensureUserBoards])

  const board = boards.find((b) => b.id === boardId)

  useEffect(() => {
    console.log("BoardPage - Board state updated:", board?.id, board?.columns?.length, "forceRender:", forceRender)
  }, [board, forceRender])

  if (!isClient || !isLoaded) {
    return <LoadingScreen />
  }

  if (!board) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Board not found</h1>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {board.title} ({board.columns?.length || 0} columns)
            </h1>
          </div>
          <BoardView key={`board-view-${forceRender}`} board={board} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
