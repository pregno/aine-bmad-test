export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class TaskNotFoundError extends AppError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, 404, 'TASK_NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

interface ErrorResult {
  statusCode: number;
  body: Record<string, unknown>;
}

interface ErrorWithMetadata extends Error {
  statusCode?: number;
  code?: string;
  validation?: unknown;
}

export function buildErrorResponse(
  error: ErrorWithMetadata,
  requestUrl: string,
  requestId: string
): ErrorResult {
  const isProduction = process.env['NODE_ENV'] === 'production';

  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else {
    statusCode = error.statusCode ?? 500;
    message = error.message;
    code = error.code;
    if (statusCode < 500 && error.validation !== undefined) {
      details = error.validation;
      if (code === undefined) {
        code = 'VALIDATION_ERROR';
      }
    }
  }

  if (isProduction && statusCode >= 500) {
    message = 'Internal server error';
    code = undefined;
    details = undefined;
  }

  const body: Record<string, unknown> = {
    error: message,
    timestamp: new Date().toISOString(),
    path: requestUrl,
    requestId,
  };

  if (code !== undefined) {
    body['code'] = code;
  }
  if (details !== undefined) {
    body['details'] = details;
  }

  return { statusCode, body };
}
