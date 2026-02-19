import type { FastifyPluginAsync } from 'fastify';
import { TaskStatus } from '@aine/shared';
import type { CreateTaskResponse, GetTasksResponse, Task, UpdateTaskResponse } from '@aine/shared';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createTaskSchema, updateTaskSchema, uuidParamSchema } from '../schemas/tasks';
import { TaskNotFoundError, ValidationError } from '../utils/errorHandler';

function toSharedTaskStatus(status: PrismaTaskStatus): Task['status'] {
  return status === PrismaTaskStatus.ACTIVE ? TaskStatus.ACTIVE : TaskStatus.COMPLETED;
}

function toSharedTask(dbTask: {
  id: string;
  text: string;
  status: PrismaTaskStatus;
  createdAt: Date;
  completedAt: Date | null;
}): Task {
  return {
    id: dbTask.id,
    text: dbTask.text,
    status: toSharedTaskStatus(dbTask.status),
    createdAt: dbTask.createdAt.toISOString(),
    completedAt: dbTask.completedAt?.toISOString() ?? null,
  };
}

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/tasks', async (_request, reply) => {
    const [activeTasks, completedTasks] = await Promise.all([
      fastify.prisma.task.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
      fastify.prisma.task.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'asc' },
      }),
    ]);

    const tasks = [...activeTasks.map(toSharedTask), ...completedTasks.map(toSharedTask)];
    const response: GetTasksResponse = { tasks };
    return reply.status(200).send(response);
  });

  fastify.post<{ Body: { text?: string } }>('/tasks', async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const textErr = flat.fieldErrors['text']?.[0];
      const message = textErr ?? parsed.error.errors[0]?.message ?? 'Validation failed';
      throw new ValidationError(message, flat);
    }

    const { text } = parsed.data;
    const task = await fastify.prisma.task.create({
      data: { text, status: 'ACTIVE' },
    });

    const response: CreateTaskResponse = {
      task: toSharedTask(task),
    };

    return reply.status(201).send(response);
  });

  fastify.patch<{ Params: { id: string }; Body: { status?: string } }>(
    '/tasks/:id',
    async (request, reply) => {
      const { id } = request.params;

      const idParsed = uuidParamSchema.safeParse(id);
      if (!idParsed.success) {
        throw new ValidationError('Invalid task ID format');
      }

      const parsed = updateTaskSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        const flat = parsed.error.flatten();
        const statusErr = flat.fieldErrors['status']?.[0];
        const message = statusErr ?? parsed.error.errors[0]?.message ?? 'Validation failed';
        throw new ValidationError(message, flat);
      }

      const { status } = parsed.data;
      const completedAt = status === TaskStatus.COMPLETED ? new Date() : null;

      try {
        const updated = await fastify.prisma.task.update({
          where: { id: idParsed.data },
          data: { status, completedAt },
        });

        const response: UpdateTaskResponse = { task: toSharedTask(updated) };
        return reply.status(200).send(response);
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
          throw new TaskNotFoundError(idParsed.data);
        }
        throw err;
      }
    }
  );

  // IMPORTANT (Story 3.3): When adding DELETE /tasks/completed for bulk delete,
  // register that route BEFORE this one — otherwise ':id' will match the literal "completed".
  fastify.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    const { id } = request.params;

    const idParsed = uuidParamSchema.safeParse(id);
    if (!idParsed.success) {
      throw new ValidationError('Invalid task ID format');
    }

    try {
      await fastify.prisma.task.delete({ where: { id: idParsed.data } });
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new TaskNotFoundError(idParsed.data);
      }
      throw err;
    }
  });
};
