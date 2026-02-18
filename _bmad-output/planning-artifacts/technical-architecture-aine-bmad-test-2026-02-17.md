# Technical Architecture: aine-bmad-test

**Project**: Mobile-First Task Management Application  
**Date**: 2026-02-17  
**Author**: Pregno  
**Version**: 1.0 (MVP)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Models](#data-models)
5. [API Specifications](#api-specifications)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Docker Configuration](#docker-configuration)
9. [Testing Strategy](#testing-strategy)
10. [Development Workflow](#development-workflow)
11. [Performance Considerations](#performance-considerations)
12. [Security Considerations](#security-considerations)

---

## System Overview

### Architecture Philosophy

This application follows a **clean, layered architecture** with clear separation of concerns:

- **Frontend**: React SPA with optimistic UI patterns
- **Backend**: RESTful API with Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker Compose for development and testing environments

### Key Architectural Principles

1. **Simplicity First**: Avoid over-engineering; deliver working features
2. **Type Safety**: TypeScript strict mode across entire stack
3. **Testability**: All layers designed for comprehensive test coverage
4. **Stateless Backend**: RESTful API with no session state
5. **Optimistic UI**: Frontend assumes success, handles failures gracefully
6. **Offline Resilience**: Queue operations when network unavailable

---

## Technology Stack

### Package Management
- **pnpm** - Fast, disk-efficient package manager

### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **UI Library**: Material-UI (MUI) v5
- **State Management**: TanStack Query v5 (React Query)
- **HTTP Client**: Axios (configured for optimistic updates)
- **Build Tool**: Vite 5+
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

### Backend
- **Framework**: Fastify 4+ with TypeScript
- **ORM**: Prisma 5+
- **Database Driver**: PostgreSQL client via Prisma
- **Validation**: Zod (schema validation)
- **Scheduled Jobs**: node-cron (24-hour completed task cleanup)
- **Testing**: Vitest (unit/integration)
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

### Database
- **DBMS**: PostgreSQL 16+
- **Schema Management**: Prisma Migrations
- **Connection Pooling**: Prisma connection pool

### DevOps
- **Containerization**: Docker + Docker Compose
- **Environment Management**: dotenv files per environment
- **E2E Testing**: Playwright with Docker test environment

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────┐              ┌────────────────┐         │
│  │  Mobile Browser│              │ Desktop Browser│         │
│  │   (Chrome/     │              │  (Chrome/      │         │
│  │    Safari)     │              │   Firefox)     │         │
│  └────────┬───────┘              └────────┬───────┘         │
│           │                               │                  │
│           └───────────────┬───────────────┘                  │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    Frontend Container                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Application                        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Components (MUI Material Design)            │   │   │
│  │  │  - TaskList, TaskItem, AddTaskDialog         │   │   │
│  │  │  - FloatingActionButton, CompletedSection    │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  State Management (TanStack Query)           │   │   │
│  │  │  - Optimistic Updates                         │   │   │
│  │  │  - Automatic Retry Logic                      │   │   │
│  │  │  - Offline Queue                              │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  API Client (Axios)                           │   │   │
│  │  │  - REST endpoint calls                        │   │   │
│  │  │  - Error handling                             │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Served by: Nginx (production) / Vite Dev Server (dev)      │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ HTTP REST API
                            │ (JSON)
┌───────────────────────────▼──────────────────────────────────┐
│                     Backend Container                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Fastify Application                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Routes Layer                                 │   │   │
│  │  │  - /api/tasks (CRUD endpoints)                │   │   │
│  │  │  - CORS, validation, error handling           │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Service Layer (Business Logic)              │   │   │
│  │  │  - Task operations                            │   │   │
│  │  │  - Data validation (Zod schemas)              │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Repository Layer (Data Access)               │   │   │
│  │  │  - Prisma client wrapper                      │   │   │
│  │  │  - Database operations                        │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ Prisma Client
                            │ (Type-safe queries)
┌───────────────────────────▼──────────────────────────────────┐
│                   Database Container                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL 16                            │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Database: todo_app                           │   │   │
│  │  │  ┌─────────────────────────────────────┐     │   │   │
│  │  │  │  Table: tasks                        │     │   │   │
│  │  │  │  - id (UUID, PK)                     │     │   │   │
│  │  │  │  - text (VARCHAR)                    │     │   │   │
│  │  │  │  - status (ENUM)                     │     │   │   │
│  │  │  │  - created_at (TIMESTAMP)            │     │   │   │
│  │  │  │  - completed_at (TIMESTAMP, nullable)│     │   │   │
│  │  │  └─────────────────────────────────────┘     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Volume: postgres_data (persists across container restarts)  │
└───────────────────────────────────────────────────────────────┘
```

### Component Communication Flow

**Task Creation Flow (Optimistic UI)**:
```
1. User taps FAB → opens dialog → types task → clicks save
2. Frontend: Generate temp ID → Add to local state → Show in UI immediately
3. Frontend: POST /api/tasks → Background API call
4. Backend: Validate → Insert to DB → Return task with real ID
5. Frontend: Replace temp ID with real ID in state
6. If API fails: Show error toast → Keep temp task with retry button
```

**Task Completion Flow**:
```
1. User taps task
2. Frontend: Update local state (cross out, move to completed) → Show immediately
3. Frontend: PATCH /api/tasks/:id → Background API call
4. Backend: Update task status + completion timestamp → Return updated task
5. Frontend: Confirm state matches response
6. If API fails: Revert UI change → Show error toast → Retry available
```

---

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TaskStatus {
  ACTIVE
  COMPLETED
}

model Task {
  id           String      @id @default(uuid())
  text         String      @db.VarChar(500)
  status       TaskStatus  @default(ACTIVE)
  createdAt    DateTime    @default(now()) @map("created_at")
  completedAt  DateTime?   @map("completed_at")

  @@map("tasks")
  @@index([status, createdAt])
}
```

### Database Schema Details

**Table: `tasks`**

| Column        | Type                  | Constraints           | Description                          |
|---------------|-----------------------|-----------------------|--------------------------------------|
| id            | UUID                  | PRIMARY KEY           | Unique task identifier               |
| text          | VARCHAR(500)          | NOT NULL              | Task description                     |
| status        | ENUM(ACTIVE,COMPLETED)| NOT NULL, DEFAULT ACTIVE | Task completion status           |
| created_at    | TIMESTAMP             | NOT NULL, DEFAULT NOW | Task creation timestamp              |
| completed_at  | TIMESTAMP             | NULLABLE              | Task completion timestamp            |

**Indexes**:
- `idx_status_created_at`: Composite index on (status, created_at) for efficient queries sorting by creation date within status

**Design Rationale**:
- **UUID for ID**: Allows client-side temp ID generation without collision risk
- **VARCHAR(500) for text**: Sufficient for task descriptions, prevents abuse
- **ENUM for status**: Type-safe, prevents invalid states
- **Separate completed_at**: Tracks both creation and completion times
- **Composite index**: Optimizes the primary query pattern (fetch active tasks newest-first, then completed tasks)

---

## API Specifications

### Base Configuration

**Base URL**: `http://localhost:3000/api`  
**Content-Type**: `application/json`  
**CORS**: Enabled for `http://localhost:5173` (Vite dev server)

### Endpoints

#### **GET /api/tasks**

Retrieve all tasks (active and completed).

**Request**:
```http
GET /api/tasks HTTP/1.1
Host: localhost:3000
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Review Sarah's PR",
      "status": "ACTIVE",
      "createdAt": "2026-02-17T09:15:30.000Z",
      "completedAt": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Update sprint board",
      "status": "COMPLETED",
      "createdAt": "2026-02-17T09:16:45.000Z",
      "completedAt": "2026-02-17T12:30:00.000Z"
    }
  ]
}
```

**Response Schema (Zod)**:
```typescript
const TaskSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500),
  status: z.enum(['ACTIVE', 'COMPLETED']),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

const GetTasksResponseSchema = z.object({
  tasks: z.array(TaskSchema),
});
```

**Error Responses**:
- `500 Internal Server Error`: Database connection failure

---

#### **POST /api/tasks**

Create a new task.

**Request**:
```http
POST /api/tasks HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "text": "Follow up on client proposal"
}
```

**Request Schema (Zod)**:
```typescript
const CreateTaskSchema = z.object({
  text: z.string().min(1, "Task text is required").max(500, "Task text too long"),
});
```

**Response** (201 Created):
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "text": "Follow up on client proposal",
    "status": "ACTIVE",
    "createdAt": "2026-02-17T14:22:10.000Z",
    "completedAt": null
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body (missing text, text too long)
  ```json
  {
    "error": "Validation failed",
    "details": [
      {
        "field": "text",
        "message": "Task text is required"
      }
    ]
  }
  ```
- `500 Internal Server Error`: Database error

---

#### **PATCH /api/tasks/:id**

Update task status (complete/uncomplete).

**Request**:
```http
PATCH /api/tasks/550e8400-e29b-41d4-a716-446655440002 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

**Request Schema (Zod)**:
```typescript
const UpdateTaskSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED']),
});
```

**Response** (200 OK):
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "text": "Follow up on client proposal",
    "status": "COMPLETED",
    "createdAt": "2026-02-17T14:22:10.000Z",
    "completedAt": "2026-02-17T15:45:30.000Z"
  }
}
```

**Business Logic**:
- When status changes to `COMPLETED`: Set `completedAt` to current timestamp
- When status changes to `ACTIVE`: Set `completedAt` to `null`

**Error Responses**:
- `400 Bad Request`: Invalid status value
- `404 Not Found`: Task ID does not exist
  ```json
  {
    "error": "Task not found",
    "taskId": "550e8400-e29b-41d4-a716-446655440002"
  }
  ```
- `500 Internal Server Error`: Database error

---

#### **DELETE /api/tasks/:id**

Delete a task permanently.

**Request**:
```http
DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440002 HTTP/1.1
Host: localhost:3000
```

**Response** (204 No Content):
```
(Empty body)
```

**Error Responses**:
- `404 Not Found`: Task ID does not exist
- `500 Internal Server Error`: Database error

---

#### **DELETE /api/tasks/completed**

Bulk delete all completed tasks.

**Request**:
```http
DELETE /api/tasks/completed HTTP/1.1
Host: localhost:3000
```

**Response** (200 OK):
```json
{
  "deletedCount": 12
}
```

**Response Schema (Zod)**:
```typescript
const DeleteCompletedResponseSchema = z.object({
  deletedCount: z.number().int().nonnegative(),
});
```

**Error Responses**:
- `500 Internal Server Error`: Database error

---

### API Error Handling Strategy

**Error Response Format**:
```typescript
interface ErrorResponse {
  error: string;           // Human-readable error message
  code?: string;           // Machine-readable error code (e.g., "VALIDATION_ERROR")
  details?: any;           // Additional context (validation errors, etc.)
  timestamp: string;       // ISO 8601 timestamp
  path: string;            // Request path that caused error
}
```

**HTTP Status Codes Used**:
- `200 OK`: Successful GET/PATCH/DELETE (with body)
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE (no body)
- `400 Bad Request`: Validation errors, malformed requests
- `404 Not Found`: Resource does not exist
- `500 Internal Server Error`: Unexpected server errors

---

## Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Root component with routing
│   ├── components/
│   │   ├── TaskList.tsx         # Main task list container
│   │   ├── TaskItem.tsx         # Individual task component
│   │   ├── AddTaskButton.tsx    # Floating action button
│   │   ├── AddTaskDialog.tsx    # Task creation modal
│   │   ├── CompletedSection.tsx # Collapsed completed tasks section
│   │   └── ErrorToast.tsx       # Error notification component
│   ├── hooks/
│   │   ├── useTasks.ts          # TanStack Query hook for tasks
│   │   ├── useAddTask.ts        # Mutation hook for creating tasks
│   │   ├── useUpdateTask.ts     # Mutation hook for updating tasks
│   │   ├── useDeleteTask.ts     # Mutation hook for deleting tasks
│   │   └── useClearCompleted.ts # Mutation hook for bulk delete
│   ├── api/
│   │   ├── client.ts            # Axios instance configuration
│   │   ├── tasks.ts             # Task API methods
│   │   └── types.ts             # API request/response types
│   ├── types/
│   │   └── task.ts              # Domain types (Task interface)
│   ├── theme/
│   │   └── muiTheme.ts          # MUI theme configuration
│   └── utils/
│       ├── dateFormat.ts        # Timestamp formatting utilities
│       └── tempId.ts            # Temporary ID generation
├── tests/
│   ├── unit/
│   │   ├── components/          # Component unit tests
│   │   └── hooks/               # Hook unit tests
│   ├── integration/
│   │   └── api/                 # API integration tests
│   └── e2e/
│       └── tasks.spec.ts        # Playwright E2E tests
├── public/
│   └── manifest.json            # PWA manifest (future)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.development
```

### Key Components

#### **TaskList.tsx**
```typescript
// Responsibilities:
// - Fetch tasks using useTasks hook
// - Separate active vs completed tasks
// - Sort active tasks newest-first, completed oldest-first
// - Render TaskItem components
// - Handle loading/error states
// - Show empty state when no tasks

import { useTasks } from '../hooks/useTasks';
import TaskItem from './TaskItem';
import CompletedSection from './CompletedSection';
import AddTaskButton from './AddTaskButton';

export default function TaskList() {
  const { data, isLoading, error } = useTasks();
  
  const activeTasks = data?.tasks
    .filter(t => t.status === 'ACTIVE')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const completedTasks = data?.tasks
    .filter(t => t.status === 'COMPLETED')
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
  
  // ... render logic
}
```

#### **useTasks.ts (TanStack Query Hook)**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
```

#### **useAddTask.ts (Optimistic Mutation)**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../api/tasks';
import { generateTempId } from '../utils/tempId';
import type { Task } from '../types/task';

export function useAddTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTask,
    
    // Optimistic update
    onMutate: async (newTaskText) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>(['tasks']);
      
      // Optimistically update with temp ID
      const tempTask: Task = {
        id: generateTempId(),
        text: newTaskText,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      
      queryClient.setQueryData<{ tasks: Task[] }>(['tasks'], (old) => ({
        tasks: [tempTask, ...(old?.tasks || [])],
      }));
      
      return { previousTasks };
    },
    
    // If mutation fails, rollback
    onError: (err, newTask, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### State Management Strategy

**TanStack Query Configuration**:
```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // Data fresh for 1 minute
      refetchOnWindowFocus: true, // Refetch when tab regains focus
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2, // Retry failed mutations 2 times
    },
  },
});
```

**Offline Queue**:
- TanStack Query automatically queues mutations when offline
- Mutations execute when connection restored
- Failed mutations can be manually retried via UI

---

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── app.ts                   # Fastify app configuration
│   ├── routes/
│   │   └── tasks.ts             # Task routes
│   ├── services/
│   │   └── taskService.ts       # Business logic layer
│   ├── repositories/
│   │   └── taskRepository.ts    # Data access layer
│   ├── schemas/
│   │   └── taskSchemas.ts       # Zod validation schemas
│   ├── plugins/
│   │   ├── cors.ts              # CORS configuration
│   │   └── prisma.ts            # Prisma plugin
│   ├── jobs/
│   │   └── cleanupCompletedTasks.ts  # node-cron job: deletes completed tasks >24h
│   ├── types/
│   │   └── task.ts              # Domain types
│   └── utils/
│       ├── errorHandler.ts      # Global error handling
│       └── logger.ts            # Logging utility
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Migration files
│   └── seed.ts                  # Database seeding script
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── repositories/
│   ├── integration/
│   │   └── routes/
│   └── helpers/
│       └── testDb.ts            # Test database utilities
├── tsconfig.json
├── package.json
├── .env.development
└── .env.test
```

### Layered Architecture

#### **Routes Layer** (`routes/tasks.ts`)
```typescript
// Responsibilities:
// - HTTP routing and method handling
// - Request validation using Zod schemas
// - Call service layer
// - Format responses
// - Handle HTTP-specific errors

import { FastifyInstance } from 'fastify';
import { taskService } from '../services/taskService';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/taskSchemas';

export async function taskRoutes(fastify: FastifyInstance) {
  // GET /api/tasks
  fastify.get('/tasks', async (request, reply) => {
    const tasks = await taskService.getAllTasks();
    return { tasks };
  });
  
  // POST /api/tasks
  fastify.post('/tasks', {
    schema: {
      body: CreateTaskSchema,
    },
  }, async (request, reply) => {
    const { text } = request.body;
    const task = await taskService.createTask(text);
    return reply.code(201).send({ task });
  });
  
  // PATCH /api/tasks/:id
  fastify.patch('/tasks/:id', {
    schema: {
      body: UpdateTaskSchema,
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body;
    const task = await taskService.updateTaskStatus(id, status);
    return { task };
  });
  
  // DELETE /api/tasks/:id
  fastify.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await taskService.deleteTask(id);
    return reply.code(204).send();
  });
  
  // DELETE /api/tasks/completed
  fastify.delete('/tasks/completed', async (request, reply) => {
    const deletedCount = await taskService.clearCompleted();
    return { deletedCount };
  });
}
```

#### **Service Layer** (`services/taskService.ts`)
```typescript
// Responsibilities:
// - Business logic
// - Input validation
// - Orchestrate repository calls
// - Throw business-level errors

import { taskRepository } from '../repositories/taskRepository';
import type { TaskStatus } from '@prisma/client';

export const taskService = {
  async getAllTasks() {
    return taskRepository.findAll();
  },
  
  async createTask(text: string) {
    // Business validation
    if (text.trim().length === 0) {
      throw new Error('Task text cannot be empty');
    }
    
    return taskRepository.create(text.trim());
  },
  
  async updateTaskStatus(id: string, status: TaskStatus) {
    // Check task exists
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Set completion timestamp logic
    const completedAt = status === 'COMPLETED' ? new Date() : null;
    
    return taskRepository.update(id, { status, completedAt });
  },
  
  async deleteTask(id: string) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return taskRepository.delete(id);
  },
  
  async clearCompleted() {
    return taskRepository.deleteCompleted();
  },

  async deleteCompletedOlderThan(hours: number) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return taskRepository.deleteCompletedOlderThan(cutoff);
  },
};
```

#### **Scheduled Jobs Layer** (`jobs/cleanupCompletedTasks.ts`)

```typescript
// Responsibilities:
// - Register node-cron schedule on server startup
// - Delete completed tasks older than 24 hours
// - Log cleanup results via Pino
// - Handle errors gracefully without crashing the server

import cron from 'node-cron';
import { taskService } from '../services/taskService';
import { logger } from '../utils/logger';

const CLEANUP_INTERVAL_HOURS = 24;
const CRON_SCHEDULE = '0 * * * *'; // every hour

export function registerCleanupJob(): void {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const deletedCount = await taskService.deleteCompletedOlderThan(CLEANUP_INTERVAL_HOURS);
      logger.info({ deletedCount }, `Auto-cleanup completed: ${deletedCount} tasks deleted`);
    } catch (error) {
      logger.error({ error }, 'Auto-cleanup job failed — will retry on next run');
    }
  });
  logger.info(`Cleanup job scheduled: ${CRON_SCHEDULE} (deletes completed tasks older than ${CLEANUP_INTERVAL_HOURS}h)`);
}
```

**Integration in `app.ts`:** Call `registerCleanupJob()` after server startup.

**Behavior:**
- Runs every hour; deletes any completed task whose `completedAt` is >24 hours ago
- Silent to the user — no notifications, no UI changes until next task list fetch
- Fails gracefully: logs error, skips cycle, retries on next scheduled run
- Does not run in test environment (guarded by `NODE_ENV !== 'test'`)

#### **Repository Layer** (`repositories/taskRepository.ts`)
```typescript
// Responsibilities:
// - Database operations via Prisma
// - Data mapping (if needed)
// - Transaction management

