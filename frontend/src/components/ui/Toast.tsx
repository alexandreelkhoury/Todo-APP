'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast, ToastContextProvider, Toast } from '@/contexts/ToastContext'

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styleMap = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

export function ToastItem({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const Icon = iconMap[toast.type || 'info']
  const baseStyles = styleMap[toast.type || 'info']

  useEffect(() => {
    // Animate in
    setIsVisible(true)

    // Auto dismiss
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(toast.id)
    }, 200)
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out',
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto',
        'border p-4 relative',
        baseStyles,
        isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-2 opacity-0'
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="ml-3 w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-medium">
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className={cn(
              'text-sm opacity-90',
              toast.title && 'mt-1'
            )}>
              {toast.description}
            </p>
          )}
        </div>

        {toast.action && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="text-sm font-medium underline hover:no-underline focus:outline-none"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </button>
          </div>
        )}

        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

function ToastContainer() {
  const { toasts, removeToast, addToast } = useToast()

  // Listen for custom toast events
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      addToast(event.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('showToast', handleToastEvent as EventListener)
      return () => {
        window.removeEventListener('showToast', handleToastEvent as EventListener)
      }
    }
  }, [addToast])

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  )
}

export function ToastProvider({ children }: ToastProviderProps) {

  return (
    <ToastContextProvider>
      {children}
      <ToastContainer />
    </ToastContextProvider>
  )
}

// Re-export toast utilities from context
export { toast } from '@/contexts/ToastContext'