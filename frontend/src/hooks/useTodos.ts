'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todosService } from '@/services/todos'
import { TodoFormData, TodoQueryParams } from '@/types'

export function useTodos(params?: TodoQueryParams) {
  return useQuery({
    queryKey: ['todos', params],
    queryFn: () => todosService.getTodos(params),
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => todosService.getTodo(id),
    enabled: !!id,
  })
}

export function useTodoStats() {
  return useQuery({
    queryKey: ['todos', 'stats'],
    queryFn: todosService.getStats,
  })
}

export function useTodoMutations() {
  const queryClient = useQueryClient()

  const createTodo = useMutation({
    mutationFn: todosService.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const updateTodo = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoFormData> }) =>
      todosService.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const deleteTodo = useMutation({
    mutationFn: todosService.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const toggleComplete = useMutation({
    mutationFn: todosService.toggleComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const togglePin = useMutation({
    mutationFn: todosService.togglePin,
    onSuccess: () => {
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