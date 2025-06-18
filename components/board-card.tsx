import type React from "react"

interface Board {
  id: string
  title: string
  description: string
}

interface BoardCardProps {
  board: Board
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">{board.title}</h3>
      <p className="text-gray-600">{board.description}</p>
    </div>
  )
}

export default BoardCard
