"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Column } from "@/types"
import { CardComponent } from "./card-component"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MoreHorizontal } from "lucide-react"
import { useUserBoards } from "@/hooks/use-user-boards"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ColumnComponentProps {
  column: Column
}

export function ColumnComponent({ column }: ColumnComponentProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [localColumn, setLocalColumn] = useState(column)
  const { createCard, updateColumn, deleteColumn, moveCard } = useUserBoards()

  // Update local column state when prop changes
  useEffect(() => {
    console.log("ColumnComponent - Column prop changed:", column.id, column.cards?.length)
    setLocalColumn(column)
    setEditTitle(column.title)
  }, [column, column.cards, column.cards?.length, column.title])

  const handleAddCard = async () => {
    if (newCardTitle.trim()) {
      await createCard(column.id, newCardTitle.trim())
      setNewCardTitle("")
      setShowAddCard(false)
    }
  }

  const handleUpdateTitle = async () => {
    if (editTitle.trim()) {
      await updateColumn(column.id, { title: editTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData("text/plain")
    if (cardId) {
      await moveCard(cardId, column.id)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div
      className="flex-shrink-0 w-80 bg-gray-100 dark:bg-slate-800 rounded-lg p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        {isEditingTitle ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
            className="font-semibold text-gray-900 bg-transparent border-none p-0 h-auto"
            autoFocus
          />
        ) : (
          <h3
            className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => setIsEditingTitle(true)}
          >
            {localColumn.title} ({localColumn.cards?.length || 0})
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>Edit Title</DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteColumn(column.id)} className="text-red-600">
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3 mb-4">
        {localColumn.cards?.map((card) => (
          <CardComponent key={card.id} card={card} />
        ))}
      </div>

      {showAddCard ? (
        <div className="space-y-2">
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
            autoFocus
          />
          <div className="flex space-x-2">
            <Button onClick={handleAddCard} size="sm">
              Add Card
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddCard(false)
                setNewCardTitle("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          onClick={() => setShowAddCard(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a card
        </Button>
      )}
    </div>
  )
}
