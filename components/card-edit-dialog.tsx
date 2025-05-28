"use client"

import { useState } from "react"
import type { Card as CardType, Tag, User } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Trash2, Calendar, UserIcon, TagIcon } from "lucide-react"
import { useUserBoards } from "@/hooks/use-user-boards"
import { useAuthStore } from "@/store/auth-store"

interface CardEditDialogProps {
  card: CardType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardEditDialog({ card, open, onOpenChange }: CardEditDialogProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || "")
  const [dueDate, setDueDate] = useState(card.dueDate || "")
  const [tags, setTags] = useState<Tag[]>(card.tags)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3b82f6")
  const [assignedUser, setAssignedUser] = useState<User | undefined>(card.assignedUser)
  const { updateCard, deleteCard } = useUserBoards()
  const { currentUser } = useAuthStore()

  // Mock users for assignment (in a real app, this would come from your user management system)
  const availableUsers: User[] = [
    currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : null,
    { id: "user-2", name: "Jane Smith", email: "jane@example.com" },
    { id: "user-3", name: "Mike Johnson", email: "mike@example.com" },
    { id: "user-4", name: "Sarah Wilson", email: "sarah@example.com" },
  ].filter(Boolean) as User[]

  const predefinedColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#ec4899", // pink
    "#6b7280", // gray
  ]

  const handleSave = () => {
    updateCard(card.id, {
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      tags,
      assignedUser,
    })
    onOpenChange(false)
  }

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
      }
      setTags([...tags, newTag])
      setNewTagName("")
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId))
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id)
      onOpenChange(false)
    }
  }

  const handleAssignUser = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId)
    setAssignedUser(user)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Edit Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Card Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Due Date and User Assignment Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
              />
              {dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate("")}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear date
                </Button>
              )}
            </div>

            {/* User Assignment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Assign to
              </Label>
              <Select value={assignedUser?.id || ""} onValueChange={handleAssignUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>

            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 text-sm"
                    style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" }}
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button onClick={handleAddTag} size="icon" disabled={!newTagName.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Tag Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newTagColor === color
                          ? "border-gray-900 dark:border-white scale-110"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-8 h-8 p-0 border-2 rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Card
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
