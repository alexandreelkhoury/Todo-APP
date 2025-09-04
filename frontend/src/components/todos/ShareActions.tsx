'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Todo, TodoStats } from '@/types'
import { Share2, Download, Printer, CheckSquare, Square, Calendar, Flag, ChevronDown } from 'lucide-react'

interface ShareActionsProps {
  todos: Todo[]
  completedTodos: Todo[]
  stats?: TodoStats
}

export function ShareActions({ todos, completedTodos, stats }: ShareActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
  }

  const generatePrintContent = () => {
    const allTodos = [...todos, ...completedTodos]
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>My Todo List</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .todo-item {
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 10px;
      background: white;
    }
    .todo-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .todo-title {
      font-weight: 600;
      flex: 1;
    }
    .todo-priority {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .priority-high { background: #fecaca; color: #dc2626; }
    .priority-medium { background: #fed7aa; color: #ea580c; }
    .priority-low { background: #bbf7d0; color: #16a34a; }
    .todo-description {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .todo-meta {
      font-size: 12px;
      color: #9ca3af;
      display: flex;
      gap: 16px;
    }
    .completed .todo-title {
      text-decoration: line-through;
      color: #9ca3af;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .stats { background: #f8f9fa !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>My Todo List</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  ${stats ? `
  <div class="stats">
    <div class="stat-item">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Tasks</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.completed}</div>
      <div class="stat-label">Completed</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.pending}</div>
      <div class="stat-label">Pending</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${stats.priority.high}</div>
      <div class="stat-label">High Priority</div>
    </div>
  </div>
  ` : ''}

  ${todos.length > 0 ? `
  <div class="section">
    <h2 class="section-title">🎯 Active Tasks (${todos.length})</h2>
    ${todos.map(todo => `
      <div class="todo-item">
        <div class="todo-header">
          <div class="todo-title">${todo.title}</div>
          <span class="todo-priority priority-${todo.priority.toLowerCase()}">${formatPriority(todo.priority)}</span>
        </div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
        <div class="todo-meta">
          <span>Due: ${formatDate(todo.dueDate)}</span>
          <span>Created: ${new Date(todo.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${completedTodos.length > 0 ? `
  <div class="section">
    <h2 class="section-title">✅ Completed Tasks (${completedTodos.length})</h2>
    ${completedTodos.map(todo => `
      <div class="todo-item completed">
        <div class="todo-header">
          <div class="todo-title">${todo.title}</div>
          <span class="todo-priority priority-${todo.priority.toLowerCase()}">${formatPriority(todo.priority)}</span>
        </div>
        ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
        <div class="todo-meta">
          <span>Due: ${formatDate(todo.dueDate)}</span>
          <span>Completed: ${new Date(todo.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

</body>
</html>
    `
  }

  const generatePDF = async (): Promise<Blob> => {
    try {
      const jsPDF = (await import('jspdf')).default
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      let yPosition = 0
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      // Color palette
      const colors = {
        primary: [41, 128, 185],      // Blue
        secondary: [52, 152, 219],    // Light Blue
        success: [39, 174, 96],       // Green
        warning: [241, 196, 15],      // Yellow
        danger: [231, 76, 60],        // Red
        dark: [44, 62, 80],           // Dark Blue
        light: [236, 240, 241],       // Light Gray
        text: [33, 37, 41],           // Dark Text
        muted: [108, 117, 125]        // Muted Text
      }
      
      // Utility functions
      const safeText = (text: string, x: number, y: number, options?: any) => {
        try {
          const cleanText = String(text || '')
            .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
            .replace(/[^\x20-\x7E]/g, '')
            .trim()
          if (cleanText) {
            pdf.text(cleanText, x, y, options)
          }
        } catch (error) {
          console.warn('Error adding text to PDF:', error)
        }
      }
      
      const setColor = (color: number[]) => {
        pdf.setTextColor(color[0], color[1], color[2])
      }
      
      const setFillColor = (color: number[]) => {
        pdf.setFillColor(color[0], color[1], color[2])
      }
      
      const setDrawColor = (color: number[]) => {
        pdf.setDrawColor(color[0], color[1], color[2])
      }
      
      const addCard = (x: number, y: number, width: number, height: number, borderColor: number[]) => {
        setDrawColor(borderColor)
        setFillColor([255, 255, 255])
        pdf.roundedRect(x, y, width, height, 2, 2, 'FD')
        return y + height
      }
      
      const addProgressBar = (x: number, y: number, width: number, percentage: number, color: number[]) => {
        // Background
        setFillColor([240, 240, 240])
        pdf.roundedRect(x, y, width, 4, 2, 2, 'F')
        
        // Progress
        if (percentage > 0) {
          setFillColor(color)
          pdf.roundedRect(x, y, (width * percentage) / 100, 4, 2, 2, 'F')
        }
      }
      
      // HEADER SECTION
      yPosition = 25
      
      // Header background
      setFillColor(colors.primary)
      pdf.rect(0, 0, pageWidth, 50, 'F')
      
      // Title
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      safeText('TODO LIST REPORT', pageWidth / 2, 25, { align: 'center' })
      
      // Subtitle
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(255, 255, 255)
      const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      safeText(`Generated on ${date}`, pageWidth / 2, 35, { align: 'center' })
      
      yPosition = 60
      
      // STATS OVERVIEW SECTION
      if (stats) {
        yPosition += 10
        
        // Section header
        setColor(colors.dark)
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        safeText('OVERVIEW', margin, yPosition)
        yPosition += 15
        
        // Stats cards in a grid
        const cardWidth = (contentWidth - 10) / 2
        const cardHeight = 25
        const cardSpacing = 10
        
        // Completion rate calculation
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
        
        // Card 1: Total & Completion
        addCard(margin, yPosition, cardWidth, cardHeight, colors.primary)
        setColor(colors.primary)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        safeText('TOTAL TASKS', margin + 5, yPosition + 8)
        
        pdf.setFontSize(24)
        safeText(String(stats.total || 0), margin + 5, yPosition + 18)
        
        setColor(colors.muted)
        pdf.setFontSize(10)
        safeText(`${completionRate}% Complete`, margin + 5, yPosition + 22)
        
        // Progress bar
        addProgressBar(margin + 60, yPosition + 15, cardWidth - 70, completionRate, colors.success)
        
        // Card 2: Priority Breakdown
        addCard(margin + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, colors.warning)
        setColor(colors.warning)
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        safeText('PRIORITY BREAKDOWN', margin + cardWidth + cardSpacing + 5, yPosition + 8)
        
        setColor(colors.text)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        safeText(`High: ${stats.priority?.high || 0}`, margin + cardWidth + cardSpacing + 5, yPosition + 14)
        safeText(`Medium: ${stats.priority?.medium || 0}`, margin + cardWidth + cardSpacing + 5, yPosition + 18)
        safeText(`Low: ${stats.priority?.low || 0}`, margin + cardWidth + cardSpacing + 5, yPosition + 22)
        
        yPosition += cardHeight + 20
        
        // Status cards
        const statusCardWidth = (contentWidth - 20) / 3
        const statusCardHeight = 20
        
        // Completed card
        addCard(margin, yPosition, statusCardWidth, statusCardHeight, colors.success)
        setColor(colors.success)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        safeText('COMPLETED', margin + 5, yPosition + 8)
        pdf.setFontSize(18)
        safeText(String(stats.completed || 0), margin + 5, yPosition + 16)
        
        // Pending card
        addCard(margin + statusCardWidth + 10, yPosition, statusCardWidth, statusCardHeight, colors.warning)
        setColor(colors.warning)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        safeText('PENDING', margin + statusCardWidth + 15, yPosition + 8)
        pdf.setFontSize(18)
        safeText(String(stats.pending || 0), margin + statusCardWidth + 15, yPosition + 16)
        
        // Overdue estimation (if we have due dates)
        const overdueCount = todos.filter(todo => 
          todo.dueDate && new Date(todo.dueDate) < new Date()
        ).length
        
        addCard(margin + (statusCardWidth + 10) * 2, yPosition, statusCardWidth, statusCardHeight, colors.danger)
        setColor(colors.danger)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        safeText('OVERDUE', margin + (statusCardWidth + 10) * 2 + 5, yPosition + 8)
        pdf.setFontSize(18)
        safeText(String(overdueCount), margin + (statusCardWidth + 10) * 2 + 5, yPosition + 16)
        
        yPosition += statusCardHeight + 25
      }
      
      // ACTIVE TASKS SECTION
      if (todos && todos.length > 0) {
        // Section header with accent
        setFillColor(colors.secondary)
        pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 12, 'F')
        
        setColor([255, 255, 255])
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        safeText(`ACTIVE TASKS (${todos.length})`, margin, yPosition + 3)
        
        yPosition += 20
        
        todos.forEach((todo, index) => {
          // Check for page break
          if (yPosition > pageHeight - 50) {
            pdf.addPage()
            yPosition = 30
          }
          
          // Task card
          const taskCardHeight = 22 + (todo.description ? 6 : 0)
          
          // Priority color coding
          let priorityColor = colors.muted
          if (todo.priority === 'HIGH') priorityColor = colors.danger
          else if (todo.priority === 'MEDIUM') priorityColor = colors.warning
          else if (todo.priority === 'LOW') priorityColor = colors.success
          
          addCard(margin, yPosition, contentWidth, taskCardHeight, priorityColor)
          
          // Priority badge
          setFillColor(priorityColor)
          pdf.roundedRect(margin + 5, yPosition + 3, 15, 6, 1, 1, 'F')
          pdf.setFontSize(7)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(255, 255, 255)
          safeText(todo.priority.charAt(0), margin + 12, yPosition + 7, { align: 'center' })
          
          // Task title
          setColor(colors.text)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          safeText(`${index + 1}. ${todo.title || 'Untitled Task'}`, margin + 25, yPosition + 8)
          
          // Description
          if (todo.description) {
            setColor(colors.muted)
            pdf.setFontSize(9)
            pdf.setFont('helvetica', 'normal')
            safeText(todo.description, margin + 25, yPosition + 14)
          }
          
          // Due date and created date
          setColor(colors.muted)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          const dueText = `Due: ${formatDate(todo.dueDate)}`
          const createdText = `Created: ${new Date(todo.createdAt).toLocaleDateString()}`
          safeText(`${dueText} | ${createdText}`, margin + 25, yPosition + taskCardHeight - 4)
          
          yPosition += taskCardHeight + 8
        })
        
        yPosition += 10
      }
      
      // COMPLETED TASKS SECTION
      if (completedTodos && completedTodos.length > 0) {
        // Check for page break
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 30
        }
        
        // Section header
        setFillColor(colors.success)
        pdf.rect(margin - 5, yPosition - 5, contentWidth + 10, 12, 'F')
        
        setColor([255, 255, 255])
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        safeText(`COMPLETED TASKS (${completedTodos.length})`, margin, yPosition + 3)
        
        yPosition += 20
        
        const tasksToShow = completedTodos.slice(0, 12)
        
        // Grid layout for completed tasks
        const cols = 2
        const colWidth = (contentWidth - 10) / cols
        let currentCol = 0
        let baseY = yPosition
        
        tasksToShow.forEach((todo, index) => {
          const xPos = margin + (currentCol * (colWidth + 10))
          const yPos = baseY + Math.floor(index / cols) * 12
          
          // Check for page break
          if (yPos > pageHeight - 30) {
            pdf.addPage()
            baseY = 30
            yPosition = baseY
          }
          
          setColor(colors.success)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          safeText(`✓ ${todo.title || 'Untitled Task'}`, xPos, yPos)
          
          currentCol = (currentCol + 1) % cols
        })
        
        yPosition = baseY + Math.ceil(tasksToShow.length / cols) * 12 + 10
        
        if (completedTodos.length > 12) {
          setColor(colors.muted)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'italic')
          safeText(`... and ${completedTodos.length - 12} more completed tasks`, margin, yPosition)
        }
      }
      
      // FOOTER
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        
        // Footer background
        setFillColor(colors.light)
        pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F')
        
        // Footer text
        setColor(colors.muted)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'normal')
        safeText(`Page ${i} of ${totalPages}`, margin, pageHeight - 7)
        safeText('Generated by Maxiphy Todo App', pageWidth - margin, pageHeight - 7, { align: 'right' })
      }
      
      return pdf.output('blob')
    } catch (error) {
      console.error('PDF Generation Error:', error)
      throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleShare = async () => {
    setIsProcessing(true)
    
    try {
      const pdfBlob = await generatePDF()
      const filename = `todos-${new Date().toISOString().split('T')[0]}.pdf`
      
      // Check if Web Share API supports files
      if (navigator.share && 'canShare' in navigator) {
        try {
          const file = new File([pdfBlob], filename, { type: 'application/pdf' })
          const canShareFiles = navigator.canShare({ files: [file] })
          
          if (canShareFiles) {
            await navigator.share({
              title: 'My Todo List',
              text: 'Check out my todo list!',
              files: [file],
            })
            return
          }
        } catch (shareError) {
          console.log('File sharing failed, falling back to download:', shareError)
        }
      }
      
      // Fallback: create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      alert('PDF downloaded! You can now share it from your downloads folder.')
      
    } catch (error) {
      console.error('Share failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate PDF: ${errorMessage}. Please try again.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      alert('Please allow pop-ups to use the print feature')
      return
    }

    const printContent = generatePrintContent()
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.print()
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }
  }

  const handleDownload = async (format: 'json' | 'csv' | 'pdf') => {
    setIsProcessing(true)
    setShowDropdown(false)
    
    try {
      const allTodos = [...todos, ...completedTodos]
      let content: string | Blob
      let filename: string
      let mimeType: string

      if (format === 'pdf') {
        content = await generatePDF()
        filename = `todos-${new Date().toISOString().split('T')[0]}.pdf`
        mimeType = 'application/pdf'
      } else if (format === 'json') {
        const exportData = {
          exportDate: new Date().toISOString(),
          stats,
          todos: allTodos.map(todo => ({
            title: todo.title,
            description: todo.description || '',
            priority: todo.priority,
            dueDate: todo.dueDate || '',
            completed: todo.completed,
            isPinned: todo.isPinned,
            createdAt: todo.createdAt,
            updatedAt: todo.updatedAt,
          }))
        }
        content = JSON.stringify(exportData, null, 2)
        filename = `todos-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        // CSV format
        const csvHeader = 'Title,Description,Priority,Due Date,Status,Pinned,Created,Updated\n'
        const csvRows = allTodos.map(todo => {
          const row = [
            `"${todo.title.replace(/"/g, '""')}"`,
            `"${(todo.description || '').replace(/"/g, '""')}"`,
            todo.priority,
            todo.dueDate || '',
            todo.completed ? 'Completed' : 'Pending',
            todo.isPinned ? 'Yes' : 'No',
            new Date(todo.createdAt).toLocaleDateString(),
            new Date(todo.updatedAt).toLocaleDateString(),
          ]
          return row.join(',')
        }).join('\n')
        
        content = csvHeader + csvRows
        filename = `todos-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={isProcessing}
        className="gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 hover:shadow-sm"
      >
        <Share2 className="h-4 w-4" />
        {isProcessing ? 'Generating...' : 'Share'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 hover:shadow-sm"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      
      <div 
        className="relative"
        ref={dropdownRef}
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={isProcessing}
          className="gap-2 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 hover:shadow-sm min-w-[100px]"
        >
          <Download className="h-4 w-4" />
          <span className="flex-1">{isProcessing ? 'Processing...' : 'Download'}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
        
        {/* Download Dropdown */}
        <div className={`absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 transition-all duration-200 min-w-[100px] ${
          showDropdown ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-1'
        }`}>
          <button
            onClick={() => handleDownload('json')}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg disabled:opacity-50 transition-colors duration-150"
          >
            JSON
          </button>
          <button
            onClick={() => handleDownload('csv')}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors duration-150"
          >
            CSV
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isProcessing}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg disabled:opacity-50 transition-colors duration-150"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}