'use client'

import { useState } from 'react'
import { Todo, Priority } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTodoMutations } from '@/hooks/useTodos'
import { formatDate } from '@/lib/utils'
import {
  Check,
  Clock,
  Pin,
  PinOff,
  Edit,
  Trash2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  isDragging?: boolean
}

const priorityConfig = {
  HIGH: {
    style: {
      color: 'var(--priority-high)',
      backgroundColor: 'var(--priority-high-bg)',
      borderColor: 'var(--priority-high)'
    },
    icon: ChevronUp,
    label: 'High Priority',
  },
  MEDIUM: {
    style: {
      color: 'var(--priority-medium)',
      backgroundColor: 'var(--priority-medium-bg)',
      borderColor: 'var(--priority-medium)'
    },
    icon: AlertCircle,
    label: 'Medium Priority',
  },
  LOW: {
    style: {
      color: 'var(--priority-low)',
      backgroundColor: 'var(--priority-low-bg)',
      borderColor: 'var(--priority-low)'
    },
    icon: ChevronDown,
    label: 'Low Priority',
  },
}

export function TodoItem({ todo, onEdit, isDragging = false }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toggleComplete, togglePin, deleteTodo } = useTodoMutations()

  const handleToggleComplete = () => {
    toggleComplete.mutate(todo.id)
  }

  const handleTogglePin = () => {
    togglePin.mutate(todo.id)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTodo.mutate(todo.id)
    }
  }

  const handleEdit = () => {
    onEdit(todo)
  }

  const priorityInfo = priorityConfig[todo.priority]
  const PriorityIcon = priorityInfo.icon
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        todo.completed && 'opacity-75',
        todo.isPinned && 'ring-2 ring-blue-200 border-blue-300',
        isOverdue && 'ring-2 ring-red-200 border-red-300',
        isDragging && 'shadow-lg scale-105 opacity-95'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete Checkbox */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'mt-1 h-6 w-6 rounded-full border-2 p-0',
              todo.completed
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                : 'border-gray-300 hover:border-gray-400'
            )}
            onClick={handleToggleComplete}
            disabled={toggleComplete.isPending}
          >
            {todo.completed && <Check className="h-3 w-3" />}
          </Button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    'font-medium cursor-pointer text-gray-900',
                    todo.completed && 'line-through text-gray-500'
                  )}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {todo.title}
                </h3>
                
                {/* Priority and Due Date */}
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border"
                    style={priorityInfo.style}
                  >
                    <PriorityIcon className="h-3 w-3" />
                    {priorityInfo.label}
                  </span>
                  
                  {todo.dueDate && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full',
                        isOverdue
                          ? 'text-red-600 bg-red-50'
                          : 'text-gray-600 bg-gray-50'
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {formatDate(todo.dueDate)}
                    </span>
                  )}
                </div>

                {/* Description - expanded */}
                {isExpanded && todo.description && (
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {todo.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Pin Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0',
                    todo.isPinned && 'text-blue-600'
                  )}
                  onClick={handleTogglePin}
                  disabled={togglePin.isPending}
                  title={todo.isPinned ? 'Unpin' : 'Pin'}
                >
                  {todo.isPinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>

                {/* Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleEdit}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleteTodo.isPending}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-2 text-xs text-gray-500">
              Created {formatDate(todo.createdAt)}
              {todo.updatedAt !== todo.createdAt && (
                <span> • Updated {formatDate(todo.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}