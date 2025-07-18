"use client"

import type React from "react"
import { useState } from "react"
import type { Card } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CardEditDialog } from "./card-edit-dialog"
import { useUserBoards } from "@/hooks/use-user-boards"

interface CardComponentProps {
  card: Card
}

export function CardComponent({ card }: CardComponentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { deleteCard, updateCounter } = useUserBoards()

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", card.id)
  }

  const handleDeleteCard = async () => {
    if (confirm("Are you sure you want to delete this card?")) {
      await deleteCard(card.id)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  console.log("CardComponent render - card:", card.id, "updateCounter:", updateCounter)

  return (
    <>
      <div
        className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm border dark:border-slate-600 cursor-move hover:shadow-md transition-shadow group"
        draggable
        onDragStart={handleDragStart}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight flex-1 pr-2">{card.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteCard} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {card.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{card.description}</p>
        )}

        <div className="space-y-2">
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              {card.dueDate && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {card.assignedUser && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{card.assignedUser.name}</span>
                </div>
              )}
            </div>

            {card.priority && (
              <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(card.priority)}`}>{card.priority}</Badge>
            )}
          </div>
        </div>
      </div>

      <CardEditDialog card={card} open={showEditDialog} onOpenChange={setShowEditDialog} />
    </>
  )
}
