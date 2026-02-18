---
stepsCompleted: [1]
inputDocuments: 
  - product-brief-aine-bmad-test-2026-02-17.md
  - technical-architecture-aine-bmad-test-2026-02-17.md
workflowType: 'architecture'
project_name: 'aine-bmad-test'
user_name: 'Pregno'
date: '2026-02-17'
---

# Architecture Decision Document

**Project**: Mobile-First Task Management Application  
**Date**: 2026-02-17  
**Author**: Pregno (with Winston, Architect)  
**Purpose**: Implementation-focused architectural decisions complementing the technical architecture specification

---

## Document Purpose

This document captures **specific architectural decisions** made during the refinement phase of the architecture workflow. It complements the comprehensive `technical-architecture-aine-bmad-test-2026-02-17.md` by focusing on implementation details, tooling choices, and development workflow decisions.

**Related Documents**:
- **Technical Architecture**: `/planning-artifacts/technical-architecture-aine-bmad-test-2026-02-17.md` (System design, API specs, data models)
- **Product Brief**: `/planning-artifacts/product-brief-aine-bmad-test-2026-02-17.md` (Vision, requirements, success criteria)

---

## Table of Contents

1. [Workspace Structure & Monorepo Setup](#1-workspace-structure--monorepo-setup)
2. [Development Environment Details](#2-development-environment-details)
3. [Error Handling & Logging Strategy](#3-error-handling--logging-strategy)
4. [State Management Patterns](#4-state-management-patterns)
5. [Testing Infrastructure](#5-testing-infrastructure)
6. [API Versioning & Evolution](#6-api-versioning--evolution)
7. [Performance Monitoring](#7-performance-monitoring)
8. [Build & Deployment Pipeline](#8-build--deployment-pipeline)

---

## 1. Workspace Structure & Monorepo Setup

### Decision: pnpm Workspaces with Shared Packages

**Context**: Need to manage frontend, backend, and shared code in a monorepo with type safety and efficient dependency management.

**Decision**:
- ✅ **Use pnpm workspaces** (native pnpm feature)
- ❌ **Never use Nx** (explicitly excluded - adds unnecessary complexity for this project size)
- ✅ **Shared types in common package** within workspace
- ✅ **Shared configs in project root** (ESLint, TypeScript, Prettier)

**Rationale**:
- pnpm workspaces provide sufficient monorepo capabilities without additional tooling overhead
- Shared package ensures type consistency between frontend/backend
- Root configs enforce consistent code quality across all packages

### Implementation Details

#### Project Structure
```
aine-bmad-test/
├── packages/
│   ├── frontend/                 # React + Vite application
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   ├── backend/                  # Fastify API application
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                   # Shared types and utilities
│       ├── src/
│       │   ├── types/
│       │   │   ├── task.ts       # Task domain types
│       │   │   └── api.ts        # API request/response types
│       │   └── utils/            # Shared utilities (if any)
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── .env.development
├── .env.test
├── .env.production
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json            # Shared TypeScript config
├── .eslintrc.js                  # Shared ESLint config
├── .prettierrc.js                # Shared Prettier config
└── README.md
```

#### Root `pnpm-workspace.yaml`
```yaml
packages:
  - 'packages/*'
```

#### Root `package.json`
```json
{
  "name": "aine-bmad-test",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm --filter frontend dev & pnpm --filter backend dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"packages/**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "pnpm -r type-check"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

#### Shared Package (`packages/shared/package.json`)
```json
{
  "name": "@aine/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

#### Shared Types Example (`packages/shared/src/types/task.ts`)
```typescript
export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateTaskRequest {
  text: string;
}

export interface UpdateTaskRequest {
  status: TaskStatus;
}

export interface GetTasksResponse {
  tasks: Task[];
}

export interface CreateTaskResponse {
  task: Task;
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface DeleteCompletedResponse {
  deletedCount: number;
}
```

#### Backend Usage
```typescript
// packages/backend/src/types/task.ts
import type { Task, TaskStatus } from '@aine/shared/types';

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(text: string): Promise<Task>;
  update(id: string, data: { status: TaskStatus; completedAt: Date | null }): Promise<Task>;
  delete(id: string): Promise<void>;
  deleteCompleted(): Promise<number>;
}
```

#### Frontend Usage
```typescript
// packages/frontend/src/api/tasks.ts
import type { 
  Task, 
  CreateTaskRequest, 
  CreateTaskResponse, 
  GetTasksResponse 
} from '@aine/shared/types';

export async function fetchTasks(): Promise<GetTasksResponse> {
  const response = await axios.get<GetTasksResponse>('/api/v1/tasks');
  return response.data;
}

export async function createTask(text: string): Promise<CreateTaskResponse> {
  const response = await axios.post<CreateTaskResponse>('/api/v1/tasks', { text });
  return response.data;
}
```

### Benefits
- **Type Safety**: Frontend and backend share exact same type definitions
- **Single Source of Truth**: No type drift between layers
- **Efficient**: pnpm's symlink approach means shared code is instantly available
- **Simple**: No complex build orchestration tools needed

### Trade-offs
- Manual coordination of build order (frontend/backend must build after shared)
- No built-in task caching (acceptable for small project)
- No dependency graph visualization (not needed for 3-package workspace)

---

## 2. Development Environment Details

### Decision: Docker Compose Profiles for Environment Separation

**Context**: Need to support local development, testing, and production environments with different configurations and hot reload capabilities.

**Decision**:
- ✅ **Use Docker Compose profiles** to separate local, test, and production environments
- ✅ **Local dev with hot reload** (bind mounts + watch mode)
- ✅ **Test environment with isolated containers**
- ✅ **Hybrid approach**: Developers can choose to run services locally or in Docker

**Rationale**:
- Docker Compose profiles provide clean environment separation without multiple compose files
- Hot reload essential for developer productivity
- Flexibility allows developers to run database in Docker but services locally if preferred

### Implementation Details

#### Docker Compose with Profiles (`docker-compose.yml`)

```yaml
version: '3.9'

services:
  # ============================================
  # Database (shared across all profiles)
  # ============================================
  database:
    image: postgres:16-alpine
    container_name: todo-app-db-${PROFILE:-local}
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-todo_app}
    volumes:
      - postgres_data_${PROFILE:-local}:/var/lib/postgresql/data
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - todo-network

  # ============================================
  # Backend - Local Development Profile
  # ============================================
  backend-local:
    profiles: ["local"]
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
      target: development
    container_name: todo-app-backend-local
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@database:5432/${DB_NAME:-todo_app}
      PORT: 3000
      LOG_LEVEL: debug
    volumes:
      # Bind mount for hot reload
      - ./packages/backend/src:/app/src:cached
      - ./packages/backend/prisma:/app/prisma:cached
      - ./packages/shared:/app/../shared:cached
      # Prevent node_modules override
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      database:
        condition: service_healthy
    command: pnpm run dev
    networks:
      - todo-network

  # ============================================
  # Frontend - Local Development Profile
  # ============================================
  frontend-local:
    profiles: ["local"]
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
      target: development
    container_name: todo-app-frontend-local
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
      VITE_APP_ENV: development
    volumes:
      # Bind mount for hot reload
      - ./packages/frontend/src:/app/src:cached
      - ./packages/shared:/app/../shared:cached
      # Prevent node_modules override
      - /app/node_modules
    ports:
      - "5173:5173"
    depends_on:
      - backend-local
    command: pnpm run dev --host 0.0.0.0
    networks:
      - todo-network

  # ============================================
  # Backend - Test Profile
  # ============================================
  backend-test:
    profiles: ["test"]
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
      target: test
    container_name: todo-app-backend-test
    environment:
      NODE_ENV: test
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@database:5432/${DB_NAME:-todo_app_test}
      PORT: 3001
      LOG_LEVEL: warn
    ports:
      - "3001:3001"
    depends_on:
      database:
        condition: service_healthy
    networks:
      - todo-network

  # ============================================
  # Frontend - Test Profile
  # ============================================
  frontend-test:
    profiles: ["test"]
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
      target: test
    container_name: todo-app-frontend-test
    environment:
      VITE_API_URL: http://backend-test:3001/api/v1
      VITE_APP_ENV: test
    ports:
      - "5174:5173"
    depends_on:
      - backend-test
    networks:
      - todo-network

  # ============================================
  # Backend - Production Profile
  # ============================================
  backend-prod:
    profiles: ["prod"]
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
      target: production
    container_name: todo-app-backend-prod
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@database:5432/${DB_NAME}
      PORT: 3000
      LOG_LEVEL: info
    ports:
      - "3000:3000"
    depends_on:
      database:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - todo-network

  # ============================================
  # Frontend - Production Profile
  # ============================================
  frontend-prod:
    profiles: ["prod"]
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
      target: production
    container_name: todo-app-frontend-prod
    ports:
      - "80:80"
    depends_on:
      - backend-prod
    restart: unless-stopped
    networks:
      - todo-network

volumes:
  postgres_data_local:
    driver: local
  postgres_data_test:
    driver: local
  postgres_data_prod:
    driver: local

networks:
  todo-network:
    driver: bridge
```

#### Environment Files

**`.env.development` (for local profile)**
```bash
PROFILE=local
NODE_ENV=development

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app_dev
DB_PORT=5432

# Backend
BACKEND_PORT=3000
LOG_LEVEL=debug

# Frontend
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api/v1
```

**`.env.test` (for test profile)**
```bash
PROFILE=test
NODE_ENV=test

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_app_test
DB_PORT=5433

# Backend
BACKEND_PORT=3001
LOG_LEVEL=warn

# Frontend
FRONTEND_PORT=5174
VITE_API_URL=http://localhost:3001/api/v1
```

**`.env.production` (for prod profile)**
```bash
PROFILE=prod
NODE_ENV=production

# Database (use secure credentials in production)
DB_USER=todo_app_user
DB_PASSWORD=<CHANGE_THIS_IN_PRODUCTION>
DB_NAME=todo_app_prod
DB_PORT=5432

# Backend
BACKEND_PORT=3000
LOG_LEVEL=info

# Frontend
FRONTEND_PORT=80
VITE_API_URL=http://localhost:3000/api/v1
```

#### Development Workflow Commands

```bash
# Start local development environment
docker compose --profile local up -d

# Start test environment
docker compose --profile test up -d

# Start production environment
docker compose --profile prod up -d

# Run only database (for local dev without Docker services)
docker compose up database -d

# View logs for specific service
docker compose logs -f backend-local
docker compose logs -f frontend-local

# Rebuild specific service
docker compose --profile local up -d --build backend-local

# Stop all services
docker compose down

# Stop and remove volumes (data loss!)
docker compose down -v
```

#### Local Development Without Docker (Hybrid Mode)

Developers can run services locally while using Docker only for the database:

```bash
# 1. Start only database
docker compose up database -d

# 2. Run backend locally
cd packages/backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_app_dev pnpm run dev

# 3. Run frontend locally (in separate terminal)
cd packages/frontend
VITE_API_URL=http://localhost:3000/api/v1 pnpm run dev
```

### Hot Reload Implementation

#### Backend Hot Reload (`packages/backend/package.json`)
```json
{
  "scripts": {
    "dev": "tsx watch --clear-screen=false src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

#### Frontend Hot Reload (built into Vite)
```typescript
// packages/frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from Docker network
    port: 5173,
    watch: {
      usePolling: true, // Required for Docker bind mounts on some systems
    },
    hmr: {
      host: 'localhost', // HMR client connects here
    },
  },
});
```

### Prisma Migrations in Development

```bash
# Create new migration
docker compose exec backend-local pnpm prisma migrate dev --name add_field_name

# Apply migrations (non-interactive)
docker compose exec backend-local pnpm prisma migrate deploy

# Reset database (WARNING: data loss)
docker compose exec backend-local pnpm prisma migrate reset

# Generate Prisma client (after schema changes)
docker compose exec backend-local pnpm prisma generate

# Open Prisma Studio
docker compose exec backend-local pnpm prisma studio
```

### Debugging Setup

#### Backend Debugging with VS Code

**`.vscode/launch.json`**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Backend (Docker)",
      "port": 9229,
      "restart": true,
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}/packages/backend",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend (Local)",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/packages/backend",
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/todo_app_dev"
      },
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Updated `docker-compose.yml` for debugging (optional)**
```yaml
  backend-local:
    # ... existing config ...
    ports:
      - "3000:3000"
      - "9229:9229"  # Debugger port
    command: node --inspect=0.0.0.0:9229 --watch src/index.ts
```

### Benefits
- **Fast Iteration**: Hot reload provides instant feedback
- **Environment Parity**: Same Docker setup across local/test/prod
- **Flexibility**: Developers choose Docker vs local execution
- **Isolated Testing**: Test profile runs in complete isolation

### Trade-offs
- Bind mounts can be slower on macOS/Windows (mitigated with `:cached` flag)
- Need to remember correct profile flags for commands
- Volume names include profile suffix (intentional isolation)

---

## 3. Error Handling & Logging Strategy

### Decision: Pino with Console Output for MVP

**Context**: Need structured logging for debugging and error tracking without over-engineering for MVP phase.

**Decision**:
- ✅ **Use Pino** (high-performance, structured logging for Node.js)
- ✅ **Console output only** (no external services for MVP)
- ✅ **Structured JSON logs** in production, pretty-print in development
- ✅ **Centralized error handling** in Fastify

**Rationale**:
- Pino integrates natively with Fastify
- Structured logging enables future integration with log aggregation tools
- Console output sufficient for local development and initial production
- Zero cost for MVP (no external service subscriptions)

### Implementation Details

#### Backend Logging Setup

**Pino Configuration (`packages/backend/src/utils/logger.ts`)**
```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined, // Production uses JSON output
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

**Fastify Logger Integration (`packages/backend/src/app.ts`)**
```typescript
import Fastify from 'fastify';
import { logger } from './utils/logger';

export async function buildApp() {
  const fastify = Fastify({
    logger: logger,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Request logging
  fastify.addHook('onRequest', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        headers: request.headers,
      },
      'Incoming request'
    );
  });

  // Response logging
  fastify.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime(),
      },
      'Request completed'
    );
  });

  return fastify;
}
```

**Centralized Error Handler (`packages/backend/src/utils/errorHandler.ts`)**
```typescript
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from './logger';

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error with full context
  request.log.error(
    {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
      },
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        body: request.body,
      },
    },
    'Request error'
  );

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Prepare error response
  const errorResponse: ErrorResponse = {
    error: statusCode >= 500 ? 'Internal server error' : error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: request.url,
    requestId: request.id,
  };

  // Include details for 4xx errors (client errors)
  if (statusCode < 500 && error.validation) {
    errorResponse.details = error.validation;
  }

  // Send response
  reply.status(statusCode).send(errorResponse);
}
```

**Service Layer Error Handling (`packages/backend/src/services/taskService.ts`)**
```typescript
import { logger } from '../utils/logger';
import { taskRepository } from '../repositories/taskRepository';

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const taskService = {
  async updateTaskStatus(id: string, status: TaskStatus) {
    logger.debug({ taskId: id, newStatus: status }, 'Updating task status');

    const task = await taskRepository.findById(id);
    
    if (!task) {
      logger.warn({ taskId: id }, 'Task not found for update');
      throw new TaskNotFoundError(id);
    }

    const completedAt = status === 'COMPLETED' ? new Date() : null;

    try {
      const updatedTask = await taskRepository.update(id, { status, completedAt });
      logger.info({ taskId: id, status }, 'Task status updated successfully');
      return updatedTask;
    } catch (error) {
      logger.error({ error, taskId: id }, 'Failed to update task status');
      throw error;
    }
  },
};
```

#### Frontend Error Handling

**Axios Error Interceptor (`packages/frontend/src/api/client.ts`)**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add request ID)
apiClient.interceptors.request.use(
  (config) => {
    config.headers['x-request-id'] = crypto.randomUUID();
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor (log errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        requestId: error.response.data?.requestId,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[API Network Error]', {
        message: 'No response received',
        url: error.config.url,
      });
    } else {
      // Request setup error
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Error Toast Component (`packages/frontend/src/components/ErrorToast.tsx`)**
```typescript
import { Snackbar, Alert } from '@mui/material';

interface ErrorToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
}

export function ErrorToast({ message, open, onClose }: ErrorToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
```

**TanStack Query Error Handling (`packages/frontend/src/hooks/useTasks.ts`)**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { useState } from 'react';

export function useTasks() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    retry: 3,
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to load tasks';
      setErrorMessage(message);
      console.error('[useTasks Error]', error);
    },
  });

  return {
    ...query,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
}
```

#### Log Levels by Environment

**Development (`LOG_LEVEL=debug`)**
- Debug: Service method calls, query execution
- Info: Request/response logs
- Warn: Validation failures, not-found errors
- Error: Exceptions, database errors

**Test (`LOG_LEVEL=warn`)**
- Warn: Unexpected test conditions
- Error: Test failures, assertion errors

**Production (`LOG_LEVEL=info`)**
- Info: Request/response logs, business events
- Warn: Degraded performance, fallback behavior
- Error: Exceptions, critical failures

#### Example Log Output

**Development (pretty-print)**
```
[14:32:15 INFO] Incoming request
  method: "GET"
  url: "/api/v1/tasks"
  reqId: "req-1"

[14:32:15 DEBUG] Fetching all tasks from database
  
[14:32:15 INFO] Request completed
  method: "GET"
  url: "/api/v1/tasks"
  statusCode: 200
  responseTime: 23
  reqId: "req-1"
```

**Production (JSON)**
```json
{
  "level": "INFO",
  "time": "2026-02-17T14:32:15.123Z",
  "msg": "Incoming request",
  "method": "GET",
  "url": "/api/v1/tasks",
  "reqId": "req-1"
}
{
  "level": "INFO",
  "time": "2026-02-17T14:32:15.146Z",
  "msg": "Request completed",
  "method": "GET",
  "url": "/api/v1/tasks",
  "statusCode": 200,
  "responseTime": 23,
  "reqId": "req-1"
}
```

### Future Enhancement Path (Post-MVP)

When ready to add external error tracking:

1. **Sentry Integration** (optional)
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// In error handler
Sentry.captureException(error);
```

2. **Log Aggregation** (Loki, Grafana, etc.)
   - Pino JSON output already compatible
   - Add Docker logging driver configuration
   - No code changes needed

### Benefits
- **Zero Cost**: Console logging is free
- **Structured**: JSON logs enable future tooling integration
- **Performance**: Pino is one of the fastest Node.js loggers
- **Developer Experience**: Pretty logs in development

### Trade-offs
- No centralized log aggregation (must SSH to server to view logs)
- No built-in alerting (acceptable for single-user MVP)
- Console logs rotate with Docker restart (use volumes if persistence needed)

---

## 4. State Management Patterns

### Decision: Layered State with LocalStorage + React Hook Form

**Context**: Need to manage server state (tasks), client state (preferences), and form state with minimal complexity.

**Decision**:
- ✅ **Server State**: TanStack Query (already decided in technical architecture)
- ✅ **User Preferences**: LocalStorage with simple hooks
- ✅ **Form Validation**: React Hook Form with Zod schemas
- ✅ **Modal/Dialog State**: Local component state (useState)

**Rationale**:
- Each state type uses the right tool for the job
- No global state library needed (preferences are simple key-value pairs)
- React Hook Form provides excellent DX with minimal boilerplate
- Modal state is ephemeral and component-scoped

### Implementation Details

#### User Preferences with LocalStorage

**Preferences Hook (`packages/frontend/src/hooks/usePreferences.ts`)**
```typescript
import { useState, useEffect } from 'react';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  completedTasksExpanded: boolean;
  taskSortOrder: 'newest' | 'oldest';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  completedTasksExpanded: false,
  taskSortOrder: 'newest',
};

const STORAGE_KEY = 'todo-app-preferences';

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load preferences from localStorage', error);
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences to localStorage', error);
    }
  }, [preferences]);

  const setPreferences = (updates: Partial<UserPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferencesState(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    setPreferences,
    resetPreferences,
  };
}
```

**Usage Example**
```typescript
// In App.tsx or ThemeProvider
function App() {
  const { preferences, setPreferences } = usePreferences();

  const handleThemeToggle = () => {
    setPreferences({
      theme: preferences.theme === 'light' ? 'dark' : 'light',
    });
  };

  return (
    <ThemeProvider theme={preferences.theme === 'dark' ? darkTheme : lightTheme}>
      {/* App content */}
    </ThemeProvider>
  );
}
```

#### Form Validation with React Hook Form + Zod

**Form Schema (`packages/frontend/src/schemas/taskSchema.ts`)**
```typescript
import { z } from 'zod';

export const createTaskSchema = z.object({
  text: z
    .string()
    .min(1, 'Task text is required')
    .max(500, 'Task text must be 500 characters or less')
    .trim(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
```

**Add Task Dialog with Form (`packages/frontend/src/components/AddTaskDialog.tsx`)**
```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskFormData } from '../schemas/taskSchema';
import { useAddTask } from '../hooks/useAddTask';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const addTask = useAddTask();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      await addTask.mutateAsync(data.text);
      reset();
      onClose();
    } catch (error) {
      // Error handled by mutation onError callback
      console.error('Failed to create task', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            {...register('text')}
            autoFocus
            margin="dense"
            label="What needs to be done?"
            placeholder="e.g., Review Sarah's PR"
            fullWidth
            multiline
            rows={3}
            error={!!errors.text}
            helperText={errors.text?.message}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
```

#### Modal/Dialog State Management Pattern

**Modal Controller Hook (`packages/frontend/src/hooks/useModal.ts`)**
```typescript
import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
```

**Usage in Main Component**
```typescript
import { AddTaskButton } from './components/AddTaskButton';
import { AddTaskDialog } from './components/AddTaskDialog';
import { useModal } from './hooks/useModal';

function TaskList() {
  const addTaskModal = useModal();

  return (
    <>
      <AddTaskButton onClick={addTaskModal.open} />
      <AddTaskDialog open={addTaskModal.isOpen} onClose={addTaskModal.close} />
    </>
  );
}
```

**Drawer Pattern (for Completed Tasks)**
```typescript
import { Drawer, List, ListItem, IconButton } from '@mui/material';
import { ChevronUp, ChevronDown } from '@mui/icons-material';
import { usePreferences } from '../hooks/usePreferences';

export function CompletedTasksDrawer({ tasks }: { tasks: Task[] }) {
  const { preferences, setPreferences } = usePreferences();
  const isExpanded = preferences.completedTasksExpanded;

  const toggleExpanded = () => {
    setPreferences({ completedTasksExpanded: !isExpanded });
  };

  return (
    <Drawer
      anchor="bottom"
      variant="persistent"
      open={isExpanded}
      PaperProps={{
        sx: { position: 'relative', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
      }}
    >
      <IconButton onClick={toggleExpanded} sx={{ alignSelf: 'center' }}>
        {isExpanded ? <ChevronDown /> : <ChevronUp />}
      </IconButton>
      {isExpanded && (
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} sx={{ textDecoration: 'line-through', opacity: 0.6 }}>
              {task.text}
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
}
```

#### State Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend State                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Server State (TanStack Query)                  │   │
│  │  - Task list                                     │   │
│  │  - Optimistic updates                            │   │
│  │  - Automatic refetch                             │   │
│  │  - Offline queue                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│                          │ Queries/Mutations            │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  API Layer (Axios)                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  User Preferences (LocalStorage)                │   │
│  │  - Theme preference                              │   │
│  │  - Drawer expanded state                         │   │
│  │  - Sort order preference                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Form State (React Hook Form)                   │   │
│  │  - Add task form                                 │   │
│  │  - Validation errors                             │   │
│  │  - Submission state                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  UI State (Component useState)                   │   │
│  │  - Modal open/close                              │   │
│  │  - Drawer open/close                             │   │
│  │  - Error toast visibility                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Package Dependencies

**`packages/frontend/package.json` additions**
```json
{
  "dependencies": {
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4"
  }
}
```

### Benefits
- **Right Tool for Each Job**: No over-engineering with global state management
- **Type Safety**: Zod schemas provide runtime validation + TypeScript types
- **Developer Experience**: React Hook Form reduces boilerplate significantly
- **Performance**: LocalStorage reads are synchronous, no async overhead
- **Simplicity**: Easy to understand and maintain

### Trade-offs
- LocalStorage limited to 5-10MB (acceptable for user preferences)
- No cross-tab synchronization for preferences (acceptable for single-user app)
- Form state not persisted across page refresh (intentional UX choice)

---

## 5. Testing Infrastructure

### Decision: Testcontainers with No CI/CD for MVP

**Context**: Need robust testing with real database without complex CI/CD setup during MVP phase.

**Decision**:
- ✅ **Use Testcontainers** for integration and E2E tests
- ✅ **No CI/CD setup** for MVP (run tests locally)
- ✅ **Docker-based test isolation** with automatic cleanup
- ✅ **Seed data management** with Prisma seeding

**Rationale**:
- Testcontainers provides real PostgreSQL without manual setup
- Automatic container lifecycle (start/stop/cleanup)
- Tests run in realistic environment (production-like database)
- CI/CD deferred until MVP validation complete

### Implementation Details

#### Backend Testing Setup

**Testcontainers Configuration (`packages/backend/tests/helpers/testDb.ts`)**
```typescript
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let postgresContainer: StartedTestContainer;
let prisma: PrismaClient;

export async function setupTestDatabase() {
  // Start PostgreSQL container
  postgresContainer = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'todo_app_test',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/))
    .start();

  const host = postgresContainer.getHost();
  const port = postgresContainer.getMappedPort(5432);
  const databaseUrl = `postgresql://test:test@${host}:${port}/todo_app_test`;

  // Set DATABASE_URL for Prisma
  process.env.DATABASE_URL = databaseUrl;

  // Run migrations
  execSync('pnpm prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  // Initialize Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  await prisma.$connect();

  return { prisma, databaseUrl };
}

export async function teardownTestDatabase() {
  await prisma?.$disconnect();
  await postgresContainer?.stop();
}

export async function cleanDatabase() {
  // Delete all data (preserve schema)
  await prisma.task.deleteMany();
}

export function getPrismaClient() {
  return prisma;
}
```

**Test Setup File (`packages/backend/tests/setup.ts`)**
```typescript
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, cleanDatabase } from './helpers/testDb';

// Setup once before all tests
beforeAll(async () => {
  await setupTestDatabase();
}, 60000); // 60s timeout for container startup

// Teardown once after all tests
afterAll(async () => {
  await teardownTestDatabase();
});

// Clean database after each test
afterEach(async () => {
  await cleanDatabase();
});
```

**Vitest Configuration (`packages/backend/vitest.config.ts`)**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    testTimeout: 30000, // 30s per test (container operations can be slow)
  },
});
```

**Integration Test Example (`packages/backend/tests/integration/routes/tasks.test.ts`)**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../../src/app';
import { getPrismaClient } from '../../helpers/testDb';
import type { FastifyInstance } from 'fastify';

describe('Task Routes', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
    prisma = getPrismaClient();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create new task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: { text: 'Test task' },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.task).toMatchObject({
        text: 'Test task',
        status: 'ACTIVE',
        completedAt: null,
      });

      // Verify in database
      const dbTask = await prisma.task.findUnique({
        where: { id: body.task.id },
      });
      expect(dbTask).toBeTruthy();
      expect(dbTask?.text).toBe('Test task');
    });

    it('should return 400 for empty text', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: { text: '' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return all tasks sorted correctly', async () => {
      // Seed test data
      await prisma.task.createMany({
        data: [
          { text: 'Active 1', status: 'ACTIVE' },
          { text: 'Active 2', status: 'ACTIVE' },
          { text: 'Completed', status: 'COMPLETED', completedAt: new Date() },
        ],
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.tasks).toHaveLength(3);

      // Active tasks first, newest first
      expect(body.tasks[0].status).toBe('ACTIVE');
      expect(body.tasks[1].status).toBe('ACTIVE');
      expect(body.tasks[2].status).toBe('COMPLETED');
    });
  });
});
```

#### Database Seeding

**Seed Script (`packages/backend/prisma/seed.ts`)**
```typescript
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.task.deleteMany();

  // Create sample tasks
  const tasks = await prisma.task.createMany({
    data: [
      { text: 'Review team PR #234', status: TaskStatus.ACTIVE },
      { text: 'Update sprint documentation', status: TaskStatus.ACTIVE },
      { text: 'Prepare for client demo', status: TaskStatus.ACTIVE },
      { 
        text: 'Deploy hotfix to production', 
        status: TaskStatus.COMPLETED,
        completedAt: new Date('2026-02-16T10:30:00Z'),
      },
      { 
        text: 'Code review for Sarah', 
        status: TaskStatus.COMPLETED,
        completedAt: new Date('2026-02-16T14:15:00Z'),
      },
    ],
  });

  console.log(`Created ${tasks.count} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Package.json Script**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

#### Frontend E2E Testing with Playwright + Testcontainers

**Playwright Configuration (`packages/frontend/playwright.config.ts`)**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Single worker for DB isolation
  reporter: 'html',
  use: {
    baseURL: process.env.VITE_API_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**E2E Test Setup (`packages/frontend/tests/e2e/setup.ts`)**
```typescript
import { test as base } from '@playwright/test';
import { setupTestDatabase, teardownTestDatabase, cleanDatabase, getPrismaClient } from '../../../backend/tests/helpers/testDb';

// Extend base test with database fixture
export const test = base.extend({
  database: async ({}, use) => {
    const { prisma } = await setupTestDatabase();
    await use(prisma);
    await cleanDatabase();
  },
});

export { expect } from '@playwright/test';
```

**E2E Test Example (`packages/frontend/tests/e2e/tasks.spec.ts`)**
```typescript
import { test, expect } from './setup';

test.describe('Task Management', () => {
  test('should complete full task lifecycle', async ({ page, database }) => {
    // Seed initial data
    await database.task.create({
      data: { text: 'Existing task', status: 'ACTIVE' },
    });

    await page.goto('/');

    // Verify existing task visible
    await expect(page.locator('text=Existing task')).toBeVisible();

    // Add new task
    await page.click('[aria-label="Add task"]');
    await page.fill('input[placeholder*="What needs to be done"]', 'E2E test task');
    await page.click('button:has-text("Add")');

    // Verify optimistic update (appears immediately)
    await expect(page.locator('text=E2E test task')).toBeVisible({ timeout: 1000 });

    // Complete task
    await page.click('text=E2E test task');

    // Verify crossed out and moved to completed
    await expect(page.locator('text=E2E test task')).toHaveCSS('text-decoration', /line-through/);

    // Verify in database
    const task = await database.task.findFirst({
      where: { text: 'E2E test task' },
    });
    expect(task?.status).toBe('COMPLETED');
    expect(task?.completedAt).toBeTruthy();
  });

  test('should persist tasks across page reload', async ({ page, database }) => {
    await database.task.create({
      data: { text: 'Persistent task', status: 'ACTIVE' },
    });

    await page.goto('/');
    await expect(page.locator('text=Persistent task')).toBeVisible();

    await page.reload();
    await expect(page.locator('text=Persistent task')).toBeVisible();
  });
});
```

#### Test Commands

**`packages/backend/package.json`**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run tests/integration",
    "test:unit": "vitest run tests/unit"
  },
  "devDependencies": {
    "testcontainers": "^10.5.0",
    "vitest": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0"
  }
}
```

**`packages/frontend/package.json`**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  },
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "vitest": "^1.2.0"
  }
}
```

**Root `package.json`**
```json
{
  "scripts": {
    "test": "pnpm -r test",
    "test:all": "pnpm -r run test && pnpm --filter frontend test:e2e",
    "test:coverage": "pnpm -r run test:coverage"
  }
}
```

### CI/CD Future Path (Post-MVP)

When ready to add CI/CD (GitHub Actions example):

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:all
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Benefits
- **Real Database**: Tests run against actual PostgreSQL (not mocks)
- **Automatic Cleanup**: Testcontainers handles container lifecycle
- **Isolation**: Each test run gets fresh database
- **No Manual Setup**: Developers don't need to configure test database

### Trade-offs
- Slower tests (container startup ~5-10s)
- Requires Docker running locally
- Higher resource usage than mocked tests
- No CI/CD automation initially (manual testing only)

---

## 6. API Versioning & Evolution

### Decision: URL-Based Versioning from Day One

**Context**: Need strategy for future API changes without breaking existing clients.

**Decision**:
- ✅ **Version in URL path** (`/api/v1/tasks`)
- ✅ **Start with v1** from initial release
- ✅ **No breaking changes** within a version
- ✅ **Deprecation policy**: 3-month warning before removal

**Rationale**:
- URL versioning is explicit and visible
- Easier to maintain multiple versions simultaneously
- Clients can't accidentally use wrong version
- Supports gradual migration for future mobile apps

### Implementation Details

#### API Route Structure

**Backend Routes with Versioning (`packages/backend/src/app.ts`)**
```typescript
import Fastify from 'fastify';
import { taskRoutesV1 } from './routes/v1/tasks';
import { healthRoutes } from './routes/health';