import { prisma } from '../plugins/prisma';
import type { TaskStatus } from '@prisma/client';

export const taskRepository = {
  async findAll() {
    return prisma.task.findMany({
      orderBy: [
        { status: 'asc' },  // ACTIVE first, then COMPLETED
        { createdAt: 'desc' },
      ],
    });
  },
  
  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
    });
  },
  
  async create(text: string) {
    return prisma.task.create({
      data: { text },
    });
  },
  
  async update(id: string, data: { status: TaskStatus; completedAt: Date | null }) {
    return prisma.task.update({
      where: { id },
      data,
    });
  },
  
  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  },
  
  async deleteCompleted() {
    const result = await prisma.task.deleteMany({
      where: { status: 'COMPLETED' },
    });
    return result.count;
  },
};
```

### Fastify Configuration

#### **app.ts**
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { taskRoutes } from './routes/tasks';
import { errorHandler } from './utils/errorHandler';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });
  
  // CORS
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  // Routes
  await fastify.register(taskRoutes, { prefix: '/api' });
  
  // Global error handler
  fastify.setErrorHandler(errorHandler);
  
  return fastify;
}
```

---

## Docker Configuration

### Docker Compose Structure

```yaml
# docker-compose.yml

version: '3.9'

services:
  # PostgreSQL Database
  database:
    image: postgres:16-alpine
    container_name: todo-app-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-todo_app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - todo-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: todo-app-backend
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@database:5432/${DB_NAME:-todo_app}
      PORT: 3000
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "${BACKEND_PORT:-3000}:3000"
    depends_on:
      database:
        condition: service_healthy
    command: pnpm run dev
    networks:
      - todo-network

  # Frontend Application
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: ${BUILD_TARGET:-development}
    container_name: todo-app-frontend
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3000/api}
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "${FRONTEND_PORT:-5173}:5173"
    depends_on:
      - backend
    command: pnpm run dev
    networks:
      - todo-network

volumes:
  postgres_data:
    driver: local

networks:
  todo-network:
    driver: bridge
```

