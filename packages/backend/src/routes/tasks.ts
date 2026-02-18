import type { FastifyPluginAsync } from 'fastify';
import { TaskStatus } from '@aine/shared';
import type { CreateTaskResponse, Task } from '@aine/shared';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { createTaskSchema } from '../schemas/tasks';
import { ValidationError } from '../utils/errorHandler';

function toSharedTaskStatus(status: PrismaTaskStatus): Task['status'] {
  return status === PrismaTaskStatus.ACTIVE ? TaskStatus.ACTIVE : TaskStatus.COMPLETED;
}

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
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

    const responseTask: Task = {
      id: task.id,
      text: task.text,
      status: toSharedTaskStatus(task.status),
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString() ?? null,
    };

    const response: CreateTaskResponse = {
      task: responseTask,
    };

    return reply.status(201).send(response);
  });
};