export async function buildApp() {
  const fastify = Fastify({ logger: true });

  // Health check (unversioned, stable)
  await fastify.register(healthRoutes);

  // API v1
  await fastify.register(taskRoutesV1, { prefix: '/api/v1' });

  // Future: API v2 (when needed)
  // await fastify.register(taskRoutesV2, { prefix: '/api/v2' });

  return fastify;
}
```

**Versioned Route File (`packages/backend/src/routes/v1/tasks.ts`)**
```typescript
import { FastifyInstance } from 'fastify';
import { taskService } from '../../services/taskService';
import { 
  createTaskSchemaV1, 
  updateTaskSchemaV1,
  getTasksResponseSchemaV1,
} from '../../schemas/v1/taskSchemas';

export async function taskRoutesV1(fastify: FastifyInstance) {
  // GET /api/v1/tasks
  fastify.get('/tasks', {
    schema: {
      response: {
        200: getTasksResponseSchemaV1,
      },
    },
  }, async (request, reply) => {
    const tasks = await taskService.getAllTasks();
    return { tasks };
  });

  // POST /api/v1/tasks
  fastify.post('/tasks', {
    schema: {
      body: createTaskSchemaV1,
    },
  }, async (request, reply) => {
    const { text } = request.body as { text: string };
    const task = await taskService.createTask(text);
    return reply.code(201).send({ task });
  });

  // PATCH /api/v1/tasks/:id
  fastify.patch('/tasks/:id', {
    schema: {
      body: updateTaskSchemaV1,
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: TaskStatus };
    const task = await taskService.updateTaskStatus(id, status);
    return { task };
  });

  // DELETE /api/v1/tasks/:id
  fastify.delete('/tasks/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await taskService.deleteTask(id);
    return reply.code(204).send();
  });

  // DELETE /api/v1/tasks/completed
  fastify.delete('/tasks/completed', async (request, reply) => {
    const deletedCount = await taskService.clearCompleted();
    return { deletedCount };
  });
}
```

#### Versioned Schemas

**Schema Versioning (`packages/backend/src/schemas/v1/taskSchemas.ts`)**
```typescript
import { z } from 'zod';

