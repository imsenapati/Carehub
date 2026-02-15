import { describe, it, expect, vi } from 'vitest';
import { simulateLatency, simulateError, createErrorResponse } from '@/lib/api-utils';

describe('simulateLatency', () => {
  it('resolves after a delay', async () => {
    vi.useFakeTimers();
    const promise = simulateLatency();
    vi.advanceTimersByTime(600);
    await promise;
    vi.useRealTimers();
  });
});

describe('simulateError', () => {
  it('returns true when Math.random is below threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.04);
    expect(simulateError()).toBe(true);
    vi.restoreAllMocks();
  });

  it('returns false when Math.random is above threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.06);
    expect(simulateError()).toBe(false);
    vi.restoreAllMocks();
  });
});

describe('createErrorResponse', () => {
  it('returns a Response with correct status and body', async () => {
    const res = createErrorResponse('Not found', 404);

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Not found' });
  });

  it('defaults to status 500', async () => {
    const res = createErrorResponse('Server error');
    expect(res.status).toBe(500);
  });
});