### Environment Files

#### **.env.development**
```bash
# Docker Compose
BUILD_TARGET=development
NODE_ENV=development

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app_dev
DB_PORT=5432

# Backend
BACKEND_PORT=3000
DATABASE_URL=postgresql://postgres:postgres@database:5432/todo_app_dev

# Frontend
FRONTEND_PORT=5173
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api

# Logging
LOG_LEVEL=debug
```

#### **.env.test**
```bash
# Docker Compose
BUILD_TARGET=test
NODE_ENV=test

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app_test
DB_PORT=5433

# Backend
BACKEND_PORT=3001
DATABASE_URL=postgresql://postgres:postgres@database:5432/todo_app_test

# Frontend
FRONTEND_PORT=5174
FRONTEND_URL=http://localhost:5174
VITE_API_URL=http://localhost:3001/api

# Logging
LOG_LEVEL=warn
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile

# Base stage
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development stage
FROM dependencies AS development
COPY . .
RUN pnpm prisma generate
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Build stage
FROM dependencies AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm run build

# Production stage
FROM base AS production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package.json pnpm-lock.yaml ./
RUN pnpm prisma generate
EXPOSE 3000
CMD ["node", "dist/index.js"]

# Test stage
FROM dependencies AS test
COPY . .
RUN pnpm prisma generate
ENV NODE_ENV=test
CMD ["pnpm", "run", "test"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

# Base stage
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development stage
FROM dependencies AS development
COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# Build stage
FROM dependencies AS build
COPY . .
RUN pnpm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Test stage
FROM dependencies AS test
COPY . .
ENV NODE_ENV=test
CMD ["pnpm", "run", "test"]
```