// Version 1 schemas
export const createTaskSchemaV1 = z.object({
  text: z.string().min(1).max(500),
});

export const updateTaskSchemaV1 = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED']),
});

export const taskSchemaV1 = z.object({
  id: z.string().uuid(),
  text: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED']),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export const getTasksResponseSchemaV1 = z.object({
  tasks: z.array(taskSchemaV1),
});
```

**Future Version Example (`packages/backend/src/schemas/v2/taskSchemas.ts`)**
```typescript
// Example: v2 adds priority field
export const taskSchemaV2 = z.object({
  id: z.string().uuid(),
  text: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(), // NEW in v2
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});
```

#### Frontend API Client with Versioning

**API Client (`packages/frontend/src/api/client.ts`)**
```typescript
import axios from 'axios';

const API_VERSION = 'v1';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request ID interceptor
apiClient.interceptors.request.use((config) => {
  config.headers['x-request-id'] = crypto.randomUUID();
  config.headers['x-api-version'] = API_VERSION; // Track version in headers
  return config;
});
```

**Type-Safe API Methods (`packages/frontend/src/api/tasks.ts`)**
```typescript
import { apiClient } from './client';
import type { 
  Task, 
  CreateTaskResponse, 
  GetTasksResponse,
  UpdateTaskResponse,
  DeleteCompletedResponse,
} from '@aine/shared/types';

