"use client"
import { useState, useEffect } from "react"
import type { Board } from "@/types"
import { BoardCard } from "./board-card"
import { CreateBoardDialog } from "./create-board-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface BoardGridProps {
  boards: Board[]
}

export function BoardGrid({ boards }: BoardGridProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  // Force re-render when boards change
  useEffect(() => {
    setRenderKey((prev) => prev + 1)
  }, [boards, boards.length])

  return (
    <>
      <div key={renderKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
          <BoardCard key={`${board.id}-${board.title}-${board.columns?.length || 0}-${renderKey}`} board={board} />
        ))}

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            className="h-32 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 bg-transparent"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Board
          </Button>
        </div>
      </div>

      <CreateBoardDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