### Docker Commands

```bash
# Development environment
docker-compose --env-file .env.development up -d

# Test environment
docker-compose --env-file .env.test up -d

# Run database migrations (development)
docker-compose --env-file .env.development exec backend pnpm prisma migrate dev

# Run database migrations (test)
docker-compose --env-file .env.test exec backend pnpm prisma migrate deploy

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose --env-file .env.development up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

---

## Testing Strategy

### Test Coverage Goals

- **Overall Coverage**: Minimum 80%
- **Critical Paths**: 100% E2E coverage
- **Unit Tests**: Focus on business logic, utilities, hooks
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user flows

### Testing Pyramid

```
           ┌──────────┐
           │   E2E    │  (6 critical flows - Playwright)
           │  Tests   │
           └──────────┘
         ┌──────────────┐
         │ Integration  │  (API routes + DB - Vitest)
         │    Tests     │
         └──────────────┘
      ┌────────────────────┐
      │    Unit Tests      │  (Services, hooks, utils - Vitest)
      │                    │
      └────────────────────┘
```

### Unit Testing (Vitest)

#### **Backend: Service Layer Test**
```typescript
// backend/tests/unit/services/taskService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../../../src/services/taskService';
import { taskRepository } from '../../../src/repositories/taskRepository';

vi.mock('../../../src/repositories/taskRepository');

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('createTask', () => {
    it('should create task with trimmed text', async () => {
      const mockTask = { id: '123', text: 'Test task', status: 'ACTIVE' };
      vi.mocked(taskRepository.create).mockResolvedValue(mockTask);
      
      const result = await taskService.createTask('  Test task  ');
      
      expect(taskRepository.create).toHaveBeenCalledWith('Test task');
      expect(result).toEqual(mockTask);
    });
    
    it('should throw error for empty text', async () => {
      await expect(taskService.createTask('   ')).rejects.toThrow('Task text cannot be empty');
    });
  });
  
  describe('updateTaskStatus', () => {
    it('should set completedAt when marking as COMPLETED', async () => {
      const mockTask = { id: '123', text: 'Task', status: 'ACTIVE', completedAt: null };
      vi.mocked(taskRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(taskRepository.update).mockResolvedValue({ ...mockTask, status: 'COMPLETED' });
      
      await taskService.updateTaskStatus('123', 'COMPLETED');
      
      expect(taskRepository.update).toHaveBeenCalledWith('123', {
        status: 'COMPLETED',
        completedAt: expect.any(Date),
      });
    });
    
    it('should throw error for non-existent task', async () => {
      vi.mocked(taskRepository.findById).mockResolvedValue(null);
      
      await expect(taskService.updateTaskStatus('999', 'COMPLETED')).rejects.toThrow('Task not found');
    });
  });
});
```

#### **Frontend: Hook Test**
```typescript
// frontend/tests/unit/hooks/useAddTask.test.ts

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddTask } from '../../../src/hooks/useAddTask';
import * as api from '../../../src/api/tasks';

