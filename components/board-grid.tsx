"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUserBoards } from "@/hooks/use-user-boards"

export function BoardGrid() {
  const { boards, deleteBoard } = useUserBoards()

  return (
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
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => deleteBoard(board.id)} className="text-red-600">
                    Delete Board
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Created {new Date(board.createdAt).toLocaleDateString()}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{board.columns.length} columns</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {board.columns.reduce((total, col) => total + col.cards.length, 0)} cards
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
