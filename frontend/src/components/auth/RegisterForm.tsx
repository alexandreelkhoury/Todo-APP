'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { AxiosError } from 'axios'

const registerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .transform(val => val.trim()),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { register: registerUser, registerLoading, registerError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data)
  }

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    let score = 0
    let feedback = ''
    
    if (password.length >= 6) score += 1
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^\w\s]/.test(password)) score += 1
    
    if (score <= 2) {
      feedback = 'Weak'
    } else if (score <= 4) {
      feedback = 'Medium'
    } else {
      feedback = 'Strong'
    }
    
    return { score, feedback }
  }

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (!registerError) return null
    
    if (registerError instanceof AxiosError) {
      const status = registerError.response?.status
      const message = registerError.response?.data?.message
      
      switch (status) {
        case 409:
          return 'An account with this email already exists. Please use a different email or try signing in.'
        case 400:
          return message || 'Please check your information and try again.'
        case 429:
          return 'Too many registration attempts. Please wait a few minutes before trying again.'
        case 500:
        case 502:
        case 503:
          return 'Server is temporarily unavailable. Please try again later.'
        default:
          return message || 'Registration failed. Please try again.'
      }
    }
    
    return 'An unexpected error occurred. Please check your internet connection and try again.'
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create your account
        </CardTitle>
        <p className="text-sm text-gray-600">
          Enter your details to get started with Maxiphy
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {registerError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Registration failed</p>
                  <p>{getErrorMessage()}</p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-2">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password', {
                  onChange: (e) => {
                    const strength = checkPasswordStrength(e.target.value)
                    setPasswordStrength(strength)
                  }
                })}
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
            
            {/* Password strength indicator */}
            {passwordStrength.score > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i <= passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-red-400'
                            : passwordStrength.score <= 4
                            ? 'bg-yellow-400'
                            : 'bg-green-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  passwordStrength.score <= 2
                    ? 'text-red-600'
                    : passwordStrength.score <= 4
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  Password strength: {passwordStrength.feedback}
                </p>
              </div>
            )}
            
            {/* Password requirements */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Password must contain:</p>
              <ul className="space-y-0.5 ml-2">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>At least 6 characters</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>One lowercase letter</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>One uppercase letter</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>One number</span>
                </li>
              </ul>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[48px] sm:min-h-[44px]"
            loading={registerLoading}
            disabled={registerLoading}
          >
            {registerLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}