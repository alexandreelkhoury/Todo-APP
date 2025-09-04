import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TodoItem } from '../TodoItem'
import { Todo } from '@/types'
import * as useTodosHook from '@/hooks/useTodos'

// Mock the useTodos hook
jest.mock('@/hooks/useTodos', () => ({
  useTodoMutations: jest.fn(),
}))

// Mock the utils
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString()
    }
    return date.toLocaleDateString()
  }),
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return TestWrapper
}

describe('TodoItem', () => {
  const mockToggleComplete = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }

  const mockTogglePin = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }

  const mockDeleteTodo = {
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }

  const mockUseTodoMutations = {
    toggleComplete: mockToggleComplete,
    togglePin: mockTogglePin,
    deleteTodo: mockDeleteTodo,
  }

  const mockOnEdit = jest.fn()

  const baseTodo: Todo = {
    id: 'todo-1',
    title: 'Test Todo',
    description: 'This is a test todo description',
    priority: 'MEDIUM',
    dueDate: '2024-12-31T00:00:00.000Z',
    completed: false,
    isPinned: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    userId: 'user-1',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTodosHook.useTodoMutations as jest.Mock).mockReturnValue(mockUseTodoMutations)
    ;(window.confirm as jest.Mock) = jest.fn()
  })

  const renderTodoItem = (todo: Partial<Todo> = {}, props: any = {}) => {
    const TestWrapper = createTestWrapper()
    const fullTodo = { ...baseTodo, ...todo }
    
    return render(
      <TestWrapper>
        <TodoItem 
          todo={fullTodo} 
          onEdit={mockOnEdit} 
          {...props} 
        />
      </TestWrapper>
    )
  }

  describe('Basic Rendering', () => {
    it('should render todo item with basic information', () => {
      renderTodoItem()

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
      expect(screen.getByText('Medium Priority')).toBeInTheDocument()
      expect(screen.getByText(/12\/31\/2024/)).toBeInTheDocument()
      expect(screen.getByText(/Created.*1\/1\/2024/)).toBeInTheDocument()
    })

    it('should render high priority todo with correct styling', () => {
      renderTodoItem({ priority: 'HIGH' })

      expect(screen.getByText('High Priority')).toBeInTheDocument()
    })

    it('should render low priority todo with correct styling', () => {
      renderTodoItem({ priority: 'LOW' })

      expect(screen.getByText('Low Priority')).toBeInTheDocument()
    })

    it('should render todo without due date', () => {
      renderTodoItem({ dueDate: null })

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
      expect(screen.queryByText(/12\/31\/2024/)).not.toBeInTheDocument()
    })

    it('should render todo without description', () => {
      renderTodoItem({ description: null })

      expect(screen.getByText('Test Todo')).toBeInTheDocument()
      
      // Click to expand and verify no description is shown
      fireEvent.click(screen.getByText('Test Todo'))
      expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument()
    })
  })

  describe('Completion Status', () => {
    it('should render incomplete todo with unchecked checkbox', () => {
      renderTodoItem()

      // Find the checkbox button by its className pattern (rounded-full border)
      const buttons = screen.getAllByRole('button')
      const checkbox = buttons.find(button => button.className.includes('rounded-full') && button.className.includes('border'))
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toHaveTextContent('✓') // No check mark for incomplete
    })

    it('should render completed todo with checked checkbox and strikethrough text', () => {
      renderTodoItem({ completed: true })

      const buttons = screen.getAllByRole('button')
      const checkbox = buttons.find(button => button.className.includes('rounded-full') && button.className.includes('border'))
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveClass('bg-green-500', 'border-green-500')
      
      const title = screen.getByText('Test Todo')
      expect(title).toHaveClass('line-through', 'text-gray-500')
    })

    it('should call toggleComplete when checkbox is clicked', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const buttons = screen.getAllByRole('button')
      const checkbox = buttons.find(button => button.className.includes('rounded-full') && button.className.includes('border'))
      await user.click(checkbox!)

      expect(mockToggleComplete.mutate).toHaveBeenCalledWith('todo-1')
    })

    it('should disable checkbox when toggle is pending', () => {
      ;(useTodosHook.useTodoMutations as jest.Mock).mockReturnValue({
        ...mockUseTodoMutations,
        toggleComplete: { ...mockToggleComplete, isPending: true },
      })

      renderTodoItem()

      const buttons = screen.getAllByRole('button')
      const checkbox = buttons.find(button => button.className.includes('rounded-full') && button.className.includes('border'))
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Pin Functionality', () => {
    it('should render unpinned todo with pin button', () => {
      renderTodoItem()

      const pinButton = screen.getByRole('button', { name: /pin/i })
      expect(pinButton).toBeInTheDocument()
      expect(pinButton).toHaveAttribute('title', 'Pin')
    })

    it('should render pinned todo with unpin button and special styling', () => {
      renderTodoItem({ isPinned: true })

      const unpinButton = screen.getByRole('button', { name: /unpin/i })
      expect(unpinButton).toBeInTheDocument()
      expect(unpinButton).toHaveAttribute('title', 'Unpin')
      expect(unpinButton).toHaveClass('text-blue-600')
    })

    it('should call togglePin when pin button is clicked', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const pinButton = screen.getByRole('button', { name: /pin/i })
      await user.click(pinButton)

      expect(mockTogglePin.mutate).toHaveBeenCalledWith('todo-1')
    })

    it('should disable pin button when toggle is pending', () => {
      ;(useTodosHook.useTodoMutations as jest.Mock).mockReturnValue({
        ...mockUseTodoMutations,
        togglePin: { ...mockTogglePin, isPending: true },
      })

      renderTodoItem()

      const pinButton = screen.getByRole('button', { name: /pin/i })
      expect(pinButton).toBeDisabled()
    })
  })

  describe('Edit Functionality', () => {
    it('should render edit button', () => {
      renderTodoItem()

      const editButton = screen.getByRole('button', { name: /edit/i })
      expect(editButton).toBeInTheDocument()
      expect(editButton).toHaveAttribute('title', 'Edit')
    })

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledWith(baseTodo)
    })
  })

  describe('Delete Functionality', () => {
    it('should render delete button', () => {
      renderTodoItem()

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveAttribute('title', 'Delete')
      expect(deleteButton).toHaveClass('text-red-600', 'hover:text-red-700', 'hover:bg-red-50')
    })

    it('should show confirmation dialog and delete when confirmed', async () => {
      ;(window.confirm as jest.Mock).mockReturnValue(true)
      const user = userEvent.setup()
      renderTodoItem()

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
      expect(mockDeleteTodo.mutate).toHaveBeenCalledWith('todo-1')
    })

    it('should not delete when confirmation is cancelled', async () => {
      ;(window.confirm as jest.Mock).mockReturnValue(false)
      const user = userEvent.setup()
      renderTodoItem()

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')
      expect(mockDeleteTodo.mutate).not.toHaveBeenCalled()
    })

    it('should disable delete button when deletion is pending', () => {
      ;(useTodosHook.useTodoMutations as jest.Mock).mockReturnValue({
        ...mockUseTodoMutations,
        deleteTodo: { ...mockDeleteTodo, isPending: true },
      })

      renderTodoItem()

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Expandable Description', () => {
    it('should not show description initially', () => {
      renderTodoItem()

      expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument()
    })

    it('should show description when title is clicked', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const title = screen.getByText('Test Todo')
      await user.click(title)

      expect(screen.getByText('This is a test todo description')).toBeInTheDocument()
    })

    it('should hide description when title is clicked again', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const title = screen.getByText('Test Todo')
      
      // Click to expand
      await user.click(title)
      expect(screen.getByText('This is a test todo description')).toBeInTheDocument()
      
      // Click to collapse
      await user.click(title)
      expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument()
    })
  })

  describe('Overdue Status', () => {
    beforeAll(() => {
      // Mock current date to be after due date
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should show overdue styling for past due incomplete todos', () => {
      const { container } = renderTodoItem({ 
        dueDate: '2024-12-31T00:00:00.000Z',
        completed: false 
      })

      const card = container.firstChild
      expect(card).toHaveClass('ring-2', 'ring-red-200', 'border-red-300')
    })

    it('should not show overdue styling for completed todos even if past due', () => {
      const { container } = renderTodoItem({ 
        dueDate: '2024-12-31T00:00:00.000Z',
        completed: true 
      })

      const card = container.firstChild
      expect(card).not.toHaveClass('ring-red-200', 'border-red-300')
    })

    it('should not show overdue styling for future due dates', () => {
      const { container } = renderTodoItem({ 
        dueDate: '2025-12-31T00:00:00.000Z',
        completed: false 
      })

      const card = container.firstChild
      expect(card).not.toHaveClass('ring-red-200', 'border-red-300')
    })
  })

  describe('Dragging State', () => {
    it('should apply dragging styles when isDragging is true', () => {
      const { container } = renderTodoItem({}, { isDragging: true })

      const card = container.firstChild
      expect(card).toHaveClass('shadow-lg', 'scale-105', 'opacity-95')
    })

    it('should not apply dragging styles when isDragging is false', () => {
      const { container } = renderTodoItem({}, { isDragging: false })

      const card = container.firstChild
      expect(card).not.toHaveClass('shadow-lg', 'scale-105', 'opacity-95')
    })
  })

  describe('Updated Date Display', () => {
    it('should show updated date when different from created date', () => {
      renderTodoItem({
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      })

      expect(screen.getByText(/Created.*1\/1\/2024/)).toBeInTheDocument()
      expect(screen.getByText(/Updated.*1\/2\/2024/)).toBeInTheDocument()
    })

    it('should not show updated date when same as created date', () => {
      renderTodoItem({
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      })

      expect(screen.getByText(/Created.*1\/1\/2024/)).toBeInTheDocument()
      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for buttons', () => {
      renderTodoItem()

      const pinButton = screen.getByRole('button', { name: /pin/i })
      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      expect(pinButton).toHaveAttribute('title', 'Pin')
      expect(editButton).toHaveAttribute('title', 'Edit')
      expect(deleteButton).toHaveAttribute('title', 'Delete')
    })

    it('should have clickable title for keyboard navigation', async () => {
      const user = userEvent.setup()
      renderTodoItem()

      const title = screen.getByText('Test Todo')
      expect(title).toHaveClass('cursor-pointer')

      await user.click(title)
      expect(screen.getByText('This is a test todo description')).toBeInTheDocument()
    })
  })

  describe('Priority Icons and Styling', () => {
    it('should render correct icon and styling for HIGH priority', () => {
      renderTodoItem({ priority: 'HIGH' })

      const priorityBadge = screen.getByText('High Priority')
      expect(priorityBadge).toBeInTheDocument()
      expect(priorityBadge).toHaveClass('px-2', 'py-0.5', 'text-xs', 'font-medium', 'rounded-full', 'border')
    })

    it('should render correct icon and styling for MEDIUM priority', () => {
      renderTodoItem({ priority: 'MEDIUM' })

      const priorityBadge = screen.getByText('Medium Priority')
      expect(priorityBadge).toBeInTheDocument()
      expect(priorityBadge).toHaveClass('px-2', 'py-0.5', 'text-xs', 'font-medium', 'rounded-full', 'border')
    })

    it('should render correct icon and styling for LOW priority', () => {
      renderTodoItem({ priority: 'LOW' })

      const priorityBadge = screen.getByText('Low Priority')
      expect(priorityBadge).toBeInTheDocument()
      expect(priorityBadge).toHaveClass('px-2', 'py-0.5', 'text-xs', 'font-medium', 'rounded-full', 'border')
    })
  })
})