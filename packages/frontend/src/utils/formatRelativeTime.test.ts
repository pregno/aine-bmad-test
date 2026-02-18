import { describe, expect, it, vi, afterEach } from 'vitest';
import { formatRelativeTime } from './formatRelativeTime';

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('returns "just now" for dates within last minute', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-18T12:00:00Z'));
    expect(formatRelativeTime('2026-02-18T11:59:30.000Z')).toBe('just now');
  });

  it('returns "X min ago" for dates within last hour', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-18T12:00:00Z'));
    expect(formatRelativeTime('2026-02-18T11:58:00.000Z')).toBe('2 min ago');
  });

  it('returns time string for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-18T14:00:00Z'));
    expect(formatRelativeTime('2026-02-18T10:30:00.000Z')).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns "X days ago" for dates within last week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-18T12:00:00Z'));
    expect(formatRelativeTime('2026-02-16T12:00:00.000Z')).toBe('2 days ago');
  });

  it('returns empty string for invalid ISO string', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('returns "just now" for future dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-18T12:00:00Z'));
    expect(formatRelativeTime('2026-02-18T12:05:00.000Z')).toBe('just now');
  });
});
