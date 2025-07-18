"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUserBoards } from "@/hooks/use-user-boards"
import { CreateBoardDialog } from "./create-board-dialog"

export function BoardGrid() {
  const { boards, deleteBoard } = useUserBoards()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleDeleteBoard = async (boardId: string) => {
    if (confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      await deleteBoard(boardId)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map((board) => (
          <Card
            key={board.id}
            className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 dark:bg-slate-800/80 backdrop-blur"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Link href={`/board/${board.id}`} className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {board.title}
                  </h3>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteBoard(board.id)} className="text-red-600">
                      Delete Board
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {board.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{board.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{board.columns?.length || 0} columns</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {board.columns?.reduce((total, col) => total + (col.cards?.length || 0), 0) || 0} cards
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="group hover:shadow-lg transition-all duration-200 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-transparent">
          <CardContent className="p-6 flex items-center justify-center h-full min-h-[200px]">
            <Button
              variant="ghost"
              className="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-8 h-8" />
              <span>Create New Board</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreateBoardDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
