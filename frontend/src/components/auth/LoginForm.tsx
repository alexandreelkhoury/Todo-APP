'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { AxiosError } from 'axios'

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login, loginLoading, loginError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    setAttemptCount(prev => prev + 1)
    login(data)
  }

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!loginError) return null
    
    if (loginError instanceof AxiosError) {
      const status = loginError.response?.status
      const message = loginError.response?.data?.message
      
      switch (status) {
        case 401:
          return 'Invalid email or password. Please check your credentials and try again.'
        case 429:
          return 'Too many login attempts. Please wait a few minutes before trying again.'
        case 500:
        case 502:
        case 503:
          return 'Server is temporarily unavailable. Please try again later.'
        default:
          return message || 'Login failed. Please try again.'
      }
    }
    
    return 'An unexpected error occurred. Please check your internet connection and try again.'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Sign in to Maxiphy
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter your email and password to access your todos
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Login failed</p>
                  <p>{getErrorMessage()}</p>
                  {attemptCount >= 3 && (
                    <p className="mt-2 text-xs text-red-600">
                      Having trouble? Make sure your caps lock is off and check your email spelling.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[48px] sm:min-h-[44px]"
            loading={loginLoading}
            disabled={loginLoading || attemptCount >= 5}
          >
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          {attemptCount >= 5 && (
            <div className="text-center text-sm text-gray-500">
              Too many failed attempts. Please wait before trying again.
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}