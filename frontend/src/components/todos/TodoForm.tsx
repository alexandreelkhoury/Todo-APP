'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTodoMutations } from '@/hooks/useTodos'
import { Todo, Priority } from '@/types'
import { X } from 'lucide-react'

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW]),
  dueDate: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  const isLoading = createTodo.isPending || updateTodo.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-gray-900 text-gray-100">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
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
                className="flex w-full rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-800 px-3 py-2 text-sm text-gray-900 text-gray-100 placeholder:text-gray-500 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full rounded-lg border border-gray-300 border-gray-600 bg-white bg-gray-800 px-3 py-2 text-sm text-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPinned"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 border-gray-600 rounded bg-gray-800 checked:bg-blue-600"
                {...register('isPinned')}
              />
              <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 text-gray-300">
                Pin this task to the top
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
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