// All methods automatically use /api/v1 prefix from baseURL

export async function fetchTasks(): Promise<GetTasksResponse> {
  const response = await apiClient.get<GetTasksResponse>('/tasks');
  return response.data;
}

export async function createTask(text: string): Promise<CreateTaskResponse> {
  const response = await apiClient.post<CreateTaskResponse>('/tasks', { text });
  return response.data;
}

export async function updateTask(id: string, status: TaskStatus): Promise<UpdateTaskResponse> {
  const response = await apiClient.patch<UpdateTaskResponse>(`/tasks/${id}`, { status });
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`);
}

export async function clearCompleted(): Promise<DeleteCompletedResponse> {
  const response = await apiClient.delete<DeleteCompletedResponse>('/tasks/completed');
  return response.data;
}
```

#### Version Migration Strategy

**When to Create v2**:
- Breaking changes to request/response format
- Removing fields from existing endpoints
- Changing field types (e.g., string → number)
- Changing behavior significantly (e.g., different sorting)

**Non-Breaking Changes (Safe for v1)**:
- Adding optional fields to responses
- Adding new endpoints
- Adding optional query parameters
- Adding new enum values (if clients handle unknowns gracefully)

**Migration Example: v1 → v2**

```typescript
// packages/backend/src/routes/v2/tasks.ts
import { taskServiceV2 } from '../../services/v2/taskService';

export async function taskRoutesV2(fastify: FastifyInstance) {
  // v2: Tasks include priority field
  fastify.get('/tasks', async (request, reply) => {
    const tasks = await taskServiceV2.getAllTasksWithPriority();
    return { tasks }; // Now includes priority field
  });
  
  // v2: Can filter by priority
  fastify.get('/tasks/priority/:level', async (request, reply) => {
    const { level } = request.params as { level: string };
    const tasks = await taskServiceV2.getTasksByPriority(level);
    return { tasks };
  });
}
```

**Shared Service Layer (supports both versions)**
```typescript
// packages/backend/src/services/taskService.ts
export const taskService = {
  // Used by v1
  async getAllTasks() {
    return taskRepository.findAll();
  },
  
  // Used by v2
  async getAllTasksWithPriority() {
    const tasks = await taskRepository.findAll();
    // Map to include default priority if not set
    return tasks.map(task => ({
      ...task,
      priority: task.priority || 'MEDIUM',
    }));
  },
};
```

#### Deprecation Process

**Step 1: Announce Deprecation (3 months before removal)**
```typescript
// Add deprecation warning header to v1 responses
fastify.addHook('onSend', async (request, reply) => {
  if (request.url.startsWith('/api/v1')) {
    reply.header('X-API-Deprecation', 'v1 will be sunset on 2026-08-01. Migrate to v2.');
    reply.header('X-API-Sunset', '2026-08-01');
  }
});
```

**Step 2: Log v1 Usage (monitoring phase)**
```typescript
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/v1')) {
    request.log.warn({ url: request.url }, 'Deprecated API v1 usage');
  }
});
```

**Step 3: Remove v1 (after sunset date)**
```typescript
// Simply remove the v1 route registration
// await fastify.register(taskRoutesV1, { prefix: '/api/v1' }); // REMOVED
```

### API Version Headers (Optional Enhancement)

```typescript
// Support version in Accept header as alternative
fastify.addHook('onRequest', async (request, reply) => {
  const acceptHeader = request.headers['accept'];
  
  if (acceptHeader?.includes('application/vnd.todoapp.v2+json')) {
    request.apiVersion = 'v2';
  } else {
    request.apiVersion = 'v1';
  }
});
```

### Benefits
- **Explicit Versioning**: No ambiguity about which version client uses
- **Parallel Support**: Can run v1 and v2 simultaneously
- **Gradual Migration**: Clients migrate on their own timeline
- **Simple Routing**: Clear URL structure

### Trade-offs
- Slightly longer URLs (`/api/v1/tasks` vs `/api/tasks`)
- Need to maintain multiple versions temporarily during migrations
- More files/folders in codebase (v1/, v2/ directories)

---

## 7. Performance Monitoring

### Decision: Health Endpoint with Docker Compose Integration

**Context**: Need basic health checks for Docker orchestration without complex monitoring infrastructure for MVP.

**Decision**:
- ✅ **Health endpoint** (`/health`) for Docker healthchecks
- ❌ **No performance monitoring tools** (no APM, no metrics dashboards)
- ✅ **Basic response time logging** via Pino
- ✅ **Docker healthcheck integration** for container restart

**Rationale**:
- Health endpoint sufficient for Docker Compose restart logic
- Performance targets already defined in architecture
- Manual testing adequate for MVP validation
- Defer monitoring tools until production scale needs emerge

### Implementation Details

#### Health Endpoint

**Health Routes (`packages/backend/src/routes/health.ts`)**
```typescript
import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'up' | 'down';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check (fast, minimal checks)
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  });

  // Detailed health check (includes DB check)
  fastify.get('/health/detailed', async (request, reply) => {
    const checks: HealthResponse['checks'] = {
      database: 'down',
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    };

    // Database check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'up';
    } catch (error) {
      request.log.error({ error }, 'Database health check failed');
      checks.database = 'down';
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    const status = checks.database === 'up' ? 'healthy' : 'unhealthy';
    const statusCode = status === 'healthy' ? 200 : 503;

    return reply.code(statusCode).send({
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    });
  });

  // Readiness probe (for Kubernetes-style orchestration)
  fastify.get('/health/ready', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch (error) {
      return reply.code(503).send({ ready: false });
    }
  });

  // Liveness probe (for Kubernetes-style orchestration)
  fastify.get('/health/live', async (request, reply) => {
    return { alive: true };
  });
}
```

#### Docker Compose Healthcheck Integration

**Updated `docker-compose.yml` with healthchecks**
```yaml
services:
  backend-local:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  frontend-local:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped
    depends_on:
      backend-local:
        condition: service_healthy  # Wait for backend health
```

**Install curl in Docker containers**
```dockerfile
# packages/backend/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache curl  # For healthchecks
WORKDIR /app
```

#### Response Time Logging (Built into Pino)

**Already included in Fastify logger config (`packages/backend/src/app.ts`)**
```typescript
// From section 3 (Logging Strategy)
fastify.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(), // ✅ Already logging this
    },
    'Request completed'
  );
});
```

**Example log output with response time**
```json
{
  "level": "INFO",
  "time": "2026-02-17T14:32:15.146Z",
  "msg": "Request completed",
  "method": "POST",
  "url": "/api/v1/tasks",
  "statusCode": 201,
  "responseTime": 23.5,
  "reqId": "req-abc123"
}
```

#### Manual Performance Testing

**Simple Load Test Script (`scripts/load-test.sh`)**
```bash
#!/bin/bash

# Simple load test using curl
echo "Running basic load test..."

ENDPOINT="http://localhost:3000/api/v1/tasks"
ITERATIONS=100

start_time=$(date +%s%3N)

for i in $(seq 1 $ITERATIONS); do
  curl -s -o /dev/null -w "%{time_total}\n" "$ENDPOINT" >> response_times.txt
done

end_time=$(date +%s%3N)
duration=$((end_time - start_time))

# Calculate average response time
avg=$(awk '{ total += $1; count++ } END { print total/count }' response_times.txt)

echo "Completed $ITERATIONS requests in ${duration}ms"
echo "Average response time: ${avg}s"

# Cleanup
rm response_times.txt
```

**Usage**
```bash
chmod +x scripts/load-test.sh
./scripts/load-test.sh
```

#### Frontend Performance Measurement

**Web Vitals Logging (`packages/frontend/src/utils/webVitals.ts`)**
```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // For MVP: just console log
  console.log('[Web Vitals]', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });

  // Future: send to analytics service
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onFID(sendToAnalytics);  // First Input Delay
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onFCP(sendToAnalytics);  // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}
```

**Initialize in main.tsx**
```typescript
// packages/frontend/src/main.tsx
import { reportWebVitals } from './utils/webVitals';

// ... React render code ...

// Report web vitals in development
if (import.meta.env.DEV) {
  reportWebVitals();
}
```

#### Health Endpoint Testing

**Health Check Test (`packages/backend/tests/integration/routes/health.test.ts`)**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../../src/app';
import type { FastifyInstance } from 'fastify';

describe('Health Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return healthy status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });

  it('should check database connection in detailed health', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/detailed',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.checks.database).toBe('up');
    expect(body.checks.memory).toBeDefined();
  });

  it('should return 503 when database is down', async () => {
    // Simulate DB down by disconnecting Prisma
    await prisma.$disconnect();

    const response = await app.inject({
      method: 'GET',
      url: '/health/detailed',
    });

    expect(response.statusCode).toBe(503);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('unhealthy');
  });
});
```

### Docker Compose Health Monitoring Commands

```bash
# Check health status of all services
docker compose ps

