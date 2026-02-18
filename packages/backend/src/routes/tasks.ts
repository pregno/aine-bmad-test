import type { FastifyPluginAsync } from 'fastify';
import { TaskStatus } from '@aine/shared';
import type { CreateTaskResponse, GetTasksResponse, Task } from '@aine/shared';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { createTaskSchema } from '../schemas/tasks';
import { ValidationError } from '../utils/errorHandler';

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
};
