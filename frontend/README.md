# Maxiphy Todo Frontend

A modern, responsive frontend built with Next.js 15, TypeScript, and Tailwind CSS for the Maxiphy technical assessment.

## 🚀 Features

### ✅ Core Requirements
- **Authentication System**
  - User registration (name, email, password)
  - User login (email, password)
  - JWT-based authentication
  - Protected routes

- **Todo Management**
  - Create, read, update, delete todos
  - Priority levels (High, Medium, Low)
  - Due date tracking
  - Completion status
  - User-specific todos only

- **Required Components**
  - ✅ Custom todo component (`TodoItem`)
  - ✅ Reusable input component (`Input`)
  - ✅ Interactive button component (`Button`)

### 🎯 Bonus Features Implemented
- **Enhanced UX/UI**
  - Modern, polished design
  - Responsive across all devices
  - Smooth animations and transitions
  - Loading states and error handling

- **Advanced Functionality**
  - Tanstack Query for data caching
  - Debounced search (title, description filtering)
  - Todo pinning capability
  - Real-time statistics dashboard
  - Pagination and sorting options
  - Priority-based visual indicators
  - Due date tracking with overdue warnings

## 🏗️ Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Tanstack Query
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🚦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## 🔄 User Flow

1. **Landing Page** → Redirects based on auth status
2. **Authentication** → Login or Register forms
3. **Dashboard** → Main todo interface with statistics, search, filtering, and CRUD operations

## 📱 Responsive Design

Fully responsive across desktop, tablet, and mobile devices with touch-friendly interface and accessible design.

---

**Built for the Maxiphy Technical Assessment** 🚀