# View health check logs
docker compose logs backend-local | grep health

# Force health check
docker compose exec backend-local curl http://localhost:3000/health/detailed

# Restart unhealthy containers
docker compose up -d --force-recreate
```

### Future Monitoring Path (Post-MVP)

When ready to add real monitoring (optional):

**Application Performance Monitoring (APM)**
- Sentry Performance Monitoring
- New Relic
- Datadog APM

**Metrics & Dashboards**
- Prometheus + Grafana
- InfluxDB + Telegraf

**Frontend Analytics**
- Google Analytics 4
- Plausible Analytics (privacy-focused)

### Benefits
- **Zero Cost**: No external monitoring services
- **Docker Integration**: Automatic restart of unhealthy containers
- **Simple**: Health endpoint is trivial to implement
- **Sufficient for MVP**: Meets Docker Compose needs

### Trade-offs
- No historical performance data
- No automatic alerting
- No visual dashboards
- Manual analysis of logs needed

---

## 8. Build & Deployment Pipeline

### Decision: Manual Deployment to Three Environments

**Context**: Need to support local development, testing, and production deployment without complex CI/CD for MVP.

**Decision**:
- ✅ **Three deployment targets**: Local, Test, Production (all Docker Compose-based)
- ❌ **No CI/CD automation** (manual deployment for MVP)
- ✅ **Environment-specific configs** (.env files per environment)
- ✅ **Docker Compose profiles** (already defined in section 2)

**Rationale**:
- Manual deployment acceptable for single-user MVP
- All three environments use identical Docker setup (parity)
- CI/CD deferred until multi-user or team collaboration needs
- Simpler debugging and faster iteration during MVP phase

### Implementation Details

#### Environment Configuration

**Environment Files**

See section 2 for complete `.env.development`, `.env.test`, `.env.production` files.

**Environment Variable Validation (`packages/backend/src/config/env.ts`)**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  FRONTEND_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
```

