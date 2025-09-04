'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { TodoGroup } from './TodoGroup'
import { DraggableTaskList } from './DraggableTaskList'
import { ShareActions } from './ShareActions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
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
  Share2,
  AlertCircle
} from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { LoadingSpinner, TodoSkeleton, StatsSkeleton } from '@/components/ui/LoadingSpinner'
import { groupTodosByDate } from '@/lib/dateUtils'

export function TodoList() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showTodayOnly, setShowTodayOnly] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [completedPage, setCompletedPage] = useState(1)
  const [completedItemsPerPage, setCompletedItemsPerPage] = useState(5)

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Build query parameters for incomplete todos
  const incompleteQueryParams = useMemo<TodoQueryParams>(() => ({
    search: debouncedSearchTerm || undefined,
    completed: false,
    priority: selectedPriority || undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  }), [debouncedSearchTerm, selectedPriority, sortBy, sortOrder, currentPage, itemsPerPage])

  // Build query parameters for completed todos
  const completedQueryParams = useMemo<TodoQueryParams>(() => ({
    search: debouncedSearchTerm || undefined,
    completed: true,
    priority: selectedPriority || undefined,
    sortBy,
    sortOrder,
    page: completedPage,
    limit: completedItemsPerPage,
  }), [debouncedSearchTerm, selectedPriority, sortBy, sortOrder, completedPage, completedItemsPerPage])

  const { data: incompleteTodosResponse, isLoading: incompleteLoading, error: incompleteError } = useTodos(incompleteQueryParams)
  const { data: completedTodosResponse, isLoading: completedLoading, error: completedError } = useTodos(completedQueryParams)
  const { data: stats } = useTodoStats()

  // Helper function to check if a todo was created today
  const isCreatedToday = (todo: Todo) => {
    const todoDate = new Date(todo.createdAt)
    const today = new Date()
    return (
      todoDate.getDate() === today.getDate() &&
      todoDate.getMonth() === today.getMonth() &&
      todoDate.getFullYear() === today.getFullYear()
    )
  }

  // Process data immediately after hooks
  const allIncompleteTodos = incompleteTodosResponse?.todos || []
  const allCompletedTodos = showCompleted ? (completedTodosResponse?.todos || []) : []
  
  // Filter todos based on "Today Only" setting
  const incompleteTodos = showTodayOnly 
    ? allIncompleteTodos.filter(isCreatedToday)
    : allIncompleteTodos
  const completedTodos = showTodayOnly
    ? allCompletedTodos.filter(isCreatedToday)
    : allCompletedTodos
  
  // Group todos by date only when sorting by createdAt, otherwise use normal list
  const groupedIncompleteTodos = useMemo(() => {
    if (sortBy === 'createdAt') {
      return groupTodosByDate(incompleteTodos, sortOrder)
    }
    return null
  }, [incompleteTodos, sortBy, sortOrder])

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
    // Reset to first page when sorting changes
    setCurrentPage(1)
    setCompletedPage(1)
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1) // Reset to first page
  }

  const handleCompletedPageChange = (page: number) => {
    setCompletedPage(page)
  }

  const handleCompletedItemsPerPageChange = (items: number) => {
    setCompletedItemsPerPage(items)
    setCompletedPage(1) // Reset to first page
  }

  // Reset pagination when search or filters change
  const resetPagination = () => {
    setCurrentPage(1)
    setCompletedPage(1)
  }

  // Loading states with proper skeletons
  if (incompleteLoading && !incompleteTodosResponse) {
    return (
      <div className="space-y-6">
        {/* Stats Loading */}
        <StatsSkeleton />
        
        {/* Header Loading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-48"></div>
          </div>
          <div className="animate-pulse flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-blue-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Search and Filters Loading */}
        <div className="space-y-4">
          <div className="animate-pulse h-12 bg-gray-100 rounded-lg"></div>
          <div className="animate-pulse flex gap-4">
            <div className="h-10 bg-gray-100 rounded w-32"></div>
            <div className="h-10 bg-gray-100 rounded w-40"></div>
          </div>
        </div>
        
        {/* Todo Items Loading */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TodoSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error states with retry options
  if (incompleteError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load tasks</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          We couldn't load your tasks. This might be due to a network issue or server problem.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="min-h-[44px]"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear error and refetch
              queryClient.invalidateQueries({ queryKey: ['todos'] })
            }}
            className="min-h-[44px]"
          >
            Refresh
          </Button>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--accent-secondary)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--accent-primary)' }}>Total</p>
                <p className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-green-600 font-medium truncate">Done</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-orange-600 font-medium truncate">Active</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-700">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-red-600 font-medium truncate">High</p>
                <p className="text-lg sm:text-2xl font-bold text-red-700">{stats.priority.high}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Button and Share Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {showTodayOnly ? "Today's Tasks" : "My Tasks"}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {showTodayOnly ? (
              <>
                {incompleteTodos.length} active today, {completedTodos.length} completed today
              </>
            ) : (
              <>
                {incompleteTodos.length} active, {stats?.completed || 0} completed
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
          <ShareActions 
            todos={incompleteTodos} 
            completedTodos={completedTodos}
            stats={stats}
          />
          <Button onClick={() => setShowForm(true)} className="min-h-[44px]">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-3 sm:py-2 border rounded-lg bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              resetPagination()
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <select
            className="px-3 py-2 h-10 text-sm border rounded-lg bg-white border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto min-w-[160px]"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value as Priority | '')
              resetPagination()
            }}
          >
            <option value="">All Priorities</option>
            <option value={Priority.HIGH}>High Priority</option>
            <option value={Priority.MEDIUM}>Medium Priority</option>
            <option value={Priority.LOW}>Low Priority</option>
          </select>

          {/* Today Only Filter */}
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showTodayOnly}
              onChange={(e) => {
                setShowTodayOnly(e.target.checked)
                resetPagination()
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="select-none">Today Only</span>
          </label>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Sort by:</span>
            <div className="flex items-center gap-1">
              <Button
                variant={sortBy === 'createdAt' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => toggleSort('createdAt')}
                className="gap-1 h-10 px-3 text-sm"
              >
                Date
                {sortBy === 'createdAt' && (
                  sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant={sortBy === 'priority' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => toggleSort('priority')}
                className="gap-1 h-10 px-3 text-sm"
              >
                Priority
                {sortBy === 'priority' && (
                  sortOrder === 'desc' ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="space-y-3">
        {incompleteTodos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Square className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No active tasks
            </h3>
            <p className="text-sm mb-4 px-4" style={{ color: 'var(--text-secondary)' }}>
              Create your first task to get started.
            </p>
            <Button onClick={() => setShowForm(true)} className="min-h-[48px] sm:min-h-[44px] px-6">
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
            
            {/* Render grouped view for date sorting, regular list for other sorting */}
            {groupedIncompleteTodos ? (
              <div className="space-y-6">
                {groupedIncompleteTodos.map(({ dateLabel, todos }) => (
                  <TodoGroup
                    key={dateLabel}
                    dateLabel={dateLabel}
                    todos={todos}
                    onEdit={handleEditTodo}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {incompleteTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onEdit={handleEditTodo} />
                ))}
              </div>
            )}
            
            {/* Active Tasks Pagination */}
            {incompleteTodosResponse?.pagination && incompleteTodosResponse.pagination.total > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={incompleteTodosResponse.pagination.page}
                  totalPages={incompleteTodosResponse.pagination.totalPages}
                  totalItems={incompleteTodosResponse.pagination.total}
                  itemsPerPage={incompleteTodosResponse.pagination.limit}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[5, 10, 20]}
                />
              </div>
            )}
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
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="opacity-50">
                      <TodoSkeleton />
                    </div>
                  ))}
                </div>
              ) : completedError ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Failed to load completed tasks</span>
                  </div>
                  <button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['todos'] })}
                    className="block mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : completedTodos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No completed tasks match your filters.</p>
                </div>
              ) : (
                <>
                  {completedTodos.map((todo) => (
                    <div key={todo.id} className="opacity-75">
                      <TodoItem todo={todo} onEdit={handleEditTodo} />
                    </div>
                  ))}
                  
                  {/* Completed Tasks Pagination */}
                  {completedTodosResponse?.pagination && completedTodosResponse.pagination.total > 0 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={completedTodosResponse.pagination.page}
                        totalPages={completedTodosResponse.pagination.totalPages}
                        totalItems={completedTodosResponse.pagination.total}
                        itemsPerPage={completedTodosResponse.pagination.limit}
                        onPageChange={handleCompletedPageChange}
                        onItemsPerPageChange={handleCompletedItemsPerPageChange}
                        itemsPerPageOptions={[5, 10, 20]}
                      />
                    </div>
                  )}
                </>
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