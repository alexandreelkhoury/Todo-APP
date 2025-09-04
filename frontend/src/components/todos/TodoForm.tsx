'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTodoMutations } from '@/hooks/useTodos'
import { Todo, Priority } from '@/types'
import { toast } from '@/contexts/ToastContext'
import { X, AlertTriangle } from 'lucide-react'

const todoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW], {
    errorMap: () => ({ message: 'Please select a valid priority' })
  }),
  dueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Due date cannot be in the past'),
  isPinned: z.boolean().optional(),
})

type TodoFormData = z.infer<typeof todoSchema>

interface TodoFormProps {
  todo?: Todo
  onClose: () => void
}

export function TodoForm({ todo, onClose }: TodoFormProps) {
  const { createTodo, updateTodo } = useTodoMutations()
  const isEditing = !!todo
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      dueDate: '',
      isPinned: false,
    },
  })

  // Reset form when todo changes
  useEffect(() => {
    if (todo) {
      reset({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
        isPinned: todo.isPinned,
      })
    } else {
      reset({
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        dueDate: '',
        isPinned: false,
      })
    }
  }, [todo, reset])

  const onSubmit = async (data: TodoFormData) => {
    setSubmitError(null)
    
    try {
      const todoData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      }

      if (isEditing) {
        await updateTodo.mutateAsync({ id: todo.id, data: todoData })
      } else {
        await createTodo.mutateAsync(todoData)
      }
      onClose()
    } catch (error: any) {
      console.error('Failed to save task:', error)
      
      // Set form-specific error for display
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          `Failed to ${isEditing ? 'update' : 'create'} task`
      setSubmitError(errorMessage)
      
      // Also show validation errors if they exist
      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        Object.keys(validationErrors).forEach(field => {
          if (field in data) {
            // Set field-specific errors
            setError(field as keyof TodoFormData, {
              type: 'server',
              message: validationErrors[field][0] || validationErrors[field]
            })
          }
        })
      }
    }
  }

  const isLoading = createTodo.isPending || updateTodo.isPending || isSubmitting

  // Clear errors when form values change
  useEffect(() => {
    if (submitError) {
      setSubmitError(null)
    }
  }, [submitError])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 bg-black bg-opacity-70 flex items-center justify-center p-3 sm:p-4 z-50">
      <Card className="w-full max-w-md mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 text-gray-100">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 sm:h-8 sm:w-8 p-0 flex-shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {/* General Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Error saving task</p>
                  <p>{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter task title"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="flex w-full rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-800 px-3 py-3 text-sm text-gray-900 text-gray-100 placeholder:text-gray-500 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
                placeholder="Enter task description (optional)"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 text-gray-300 mb-2">
                Priority
              </label>
              <select
                className="flex h-12 sm:h-10 w-full rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-800 px-3 py-2 text-sm text-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('priority')}
              >
                <option value={Priority.HIGH}>High Priority</option>
                <option value={Priority.MEDIUM}>Medium Priority</option>
                <option value={Priority.LOW}>Low Priority</option>
              </select>
            </div>

            <Input
              label="Due Date (Optional)"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            <div className="flex items-center space-x-3 py-1">
              <input
                type="checkbox"
                id="isPinned"
                className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 border-gray-600 rounded bg-gray-800 checked:bg-blue-600 flex-shrink-0"
                {...register('isPinned')}
              />
              <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 text-gray-300 cursor-pointer">
                Pin this task to the top
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm font-medium"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[48px] sm:min-h-[44px] text-sm font-medium"
                loading={isLoading}
                disabled={isLoading}
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}