**Use in application (`packages/backend/src/index.ts`)**
```typescript
import { env } from './config/env';
import { buildApp } from './app';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
```

#### Deployment Commands

**Local Development Deployment**
```bash
# Start local environment
docker compose --env-file .env.development --profile local up -d

# Run migrations
docker compose --env-file .env.development exec backend-local pnpm prisma migrate deploy

# Seed database (optional)
docker compose --env-file .env.development exec backend-local pnpm prisma db seed

# View logs
docker compose logs -f backend-local frontend-local

# Stop
docker compose down
```

**Test Environment Deployment**
```bash
# Start test environment
docker compose --env-file .env.test --profile test up -d --build

# Run migrations
docker compose --env-file .env.test exec backend-test pnpm prisma migrate deploy

# Run E2E tests
pnpm --filter frontend test:e2e

# Stop
docker compose --profile test down
```

**Production Deployment**
```bash
# Build production images
docker compose --env-file .env.production --profile prod build

# Start production environment
docker compose --env-file .env.production --profile prod up -d

# Run migrations (production)
docker compose --env-file .env.production exec backend-prod pnpm prisma migrate deploy

# Verify health
curl http://localhost:3000/health/detailed

# View logs (with limited output for production)
docker compose logs -f --tail=100 backend-prod

# Restart specific service
docker compose --env-file .env.production restart backend-prod

# Stop production
docker compose --profile prod down
```

