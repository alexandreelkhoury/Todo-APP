import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Track retry attempts
let isRefreshing = false
let failedQueue: any[] = []

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and handle request errors
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timeout
    if (!config.timeout) {
      config.timeout = 10000 // 10 seconds
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and auth
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your internet connection.'
      } else if (error.message === 'Network Error') {
        error.message = 'Unable to connect to the server. Please check your internet connection.'
      }
      
      return Promise.reject(error)
    }

    // Handle different HTTP status codes
    const status = error.response.status
    const originalUrl = originalRequest?.url || ''

    switch (status) {
      case 401:
        // Unauthorized - handle token refresh or redirect to login
        if (!originalRequest._retry) {
          originalRequest._retry = true
          
          // Remove invalid token
          Cookies.remove('auth_token')
          
          // Clear any query cache if available
          if (typeof window !== 'undefined' && (window as any).queryClient) {
            (window as any).queryClient.clear()
          }
          
          // Redirect to login if we're not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth/login'
          }
        }
        break

      case 403:
        // Forbidden
        console.warn('Access forbidden:', originalUrl)
        break

      case 404:
        // Not found
        console.warn('Resource not found:', originalUrl)
        break

      case 422:
        // Validation error
        console.warn('Validation error:', error.response.data)
        break

      case 429:
        // Rate limiting
        console.warn('Rate limit exceeded:', originalUrl)
        const retryAfter = error.response.headers['retry-after']
        if (retryAfter && !originalRequest._retry) {
          originalRequest._retry = true
          const delay = parseInt(retryAfter) * 1000
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(api.request(originalRequest))
            }, delay)
          })
        }
        break

      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('Server error:', status, originalUrl)
        
        // Retry server errors up to 2 times with exponential backoff
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0
        }
        
        if (originalRequest._retryCount < 2) {
          originalRequest._retryCount++
          const delay = Math.pow(2, originalRequest._retryCount) * 1000 // Exponential backoff
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(api.request(originalRequest))
            }, delay)
          })
        }
        break

      default:
        console.error('API error:', status, error.response.data)
    }

    // Enhance error message for better UX
    if (error.response?.data?.message) {
      error.message = error.response.data.message
    } else if (status >= 500) {
      error.message = 'Server is temporarily unavailable. Please try again later.'
    } else if (status === 404) {
      error.message = 'The requested resource was not found.'
    } else if (status === 403) {
      error.message = 'You do not have permission to access this resource.'
    }

    return Promise.reject(error)
  }
)

export default api