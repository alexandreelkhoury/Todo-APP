'use client'

import { useState, useMemo } from 'react'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { DraggableTaskList } from './DraggableTaskList'
import { ShareActions } from './ShareActions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTodos, useTodoStats } from '@/hooks/useTodos'
import { Todo, Priority, TodoQueryParams } from '@/types'
import { 
  Plus, 
  Search, 
  Filter,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

export function TodoList() {
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate' | 'title'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Build query parameters for incomplete todos
  const incompleteQueryParams = useMemo<TodoQueryParams>(() => ({
    search: debouncedSearchTerm || undefined,
    completed: false,
    priority: selectedPriority || undefined,
    sortBy,
    sortOrder,
    limit: 50,
  }), [debouncedSearchTerm, selectedPriority, sortBy, sortOrder])

  // Build query parameters for completed todos
  const completedQueryParams = useMemo<TodoQueryParams>(() => ({
    search: debouncedSearchTerm || undefined,
    completed: true,
    priority: selectedPriority || undefined,
    sortBy,
    sortOrder,
    limit: 50,
  }), [debouncedSearchTerm, selectedPriority, sortBy, sortOrder])

  const { data: incompleteTodosResponse, isLoading: incompleteLoading, error: incompleteError } = useTodos(incompleteQueryParams)
  const { data: completedTodosResponse, isLoading: completedLoading, error: completedError } = useTodos(completedQueryParams)
  const { data: stats } = useTodoStats()

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTodo(undefined)
  }

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (incompleteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (incompleteError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load tasks. Please try again.</p>
      </div>
    )
  }

  const incompleteTodos = incompleteTodosResponse?.todos || []
  const completedTodos = showCompleted ? (completedTodosResponse?.todos || []) : []

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--accent-secondary)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Total</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600 font-medium">High Priority</p>
                <p className="text-2xl font-bold text-red-700">{stats.priority.high}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button and Share Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Tasks</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {incompleteTodos.length} active, {stats?.completed || 0} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ShareActions 
            todos={incompleteTodos} 
            completedTodos={completedTodos}
            stats={stats}
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            className="px-3 py-1.5 text-sm border rounded-lg bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
          >
            <option value="">All Priorities</option>
            <option value={Priority.HIGH}>High Priority</option>
            <option value={Priority.MEDIUM}>Medium Priority</option>
            <option value={Priority.LOW}>Low Priority</option>
          </select>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sort:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSort('createdAt')}
              className="gap-1"
            >
              Date
              {sortBy === 'createdAt' && (
                sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSort('priority')}
              className="gap-1"
            >
              Priority
              {sortBy === 'priority' && (
                sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSort('title')}
              className="gap-1"
            >
              Title
              {sortBy === 'title' && (
                sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="space-y-3">
        {incompleteTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Square className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No active tasks
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Create your first task to get started.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Task
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                Active Tasks ({incompleteTodos.length})
              </h2>
            </div>
            <DraggableTaskList
              tasks={incompleteTodos}
              onEdit={handleEditTodo}
              onReorder={(reorderedTasks) => {
                // Handle reorder - for now just update local state
                // In a more complex app, you might want to persist this to user preferences
                console.log('Tasks reordered:', reorderedTasks.map(t => t.title))
              }}
            />
          </>
        )}
      </div>

      {/* Completed Tasks Section */}
      {stats && stats.completed > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Completed Tasks ({stats.completed})
              </span>
            </div>
            {showCompleted ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {showCompleted && (
            <div className="mt-4 space-y-3">
              {completedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : completedError ? (
                <div className="text-center py-4">
                  <p className="text-red-600 text-sm">Failed to load completed tasks.</p>
                </div>
              ) : completedTodos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No completed tasks match your filters.</p>
                </div>
              ) : (
                completedTodos.map((todo) => (
                  <div key={todo.id} className="opacity-75">
                    <TodoItem todo={todo} onEdit={handleEditTodo} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TodoForm todo={editingTodo} onClose={handleCloseForm} />
      )}
    </div>
  )
}