#### Deployment Checklist Script

**`scripts/deploy.sh`** (manual deployment helper)
```bash
#!/bin/bash

set -e  # Exit on error

ENVIRONMENT=${1:-local}

echo "🚀 Deploying to: $ENVIRONMENT"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(local|test|prod)$ ]]; then
  echo "❌ Invalid environment. Use: local, test, or prod"
  exit 1
fi

# Set profile and env file
PROFILE=$ENVIRONMENT
ENV_FILE=".env.${ENVIRONMENT/local/development}"

echo "📋 Pre-deployment checklist:"
echo "  - Environment file: $ENV_FILE"
echo "  - Docker Compose profile: $PROFILE"

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Environment file not found: $ENV_FILE"
  exit 1
fi

# Pull latest code (for production)
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "📥 Pulling latest code..."
  git pull origin main
fi

# Build images
echo "🔨 Building Docker images..."
docker compose --env-file "$ENV_FILE" --profile "$PROFILE" build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose --profile "$PROFILE" down

# Start new containers
echo "▶️ Starting containers..."
docker compose --env-file "$ENV_FILE" --profile "$PROFILE" up -d

# Wait for backend health
echo "⏳ Waiting for backend to be healthy..."
sleep 5

BACKEND_PORT=3000
if [ "$ENVIRONMENT" = "test" ]; then
  BACKEND_PORT=3001
fi

for i in {1..30}; do
  if curl -sf "http://localhost:$BACKEND_PORT/health" > /dev/null; then
    echo "✅ Backend is healthy"
    break
  fi
  echo "   Attempt $i/30..."
  sleep 2
done

# Run migrations
echo "🔄 Running database migrations..."
if [ "$ENVIRONMENT" = "local" ]; then
  docker compose exec backend-local pnpm prisma migrate deploy
elif [ "$ENVIRONMENT" = "test" ]; then
  docker compose exec backend-test pnpm prisma migrate deploy
else
  docker compose exec backend-prod pnpm prisma migrate deploy
fi

# Run tests for test environment
if [ "$ENVIRONMENT" = "test" ]; then
  echo "🧪 Running tests..."
  pnpm test:all
fi

echo "✅ Deployment to $ENVIRONMENT complete!"
echo ""
echo "📊 Service status:"
docker compose ps

echo ""
echo "🔗 Access URLs:"
if [ "$ENVIRONMENT" = "local" ]; then
  echo "  Frontend: http://localhost:5173"
  echo "  Backend:  http://localhost:3000"
  echo "  Health:   http://localhost:3000/health/detailed"
elif [ "$ENVIRONMENT" = "test" ]; then
  echo "  Frontend: http://localhost:5174"
  echo "  Backend:  http://localhost:3001"
  echo "  Health:   http://localhost:3001/health/detailed"
else
  echo "  Frontend: http://localhost"
  echo "  Backend:  http://localhost:3000"
  echo "  Health:   http://localhost:3000/health/detailed"
fi
```