vi.mock('../../../src/api/tasks');

describe('useAddTask', () => {
  it('should optimistically add task to cache', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    // Mock API call
    vi.mocked(api.createTask).mockResolvedValue({
      task: { id: 'real-id', text: 'New task', status: 'ACTIVE', createdAt: new Date().toISOString(), completedAt: null },
    });
    
    const { result } = renderHook(() => useAddTask(), { wrapper });
    
    // Trigger mutation
    result.current.mutate('New task');
    
    // Check optimistic update
    await waitFor(() => {
      const tasks = queryClient.getQueryData(['tasks']);
      expect(tasks.tasks[0].text).toBe('New task');
      expect(tasks.tasks[0].id).toMatch(/^temp-/); // Temp ID
    });
    
    // Wait for real API response
    await waitFor(() => {
      const tasks = queryClient.getQueryData(['tasks']);
      expect(tasks.tasks[0].id).toBe('real-id'); // Real ID replaced temp
    });
  });
});
```

### Integration Testing (Vitest)

#### **Backend: API Route Test**
```typescript
// backend/tests/integration/routes/tasks.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../../src/app';
import { prisma } from '../../../src/plugins/prisma';
import type { FastifyInstance } from 'fastify';

describe('Task Routes', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    // Clear test database
    await prisma.task.deleteMany();
  });
  
  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });
  
  describe('POST /api/tasks', () => {
    it('should create new task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: 'Test task' },
      });
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.task).toMatchObject({
        text: 'Test task',
        status: 'ACTIVE',
        completedAt: null,
      });
      expect(body.task.id).toBeDefined();
      expect(body.task.createdAt).toBeDefined();
    });
    
    it('should return 400 for empty text', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/tasks',
        payload: { text: '' },
      });
      
      expect(response.statusCode).toBe(400);
    });
  });
  
  describe('GET /api/tasks', () => {
    it('should return all tasks sorted by status and date', async () => {
      // Create test data
      await prisma.task.create({ data: { text: 'Active task 1' } });
      await prisma.task.create({ data: { text: 'Active task 2' } });
      await prisma.task.create({ data: { text: 'Completed task', status: 'COMPLETED', completedAt: new Date() } });
      
      const response = await app.inject({
        method: 'GET',
        url: '/api/tasks',
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.tasks).toHaveLength(3);
      
      // Active tasks first
      expect(body.tasks[0].status).toBe('ACTIVE');
      expect(body.tasks[1].status).toBe('ACTIVE');
      expect(body.tasks[2].status).toBe('COMPLETED');
    });
  });
});
```

### E2E Testing (Playwright)

#### **Critical User Flows**
```typescript
// frontend/tests/e2e/tasks.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');
  });
  
  test('should add a new task', async ({ page }) => {
    // Click floating action button
    await page.click('[aria-label="Add task"]');
    
    // Type task text
    await page.fill('input[placeholder="What needs to be done?"]', 'Review PR #123');
    
    // Submit
    await page.click('button:has-text("Add")');
    
    // Verify task appears in list
    await expect(page.locator('text=Review PR #123')).toBeVisible();
    
    // Verify timestamp is visible
    await expect(page.locator('text=/Feb \\d+, \\d+:\\d+ (AM|PM)/')).toBeVisible();
  });
  
  test('should complete a task', async ({ page }) => {
    // Add task first
    await page.click('[aria-label="Add task"]');
    await page.fill('input[placeholder="What needs to be done?"]', 'Task to complete');
    await page.click('button:has-text("Add")');
    
    // Click task to mark complete
    await page.click('text=Task to complete');
    
    // Verify task is crossed out
    await expect(page.locator('text=Task to complete')).toHaveCSS('text-decoration', /line-through/);
    
    // Verify task moved to completed section
    const completedSection = page.locator('[aria-label="Completed tasks"]');
    await expect(completedSection.locator('text=Task to complete')).toBeVisible();
  });
  
  test('should delete a task', async ({ page }) => {
    // Add task first
    await page.click('[aria-label="Add task"]');
    await page.fill('input[placeholder="What needs to be done?"]', 'Task to delete');
    await page.click('button:has-text("Add")');
    
    // Swipe or click delete button
    await page.hover('text=Task to delete');
    await page.click('[aria-label="Delete task"]');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify task is gone
    await expect(page.locator('text=Task to delete')).not.toBeVisible();
  });
  
  test('should clear all completed tasks', async ({ page }) => {
    // Add and complete multiple tasks
    for (let i = 1; i <= 3; i++) {
      await page.click('[aria-label="Add task"]');
      await page.fill('input[placeholder="What needs to be done?"]', `Completed task ${i}`);
      await page.click('button:has-text("Add")');
      await page.click(`text=Completed task ${i}`);
    }
    
    // Click clear completed button
    await page.click('button:has-text("Clear Completed")');
    
    // Verify all completed tasks are gone
    await expect(page.locator('text=/Completed task \\d/')).not.toBeVisible();
  });
  
  test('should persist tasks across page refresh', async ({ page }) => {
    // Add task
    await page.click('[aria-label="Add task"]');
    await page.fill('input[placeholder="What needs to be done?"]', 'Persistent task');
    await page.click('button:has-text("Add")');
    
    // Refresh page
    await page.reload();
    
    // Verify task still exists
    await expect(page.locator('text=Persistent task')).toBeVisible();
  });
  
  test('should sync tasks across devices (simulate with two browser contexts)', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    await page1.goto('http://localhost:5173');
    await page2.goto('http://localhost:5173');
    
    // Add task on page1
    await page1.click('[aria-label="Add task"]');
    await page1.fill('input[placeholder="What needs to be done?"]', 'Synced task');
    await page1.click('button:has-text("Add")');
    
    // Refresh page2 to fetch latest tasks
    await page2.reload();
    
    // Verify task appears on page2
    await expect(page2.locator('text=Synced task')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });
});
```

### Running Tests

```json
// package.json scripts

