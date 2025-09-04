'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TodoItem } from './TodoItem'
import { Todo } from '@/types'
import { GripVertical } from 'lucide-react'

interface SortableTodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
}

export function SortableTodoItem({ todo, onEdit }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <div className="group relative">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </div>
        
        {/* Todo Item with left padding for drag handle */}
        <div className="pl-8">
          <TodoItem 
            todo={todo} 
            onEdit={onEdit}
            isDragging={isDragging}
          />
        </div>
      </div>
    </div>
  )
}