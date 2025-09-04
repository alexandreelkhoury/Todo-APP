'use client'

import React from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  isLoading?: boolean
  icon?: React.ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    }
  }

  const styles = getVariantStyles()
  const defaultIcon = variant === 'danger' ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${styles.iconBg}`}>
              <div className={styles.iconColor}>
                {icon || defaultIcon}
              </div>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className={`flex-1 min-h-[44px] ${styles.confirmButton}`}
              onClick={onConfirm}
              loading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Convenience hook for using confirm dialogs
export function useConfirmDialog() {
  const [dialog, setDialog] = React.useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'default'
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  const confirm = React.useCallback((options: {
    title: string
    description: string
    onConfirm: () => void
    variant?: 'danger' | 'warning' | 'default'
    confirmText?: string
    cancelText?: string
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        title: options.title,
        description: options.description,
        variant: options.variant || 'default',
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        onConfirm: () => {
          options.onConfirm()
          resolve(true)
          setDialog(prev => ({ ...prev, isOpen: false }))
        },
        isLoading: false
      })
    })
  }, [])

  const close = React.useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ConfirmDialogComponent = React.useCallback(() => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={close}
      onConfirm={dialog.onConfirm}
      title={dialog.title}
      description={dialog.description}
      variant={dialog.variant}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      isLoading={dialog.isLoading}
    />
  ), [dialog, close])

  return { confirm, ConfirmDialogComponent }
}

