'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todosService } from '@/services/todos'
import { TodoFormData, TodoQueryParams } from '@/types'
import { toast } from '@/contexts/ToastContext'
import { AxiosError } from 'axios'

export function useTodos(params?: TodoQueryParams) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => todosService.getTodos(params),
    keepPreviousData: true,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof AxiosError && [401, 403].includes(error.response?.status || 0)) {
        return false
      }
      return failureCount < 3
    },
    onError: (error) => {
      console.error('Failed to fetch todos:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to load tasks'
        toast.error('Error Loading Tasks', message)
      } else {
        toast.error('Error Loading Tasks', 'An unexpected error occurred')
      }
    }
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todosService.getTodo(id),
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && [401, 403, 404].includes(error.response?.status || 0)) {
        return false
      }
      return failureCount < 2
    },
    onError: (error) => {
      console.error('Failed to fetch todo:', error)
      if (error instanceof AxiosError && error.response?.status === 404) {
        toast.error('Task Not Found', 'The requested task could not be found')
      } else {
        toast.error('Error Loading Task', 'Failed to load task details')
      }
    }
  })
}

export function useTodoStats() {
  return useQuery({
    queryKey: ['todos', 'stats'],
    queryFn: todosService.getStats,
    retry: 2,
    onError: (error) => {
      console.error('Failed to fetch stats:', error)
      // Don't show toast for stats errors as it's not critical
    }
  })
}

export function useTodoMutations() {
  const queryClient = useQueryClient()

  const createTodo = useMutation({
    mutationFn: todosService.createTodo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Task Created', 'Your task has been created successfully')
    },
    onError: (error) => {
      console.error('Failed to create todo:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to create task'
        if (error.response?.status === 400) {
          toast.error('Validation Error', message)
        } else if (error.response?.status === 401) {
          toast.error('Authentication Required', 'Please log in to create tasks')
        } else {
          toast.error('Create Failed', message)
        }
      } else {
        toast.error('Create Failed', 'An unexpected error occurred while creating the task')
      }
    },
  })

  const updateTodo = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoFormData> }) =>
      todosService.updateTodo(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Task Updated', 'Your task has been updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update todo:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to update task'
        if (error.response?.status === 404) {
          toast.error('Task Not Found', 'The task you are trying to update no longer exists')
        } else if (error.response?.status === 400) {
          toast.error('Validation Error', message)
        } else if (error.response?.status === 403) {
          toast.error('Permission Denied', 'You do not have permission to update this task')
        } else {
          toast.error('Update Failed', message)
        }
      } else {
        toast.error('Update Failed', 'An unexpected error occurred while updating the task')
      }
    },
  })

  const deleteTodo = useMutation({
    mutationFn: todosService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Task Deleted', 'Your task has been deleted successfully')
    },
    onError: (error) => {
      console.error('Failed to delete todo:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to delete task'
        if (error.response?.status === 404) {
          toast.error('Task Not Found', 'The task you are trying to delete no longer exists')
        } else if (error.response?.status === 403) {
          toast.error('Permission Denied', 'You do not have permission to delete this task')
        } else {
          toast.error('Delete Failed', message)
        }
      } else {
        toast.error('Delete Failed', 'An unexpected error occurred while deleting the task')
      }
    },
  })

  const toggleComplete = useMutation({
    mutationFn: todosService.toggleComplete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      // Optional: Show toast for completion toggle
      // toast.success(data.completed ? 'Task Completed' : 'Task Reopened')
    },
    onError: (error) => {
      console.error('Failed to toggle todo completion:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to update task status'
        if (error.response?.status === 404) {
          toast.error('Task Not Found', 'The task no longer exists')
        } else if (error.response?.status === 403) {
          toast.error('Permission Denied', 'You do not have permission to update this task')
        } else {
          toast.error('Update Failed', message)
        }
      } else {
        toast.error('Update Failed', 'An unexpected error occurred')
      }
    },
  })

  const togglePin = useMutation({
    mutationFn: todosService.togglePin,
    onMutate: async (todoId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the previous value
      const previousTodos = queryClient.getQueriesData({ queryKey: ['todos'] })

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: ['todos'] }, (old: any) => {
        if (!old?.todos) return old
        
        return {
          ...old,
          todos: old.todos.map((todo: any) => 
            todo.id === todoId ? { ...todo, isPinned: !todo.isPinned } : todo
          )
        }
      })

      // Return a context object with the snapshotted value
      return { previousTodos }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      // Optional: Show toast for pin toggle
      // toast.info(data.isPinned ? 'Task Pinned' : 'Task Unpinned')
    },
    onError: (error, todoId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTodos) {
        context.previousTodos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      
      console.error('Failed to toggle todo pin:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to update task'
        if (error.response?.status === 404) {
          toast.error('Task Not Found', 'The task no longer exists')
        } else if (error.response?.status === 403) {
          toast.error('Permission Denied', 'You do not have permission to update this task')
        } else {
          toast.error('Update Failed', message)
        }
      } else {
        toast.error('Update Failed', 'An unexpected error occurred')
      }
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    togglePin,
  }
}