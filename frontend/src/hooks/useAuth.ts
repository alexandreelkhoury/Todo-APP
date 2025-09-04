'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { LoginFormData, RegisterFormData } from '@/types'
import { useRouter } from 'next/navigation'

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
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      router.push('/dashboard')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      router.push('/dashboard')
    },
  })

  // Logout function
  const logout = async () => {
    await authService.logout()
    queryClient.clear()
    router.push('/auth/login')
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