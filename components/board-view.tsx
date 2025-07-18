"use client"

import type React from "react"
import { useState } from "react"
import type { Board } from "@/types"
import { ColumnComponent } from "./column-component"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useUserBoards } from "@/hooks/use-user-boards"
import { Input } from "@/components/ui/input"

interface BoardViewProps {
  board: Board
}

export function BoardView({ board }: BoardViewProps) {
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const { createColumn } = useUserBoards()

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      console.log("BoardView - Creating column:", newColumnTitle)
      await createColumn(board.id, newColumnTitle.trim())
      setNewColumnTitle("")
      setShowAddColumn(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6" onDragOver={handleDragOver}>
      {board.columns?.map((column) => (
        <ColumnComponent key={column.id} column={column} />
      ))}

      <div className="flex-shrink-0 w-80">
        {showAddColumn ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border dark:border-slate-700">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Enter column title..."
              className="mb-3"
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddColumn} size="sm">
                Add Column
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddColumn(false)
                  setNewColumnTitle("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={() => setShowAddColumn(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </Button>
        )}
      </div>
    </div>
  )
}
