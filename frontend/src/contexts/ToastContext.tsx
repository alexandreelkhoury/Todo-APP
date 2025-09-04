'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return fallback functions if context not available
    return {
      toasts: [],
      addToast: (toast: Omit<Toast, 'id'>) => {
        console.log(`Toast: ${toast.title}`, toast.description)
        return Math.random().toString(36).substr(2, 9)
      },
      removeToast: () => {},
      removeAllToasts: () => {},
    }
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastContextProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const removeAllToasts = () => {
    setToasts([])
  }

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

// Export convenience functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          title,
          description,
          ...options,
        }
      })
      window.dispatchEvent(event)
    }
  },
  
  error: (title: string, description?: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          title,
          description,
          duration: 8000,
          ...options,
        }
      })
      window.dispatchEvent(event)
    }
  },
  
  warning: (title: string, description?: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'warning',
          title,
          description,
          ...options,
        }
      })
      window.dispatchEvent(event)
    }
  },
  
  info: (title: string, description?: string, options?: Partial<Toast>) => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'info',
          title,
          description,
          ...options,
        }
      })
      window.dispatchEvent(event)
    }
  },
}