import { describe, it, expect } from 'vitest';
import { createTaskSchema } from './tasks';

describe('createTaskSchema', () => {
  it('accepts valid text', () => {
    const result = createTaskSchema.safeParse({ text: 'Review PR #123' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe('Review PR #123');
    }
  });

  it('rejects empty text', () => {
    const result = createTaskSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only text', () => {
    const result = createTaskSchema.safeParse({ text: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects text exceeding 500 characters', () => {
    const result = createTaskSchema.safeParse({ text: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('accepts exactly 500 characters', () => {
    const result = createTaskSchema.safeParse({ text: 'a'.repeat(500) });
    expect(result.success).toBe(true);
  });
});
