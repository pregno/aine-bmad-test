import { describe, it, expect, afterEach } from 'vitest';
import { TaskNotFoundError, ValidationError, buildErrorResponse } from './errorHandler';

describe('errorHandler', () => {
  const requestUrl = '/api/v1/tasks';
  const requestId = 'req-1';

  describe('buildErrorResponse', () => {
    describe('AppError subclasses', () => {
      it('maps TaskNotFoundError to 404 with TASK_NOT_FOUND code', () => {
        const error = new TaskNotFoundError('abc-123');
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(404);
        expect(result.body).toMatchObject({
          error: 'Task not found: abc-123',
          code: 'TASK_NOT_FOUND',
          path: requestUrl,
          requestId,
        });
        expect(result.body['timestamp']).toBeDefined();
      });

      it('maps ValidationError to 400 with details', () => {
        const details = [{ field: 'text', message: 'Required' }];
        const error = new ValidationError('Invalid body', details);
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(400);
        expect(result.body).toMatchObject({
          error: 'Invalid body',
          code: 'VALIDATION_ERROR',
          details,
          path: requestUrl,
          requestId,
        });
      });
    });

    describe('generic errors', () => {
      it('maps error with statusCode and validation to 4xx with details', () => {
        const validation = [{ instancePath: '/body', message: 'must have required property' }];
        const error = Object.assign(new Error('Validation failed'), {
          statusCode: 400,
          validation,
        });
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(400);
        expect(result.body).toMatchObject({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation,
          path: requestUrl,
          requestId,
        });
      });

      it('defaults unknown errors to 500', () => {
        const error = new Error('Something broke');
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(500);
        expect(result.body).toMatchObject({
          error: 'Internal server error',
          path: requestUrl,
          requestId,
        });
        expect(result.body['code']).toBeUndefined();
      });
    });

    describe('production sanitization', () => {
      const originalEnv = process.env['NODE_ENV'];

      afterEach(() => {
        process.env['NODE_ENV'] = originalEnv;
      });

      it('sanitizes 5xx errors in production', () => {
        process.env['NODE_ENV'] = 'production';
        const error = new Error('Internal DB connection failed');
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(500);
        expect(result.body['error']).toBe('Internal server error');
        expect(result.body['code']).toBeUndefined();
        expect(result.body['details']).toBeUndefined();
      });

      it('exposes 4xx details in production', () => {
        process.env['NODE_ENV'] = 'production';
        const error = new ValidationError('Invalid', { field: 'text' });
        const result = buildErrorResponse(error, requestUrl, requestId);

        expect(result.statusCode).toBe(400);
        expect(result.body['error']).toBe('Invalid');
        expect(result.body['details']).toEqual({ field: 'text' });
      });
    });
  });
});
