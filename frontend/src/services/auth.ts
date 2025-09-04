import { api } from '@/lib/axios'
import { AuthResponse, LoginFormData, RegisterFormData, User } from '@/types'
import Cookies from 'js-cookie'

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    
    // Store token in cookie
    if (response.data.access_token) {
      Cookies.set('auth_token', response.data.access_token, { expires: 1 }) // 1 day
    }
    
    return response.data
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    
    // Store token in cookie
    if (response.data.access_token) {
      Cookies.set('auth_token', response.data.access_token, { expires: 1 }) // 1 day
    }
    
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/profile')
    return response.data.user
  },

  async logout(): Promise<void> {
    Cookies.remove('auth_token')
  },

  getToken(): string | undefined {
    return Cookies.get('auth_token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}