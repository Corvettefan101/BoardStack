"use client"

import type React from "react"
import { useState } from "react"
import type { Card as CardType } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Calendar, User } from "lucide-react"
import { CardEditDialog } from "./card-edit-dialog"

interface CardComponentProps {
  card: CardType
}

export function CardComponent({ card }: CardComponentProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", card.id)
  }

  return (
    <>
      <Card
        className="cursor-move hover:shadow-md transition-shadow bg-white dark:bg-slate-700 group"
        draggable
        onDragStart={handleDragStart}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight flex-1">{card.title}</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>

          {card.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{card.description}</p>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {card.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                  style={{ backgroundColor: tag.color + "20", color: tag.color }}
                >
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
                  {new Date(card.dueDate).toLocaleDateString()}
                </div>
              )}
              {card.assignedUser && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {card.assignedUser.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CardEditDialog card={card} open={showEditDialog} onOpenChange={setShowEditDialog} />
    </>
  )
}