{
  "scripts": {
    // Backend
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    
    // Frontend
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    
    // All tests
    "test:all": "pnpm -r test && playwright test"
  }
}
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd aine-bmad-test

# Install pnpm globally (if not installed)
npm install -g pnpm

# Install dependencies for all workspaces
pnpm install

# Set up environment files
cp .env.example .env.development
cp .env.example .env.test

# Start Docker Compose (development)
docker-compose --env-file .env.development up -d

# Run database migrations
docker-compose --env-file .env.development exec backend pnpm prisma migrate dev

# Seed database (optional)
docker-compose --env-file .env.development exec backend pnpm prisma db seed
```

### Daily Development

```bash
# Start all services
docker-compose --env-file .env.development up -d

# View logs
docker-compose logs -f

# Access services:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Database: localhost:5432

# Run tests
docker-compose --env-file .env.development exec backend pnpm test
docker-compose --env-file .env.development exec frontend pnpm test

# Stop services
docker-compose down
```

### Database Migrations

```bash
# Create new migration
docker-compose exec backend pnpm prisma migrate dev --name add_field_name

# Apply migrations to test DB
docker-compose --env-file .env.test exec backend pnpm prisma migrate deploy

# Reset database (development only - data loss!)
docker-compose exec backend pnpm prisma migrate reset