**Usage**
```bash
chmod +x scripts/deploy.sh

# Deploy to local
./scripts/deploy.sh local

# Deploy to test
./scripts/deploy.sh test

# Deploy to production
./scripts/deploy.sh prod
```

#### Rollback Strategy

**Quick Rollback Script (`scripts/rollback.sh`)**
```bash
#!/bin/bash

set -e

ENVIRONMENT=${1:-prod}

echo "⏮️ Rolling back $ENVIRONMENT environment..."

# Stop current containers
docker compose --profile "$ENVIRONMENT" down

# Restore from previous image tag (manual tagging required)
echo "Please specify the image tag to rollback to:"
read -r IMAGE_TAG

# Re-deploy with specific image
docker compose --env-file ".env.${ENVIRONMENT/local/development}" --profile "$ENVIRONMENT" up -d

# Optionally rollback database migrations
echo "⚠️ Do you need to rollback database migrations? (y/N)"
read -r ROLLBACK_DB

if [ "$ROLLBACK_DB" = "y" ]; then
  echo "⚠️ WARNING: Database rollback not implemented. Handle manually via Prisma migration reset."
  echo "   See: https://www.prisma.io/docs/guides/migrate/production-troubleshooting"
fi

echo "✅ Rollback complete"
```

#### Production Deployment Hardening

**Docker Compose Production Enhancements**
```yaml
services:
  backend-prod:
    # ... existing config ...
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  frontend-prod:
    # ... existing config ...
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**Production Security Checklist**
```bash
# 1. Change default passwords in .env.production
# 2. Restrict database access to backend container only
# 3. Use Docker secrets for sensitive values (optional)
# 4. Enable firewall rules (only expose necessary ports)
# 5. Set up SSL/TLS (if exposing beyond local network)
```

#### Backup Strategy

**Database Backup Script (`scripts/backup-db.sh`)**
```bash
#!/bin/bash

ENVIRONMENT=${1:-prod}
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "💾 Backing up $ENVIRONMENT database..."

if [ "$ENVIRONMENT" = "prod" ]; then
  docker compose exec -T database pg_dump -U todo_app_user todo_app_prod > "$BACKUP_DIR/backup_${DATE}.sql"
else
  docker compose exec -T database pg_dump -U postgres todo_app_dev > "$BACKUP_DIR/backup_${DATE}.sql"
fi

# Compress backup
gzip "$BACKUP_DIR/backup_${DATE}.sql"

echo "✅ Backup saved to: $BACKUP_DIR/backup_${DATE}.sql.gz"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/*.sql.gz | tail -n +8 | xargs -r rm

echo "🧹 Cleaned old backups (keeping last 7)"
```

**Database Restore Script (`scripts/restore-db.sh`)**
```bash
#!/bin/bash

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-db.sh <backup-file.sql.gz>"
  exit 1
fi

echo "⚠️ WARNING: This will overwrite the current database!"
echo "Restoring from: $BACKUP_FILE"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Decompress and restore
gunzip -c "$BACKUP_FILE" | docker compose exec -T database psql -U postgres todo_app_prod

echo "✅ Database restored"
```

### Deployment Workflow Summary

```
┌─────────────────────────────────────────────────┐
│         Development Workflow                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Local Development                           │
│     └─> docker compose --profile local up       │
│     └─> Edit code (hot reload active)           │
│     └─> Test manually in browser                │
│                                                  │
│  2. Testing Phase                               │
│     └─> docker compose --profile test up        │
│     └─> pnpm test:all                           │
│     └─> Fix issues, iterate                     │
│                                                  │
│  3. Production Deployment (Manual)              │
│     └─> Backup database                         │
│     └─> ./scripts/deploy.sh prod                │
│     └─> Verify health checks                    │
│     └─> Monitor logs                            │
│                                                  │
│  4. Rollback (if needed)                        │
│     └─> ./scripts/rollback.sh prod              │
│     └─> Restore database backup                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Future CI/CD Path (Post-MVP)

When ready to automate:

**GitHub Actions Example**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:all
      - name: Deploy to production
        run: |
          ssh user@server 'cd /app && ./scripts/deploy.sh prod'
```

### Benefits
- **Environment Parity**: All environments use same Docker setup
- **Simple Process**: Manual deployment is straightforward and debuggable
- **Zero External Dependencies**: No CI/CD service needed
- **Flexible**: Easy to add automation later

### Trade-offs
- Manual process prone to human error (mitigated by scripts)
- No automatic rollback (manual process defined)
- No deployment history/audit log (acceptable for single-user MVP)
- Requires SSH access to production server

---

## Summary of Architectural Decisions

This document captures implementation-focused decisions for the Mobile-First Task Management Application MVP. These decisions complement the technical architecture specification and provide clear guidance for development.

### Key Decisions Made

1. **Workspace**: pnpm workspaces with shared types package (no Nx)
2. **Development**: Docker Compose profiles for environment separation with hot reload
3. **Logging**: Pino with console output (structured JSON in production)
4. **State**: Layered approach (TanStack Query + LocalStorage + React Hook Form)
5. **Testing**: Testcontainers for realistic test environment (no CI/CD initially)
6. **Versioning**: URL-based API versioning from day one (`/api/v1`)
7. **Monitoring**: Health endpoint for Docker healthchecks (no APM for MVP)
8. **Deployment**: Three manual environments (local, test, prod) with helper scripts

### Next Steps: Implementation

With architecture decisions documented, you're ready to proceed with:

1. **Project Scaffolding** - Set up pnpm workspace structure
2. **Backend Implementation** - Prisma schema, Fastify routes, business logic
3. **Frontend Implementation** - React components, TanStack Query hooks, MUI theming
4. **Testing Setup** - Testcontainers, unit tests, E2E tests
5. **Deployment** - Docker Compose configuration, environment setup

**Pregno**, would you like to:

- **[Next]** Proceed to Implementation Readiness check (verify all artifacts aligned)
- **[Refine]** Dive deeper into any specific decision area
- **[Export]** Generate implementation checklist from these decisions
- **[Chat]** Discuss any concerns or questions about the architecture

What would you like to do?
