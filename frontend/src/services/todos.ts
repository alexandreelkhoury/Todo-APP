import { api } from '@/lib/axios'
import { Todo, TodoFormData, TodoQueryParams, TodosResponse, TodoStats } from '@/types'

export const todosService = {
  async getTodos(params?: TodoQueryParams): Promise<TodosResponse> {
    const response = await api.get<TodosResponse>('/todos', { params })
    return response.data
  },

  async getTodo(id: string): Promise<Todo> {
    const response = await api.get<Todo>(`/todos/${id}`)
    return response.data
  },

  async createTodo(data: TodoFormData): Promise<Todo> {
    const response = await api.post<Todo>('/todos', data)
    return response.data
  },

  async updateTodo(id: string, data: Partial<TodoFormData>): Promise<Todo> {
    const response = await api.patch<Todo>(`/todos/${id}`, data)
    return response.data
  },

  async deleteTodo(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/todos/${id}`)
    return response.data
  },

  async toggleComplete(id: string): Promise<Todo> {
    const response = await api.patch<Todo>(`/todos/${id}/toggle-complete`)
    return response.data
  },

  async togglePin(id: string): Promise<Todo> {
    const response = await api.patch<Todo>(`/todos/${id}/toggle-pin`)
    return response.data
  },

  async getStats(): Promise<TodoStats> {
    const response = await api.get<TodoStats>('/todos/stats')
    return response.data
  }
}