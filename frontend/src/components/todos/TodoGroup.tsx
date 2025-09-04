'use client'

import { Todo } from '@/types'
import { TodoItem } from './TodoItem'
import { Calendar } from 'lucide-react'

interface TodoGroupProps {
  dateLabel: string
  todos: Todo[]
  onEdit: (todo: Todo) => void
}

export function TodoGroup({ dateLabel, todos, onEdit }: TodoGroupProps) {
  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex items-center gap-2 py-2 px-1">
        <Calendar className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {dateLabel}
        </h3>
        <div className="flex-1 h-px bg-gray-200 ml-2"></div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Todo Items */}
      <div className="space-y-2 pl-6">
        {todos.map((todo) => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onEdit={onEdit}
            showCreatedDate={false} // Don't show individual dates since we're grouping
          />
        ))}
      </div>
    </div>
  )
}