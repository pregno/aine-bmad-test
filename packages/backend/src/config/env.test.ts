import { describe, it, expect } from 'vitest';
import { envSchema } from './envSchema';

describe('envSchema', () => {
  const baseEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/todo_app_dev',
  };

  it('parses valid env with defaults', () => {
    const result = envSchema.safeParse(baseEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.PORT).toBe(3000);
      expect(result.data.LOG_LEVEL).toBe('info');
      expect(result.data.DATABASE_URL).toBe(baseEnv.DATABASE_URL);
    }
  });

  it('transforms PORT string to number', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: '4000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(4000);
    }
  });

  it('rejects invalid PORT', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: '99999',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty DATABASE_URL', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      DATABASE_URL: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional FRONTEND_URL', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      FRONTEND_URL: 'http://localhost:5173',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.FRONTEND_URL).toBe('http://localhost:5173');
    }
  });

  it('accepts postgresql:// DATABASE_URL', () => {
    const result = envSchema.safeParse(baseEnv);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DATABASE_URL).toMatch(/^postgresql:\/\//);
    }
  });

  it('accepts valid AUTO_DELETE_CRON expression', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      AUTO_DELETE_CRON: '*/30 * * * *',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.AUTO_DELETE_CRON).toBe('*/30 * * * *');
    }
  });

  it('rejects invalid AUTO_DELETE_CRON expression', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      AUTO_DELETE_CRON: 'not-a-cron',
    });
    expect(result.success).toBe(false);
  });
});
