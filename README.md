# Maxiphy Todo Application

A full-stack todo application built with Next.js and NestJS for the Maxiphy technical assessment.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (local installation)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Maxiphy
npm install  # Install root workspace dependencies
```

### 2. Database Setup
```bash
# Start PostgreSQL (local)
# Option 1: Using Docker (recommended)
docker-compose up -d

# Option 2: Local PostgreSQL
# Make sure PostgreSQL is running on localhost:5432
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your environment variables
npx prisma migrate dev  # Run database migrations
npx prisma generate     # Generate Prisma client
npm run start:dev       # Start backend server (http://localhost:3001)
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Start frontend server (http://localhost:3000)
```

## 📁 Project Structure

```
Maxiphy/
├── README.md           # This file
├── CLAUDE.md          # Project requirements and documentation
├── docker-compose.yml # PostgreSQL Docker setup
├── package.json       # Root workspace scripts
├── .gitignore         # Git ignore rules
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js App Router
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── README.md
└── backend/           # NestJS application
    ├── src/
    │   ├── auth/      # Authentication module
    │   ├── users/     # User management
    │   ├── todos/     # Todo CRUD operations
    │   └── common/    # Shared utilities
    ├── prisma/        # Database schema and migrations
    ├── package.json
    └── README.md
```

## 🛠️ Development Scripts

### Root Level
```bash
npm run dev         # Start both frontend and backend
npm run build       # Build both applications
npm run test        # Run all tests
npm run lint        # Lint both applications
npm run clean       # Clean all node_modules and build files
```

### Backend Only
```bash
cd backend
npm run start:dev   # Development server
npm run build       # Build for production
npm run test        # Run Jest tests
npm run test:watch  # Watch mode for tests
```

### Frontend Only
```bash
cd frontend  
npm run dev         # Development server
npm run build       # Build for production
npm run test        # Run React Testing Library tests
npm run lint        # ESLint
```

## 🔧 Environment Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/maxiphy_todo"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏗️ Core Features

### ✅ Authentication
- User registration (name, email, password)
- User login (email, password)
- JWT-based authentication
- Protected routes

### ✅ Todo Management
- Create, read, update, delete todos
- Priority levels (High, Medium, Low)
- Date tracking
- Completion status
- User-specific todos only

### ✅ Components
- Reusable input components
- Interactive button components
- Custom todo components
- Responsive design

## 🎯 Bonus Features Implemented

- [ ] Tanstack Query for data caching
- [ ] Debounced search functionality
- [ ] Task pinning capability
- [ ] Backend tests with Jest
- [ ] Frontend tests with React Testing Library
- [ ] Pagination for task lists
- [ ] Advanced sorting options
- [ ] Consistent UI/UX theming

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend tests only
cd backend && npm run test

# Frontend tests only  
cd frontend && npm run test
```

## 📦 Production Build

```bash
# Build both applications
npm run build

# Or individually
cd backend && npm run build
cd frontend && npm run build
```

## 🔒 Security Features

- JWT authentication for all todo operations
- User isolation (users can only access their own todos)
- Input validation and sanitization
- Protected API routes
- CORS configuration

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Todo Endpoints
- `GET /todos` - Get user's todos
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
- `PATCH /todos/:id/toggle` - Toggle completion status

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Use descriptive commit messages

## 📋 Assessment Criteria Checklist

- [x] Working project setup
- [x] Clean code organization
- [x] TypeScript implementation
- [x] Next.js App Router usage
- [x] NestJS backend architecture
- [x] Prisma ORM integration
- [x] PostgreSQL database
- [x] JWT authentication
- [x] Responsive design
- [x] Git best practices
- [x] Clear documentation

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Developed for Maxiphy Technical Assessment** 🚀