'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { LoginFormData, RegisterFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { toast } from '@/contexts/ToastContext'
import { AxiosError } from 'axios'

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getProfile,
    enabled: authService.isAuthenticated(),
    retry: false,
    onError: (error) => {
      console.error('Auth profile fetch failed:', error)
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Token is invalid, clear auth state
        authService.logout()
        queryClient.clear()
      }
    }
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      toast.success('Welcome back!', `Successfully logged in as ${data.user.name}`)
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error('Login failed:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Login failed'
        if (error.response?.status === 401) {
          toast.error('Invalid Credentials', 'Please check your email and password')
        } else if (error.response?.status === 400) {
          toast.error('Invalid Input', message)
        } else if (error.response?.status === 429) {
          toast.error('Too Many Attempts', 'Please wait a moment before trying again')
        } else if (error.response?.status >= 500) {
          toast.error('Server Error', 'Our servers are experiencing issues. Please try again later')
        } else {
          toast.error('Login Failed', message)
        }
      } else {
        toast.error('Login Failed', 'An unexpected error occurred. Please check your internet connection')
      }
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      toast.success('Welcome!', `Account created successfully. Welcome ${data.user.name}!`)
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error('Registration failed:', error)
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Registration failed'
        if (error.response?.status === 409) {
          toast.error('Account Exists', 'An account with this email already exists')
        } else if (error.response?.status === 400) {
          toast.error('Validation Error', message)
        } else if (error.response?.status >= 500) {
          toast.error('Server Error', 'Our servers are experiencing issues. Please try again later')
        } else {
          toast.error('Registration Failed', message)
        }
      } else {
        toast.error('Registration Failed', 'An unexpected error occurred. Please check your internet connection')
      }
    },
  })

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
      queryClient.clear()
      toast.info('Logged Out', 'You have been logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if server logout fails
      queryClient.clear()
      router.push('/auth/login')
      toast.warning('Logout Warning', 'You have been logged out, but there was an issue with the server')
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}