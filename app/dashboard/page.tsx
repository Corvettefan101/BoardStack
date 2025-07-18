"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BoardGrid } from "@/components/board-grid"
import { LoadingScreen } from "@/components/loading-screen"
import { ProtectedRoute } from "@/components/protected-route"
import { useUserBoards } from "@/hooks/use-user-boards"

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false)
  const { boards, isLoaded, ensureUserBoards, updateCounter } = useUserBoards()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && isLoaded) {
      ensureUserBoards()
    }
  }, [isClient, isLoaded, ensureUserBoards])

  console.log("Dashboard render - boards:", boards.length, "updateCounter:", updateCounter)

  if (!isClient || !isLoaded) {
    return <LoadingScreen />
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Boards</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your projects and boost productivity ({boards.length} boards)
            </p>
          </div>
          <BoardGrid key={updateCounter} />
        </main>
      </div>
    </ProtectedRoute>
  )
}
