// User types
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {}

// Todo types
export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Todo {
  id: string
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  completed: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  userId: string
  user?: User
}

// API types
export interface AuthResponse {
  user: User
  access_token: string
  token_type: string
  expires_in: string
  message: string
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TodosResponse {
  todos: Todo[]
  pagination: PaginationMeta
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  priority: {
    high: number
    medium: number
    low: number
  }
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
}

export interface TodoFormData {
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  isPinned?: boolean
}

export interface TodoQueryParams {
  completed?: boolean
  priority?: Priority
  search?: string
  sortBy?: 'createdAt' | 'priority' | 'dueDate' | 'title'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}