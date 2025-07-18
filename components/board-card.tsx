"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import type { Board } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Calendar, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUserBoards } from "@/hooks/use-user-boards"

interface BoardCardProps {
  board: Board
}

export function BoardCard({ board }: BoardCardProps) {
  const { deleteBoard } = useUserBoards()
  const [isDeleting, setIsDeleting] = useState(false)
  const [cardCount, setCardCount] = useState(0)

  // Calculate total cards
  useEffect(() => {
    const totalCards = board.columns?.reduce((total, column) => total + (column.cards?.length || 0), 0) || 0
    setCardCount(totalCards)
  }, [board.columns])

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      setIsDeleting(true)
      try {
        await deleteBoard(board.id)
      } catch (error) {
        console.error("Failed to delete board:", error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/board/${board.id}`} className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {board.title}
            </CardTitle>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/board/${board.id}`}>Open Board</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Board"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {board.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{board.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`/board/${board.id}`}>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {board.columns?.length || 0} columns
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {cardCount} cards
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {board.columns?.slice(0, 3).map((column) => (
              <Badge key={`${column.id}-${column.cards?.length || 0}`} variant="secondary" className="text-xs">
                {column.title} ({column.cards?.length || 0})
              </Badge>
            ))}
            {(board.columns?.length || 0) > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{(board.columns?.length || 0) - 3} more
              </Badge>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