# View database in Prisma Studio
docker-compose exec backend pnpm prisma studio
```

### Code Quality

```bash
# Lint
pnpm -r lint

# Format
pnpm -r format

# Type check
pnpm -r type-check

# Pre-commit hook (recommended)
# Install husky + lint-staged
pnpm add -D husky lint-staged
pnpm exec husky init
```

---

## Performance Considerations

### Frontend Optimizations

1. **Code Splitting**
   - Lazy load routes with React.lazy()
   - Dynamic imports for heavy components
   
2. **Bundle Size**
   - Tree-shake Material-UI (import individual components)
   - Analyze bundle with `vite-plugin-bundle-analyzer`
   
3. **Rendering Optimization**
   - Memoize TaskItem components (React.memo)
   - Use virtualization for 100+ task lists (react-virtual)
   
4. **Network Optimization**
   - TanStack Query automatic request deduplication
   - Stale-while-revalidate caching strategy
   - Optimistic updates reduce perceived latency

### Backend Optimizations

1. **Database Queries**
   - Composite index on (status, created_at) for main query
   - Connection pooling via Prisma (max 10 connections)
   
2. **Response Times**
   - Target: < 50ms for CRUD operations
   - Fastify is inherently fast (no additional optimization needed for MVP)
   
3. **Future Optimizations** (if needed)
   - Redis caching for frequently accessed tasks
   - Database read replicas for scaling
   - CDN for static frontend assets

### Database Optimizations

1. **Indexing Strategy**
   - Primary key (UUID) automatically indexed
   - Composite index (status, created_at) optimizes main query
   
2. **Query Performance**
   - Use `EXPLAIN ANALYZE` to verify index usage
   - Monitor slow queries (> 100ms)

---

## Security Considerations

### Current Security Posture (v1 - No Auth)

**Threat Model**:
- **Threat**: Unauthorized access to task data
- **Mitigation**: Application runs on local/home network only
- **Residual Risk**: Anyone on network can access all tasks

**Security Measures**:
1. **Input Validation**
   - Zod schemas validate all API inputs
   - Prevent SQL injection (Prisma parameterized queries)
   - Text length limits (500 chars) prevent abuse
   
2. **CORS Configuration**
   - Restrict origin to frontend URL only
   - Prevent cross-origin requests from unknown sources
   
3. **Database Security**
   - Database credentials in environment variables
   - No database exposed to public internet (Docker network only)
   
4. **Error Handling**
   - No sensitive data in error messages
   - Generic error responses for production

### Future Security Enhancements (v2 - With Auth)

1. **Authentication**
   - JWT tokens with httpOnly cookies
   - Bcrypt password hashing
   
2. **Authorization**
   - User ID on tasks table (foreign key)
   - API middleware enforces user ownership
   
3. **Rate Limiting**
   - Fastify rate-limit plugin
   - Prevent brute force, DoS attacks
   
4. **HTTPS**
   - TLS certificates (Let's Encrypt)
   - Secure cookies (secure flag)

---

## Appendix: Technology Justification

### Why Fastify over Express?

- **Performance**: 2-3x faster than Express
- **TypeScript Support**: First-class TypeScript integration
- **Schema Validation**: Built-in JSON schema validation
- **Plugin System**: Clean, modular architecture
- **Active Development**: Modern, well-maintained

### Why Prisma over TypeORM?

- **Type Safety**: Auto-generated types from schema
- **DX**: Excellent developer experience (migrations, studio)
- **Query Builder**: Intuitive, type-safe query API
- **Performance**: Optimized query generation
- **Migration System**: Declarative schema, automatic migrations

### Why TanStack Query over Redux?

- **Built for Async State**: Designed for server state management
- **Less Boilerplate**: Hooks-based, minimal setup
- **Optimistic Updates**: First-class support
- **Automatic Retry**: Network resilience built-in
- **Caching Strategy**: Stale-while-revalidate out of the box

### Why Vitest over Jest?

- **Speed**: 10x faster than Jest (ESM-native)
- **Vite Integration**: Same config, instant HMR for tests
- **Compatible API**: Jest-compatible API (easy migration)
- **Modern**: Built for modern JavaScript/TypeScript

### Why Playwright over Cypress?

- **Multi-Browser**: Chromium, Firefox, WebKit support
- **Speed**: Faster execution, parallel tests
- **Network Interception**: Powerful request/response mocking
- **Auto-Wait**: Smarter element waiting
- **TypeScript**: Excellent TypeScript support

---

**Document Status**: ✅ Complete and ready for implementation

**Next Steps**: 
1. Review and approve technical architecture
2. Set up project scaffolding (pnpm workspaces, Docker Compose)
3. Implement backend API with tests
4. Implement frontend with optimistic UI
5. E2E testing and integration validation
