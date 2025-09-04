'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8', 
  xl: 'h-12 w-12'
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
          sizeMap[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Skeleton loader for content
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

// Card skeleton for todo items
export function TodoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-6 w-6 bg-gray-200 rounded-full mt-1"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-100 rounded-full w-20"></div>
              <div className="h-6 bg-gray-100 rounded-full w-24"></div>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-8 w-8 bg-gray-100 rounded"></div>
            <div className="h-8 w-8 bg-gray-100 rounded"></div>
            <div className="h-8 w-8 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-100 p-3 sm:p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 sm:h-5 sm:w-5 bg-gray-200 rounded"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}