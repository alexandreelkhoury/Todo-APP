'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from '@dnd-kit/modifiers'
import { SortableTodoItem } from './SortableTodoItem'
import { Todo } from '@/types'

interface DraggableTaskListProps {
  tasks: Todo[]
  onEdit: (todo: Todo) => void
  onReorder?: (reorderedTasks: Todo[]) => void
}

export function DraggableTaskList({ tasks, onEdit, onReorder }: DraggableTaskListProps) {
  const [items, setItems] = useState(tasks)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update internal state when tasks prop changes
  useEffect(() => {
    setItems(tasks)
  }, [tasks])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      
      // Notify parent component of reorder
      onReorder?.(newItems)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((task) => (
            <SortableTodoItem key={task.id} todo={task} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}