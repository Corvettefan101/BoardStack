export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Card {
  id: string
  title: string
  description?: string
  dueDate?: string
  assignedUser?: User
  tags: Tag[]
  columnId: string
}

export interface Column {
  id: string
  title: string
  cards: Card[]
  boardId: string
}

export interface Board {
  id: string
  title: string
  columns: Column[]
  createdAt: string
}
