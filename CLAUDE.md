# Maxiphy Full-Stack Assessment - Todo Application

## Project Overview
A full-stack todo-list web application built with Next.js (frontend) and NestJS (backend) as part of the Maxiphy technical assessment.

## Tech Stack Requirements

### Frontend
- **Next.js** (App Router with server components)
- **TypeScript** (required)
- **React**
- Responsive design for all devices
- Server components where appropriate
- Stateless architecture

### Backend
- **NestJS** (https://docs.nestjs.com/)
- **Prisma** ORM (https://www.prisma.io/docs/)
- **PostgreSQL** database (local setup)

### Additional Technologies
- HTML, CSS, JavaScript fundamentals
- Git with clear commit history

## Core Features

### Authentication System
- **Registration**: Name, Email, Password
- **Login**: Email, Password
- JWT-based authentication
- Route protection for authenticated users only

### Todo Management (CRUD)
- Create, Read, Update, Delete todos
- Each todo has:
  - Description
  - Priority Level (3 levels: High, Medium, Low)
  - Date
  - Completed boolean status
- List remaining todos (ordered by date and priority)
- Show completed todos (ordered by date and priority)
- Security: Users can only manage their own todos

## Required Components
- Custom todo component
- Reusable input component
- Interactive button component

## Wireframes Provided
- Register Screen
- Login Screen
- TODO List View
- TODO Add/Edit Form

## Bonus Features (Implementation Priority)
1. **Highlighted Additions**:
   - Good UI/UX design
   - Maximize Next.js App Router and server components usage
   - Stateless architecture

2. **Additional Features**:
   - Tanstack Query for data caching
   - Debounced search bar (filter by title, description, date)
   - Pin tasks to top of list
   - Backend tests with Jest (at least 1 service + 1 controller)
   - Frontend tests with @testing-library/react (at least 1 component)
   - Detailed README with API routes and component documentation
   - Consistent UI/UX theming
   - Pagination for task lists
   - Sorting by priority, date, and completion status

## Development Guidelines
- Use Next.js default setup configuration
- Implement proper error handling
- Ensure responsive design across devices
- Security: Authenticated users only for todo operations
- Local PostgreSQL database (no hosting required)

## Evaluation Criteria
- Working project functionality
- Code quality and organization
- Feature implementation accuracy
- Technical proficiency
- Attention to detail and instruction accuracy
- Git usage with clear commit messages
- Bonus feature implementation

## Project Structure
```
/
├── backend/          # NestJS backend
├── frontend/         # Next.js frontend
└── CLAUDE.md        # This file
```

## Submission
- Push to public GitHub repository
- Send link to join@maxiphy.com

## Development Commands
Backend:
```bash
cd backend
npm run start:dev    # Start NestJS development server
npm run test         # Run Jest tests
```

Frontend:
```bash
cd frontend
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run test         # Run frontend tests
```

## Database Setup
- Local PostgreSQL instance
- Prisma for ORM and migrations
- User authentication with JWT
- Todo items linked to authenticated users

## Security Requirements
- JWT authentication for all todo operations
- Users can only access/modify their own todos
- Proper error handling for unauthorized access
- Input validation and sanitization

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## IMPORTANT: Git Commit Messages
**NEVER include Claude attribution in commit messages.** 
- Do NOT add "Generated with Claude Code" or any Claude references
- Do NOT add "Co-Authored-By: Claude" in commits
- Keep commit messages professional and clean
- The user does not want others to know AI assistance was used