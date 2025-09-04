export function getRelativeDateLabel(date: string | Date): string {
  const taskDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Reset time to compare only dates
  const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  
  if (taskDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today'
  } else if (taskDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday'
  } else {
    // Check if it's within the last week
    const daysDiff = Math.floor((todayOnly.getTime() - taskDateOnly.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff >= 0 && daysDiff <= 7) {
      return taskDate.toLocaleDateString('en-US', { weekday: 'long' }) // Monday, Tuesday, etc.
    } else if (daysDiff > 7 && daysDiff <= 30) {
      return taskDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      }) // January 15
    } else {
      return taskDate.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      }) // January 15, 2024
    }
  }
}

export function groupTodosByDate(todos: any[], sortOrder: 'asc' | 'desc' = 'desc') {
  // Sort todos by createdAt date based on sortOrder
  const sortedTodos = [...todos].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })
  
  // Group by date
  const grouped = sortedTodos.reduce((groups, todo) => {
    const dateLabel = getRelativeDateLabel(todo.createdAt)
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = []
    }
    groups[dateLabel].push(todo)
    return groups
  }, {} as Record<string, any[]>)
  
  // Convert to array and sort by actual dates based on sortOrder
  return Object.entries(grouped)
    .sort(([dateA, todosA], [dateB, todosB]) => {
      // Get the actual dates for comparison
      const dateObjA = todosA[0]?.createdAt ? new Date(todosA[0].createdAt) : new Date(0)
      const dateObjB = todosB[0]?.createdAt ? new Date(todosB[0].createdAt) : new Date(0)
      
      // Sort by actual date based on sortOrder
      return sortOrder === 'desc' 
        ? dateObjB.getTime() - dateObjA.getTime()  // Newest first
        : dateObjA.getTime() - dateObjB.getTime()  // Oldest first
    })
    .map(([dateLabel, todos]) => ({ dateLabel, todos }))
}