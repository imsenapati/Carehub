import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-utils', () => ({
  simulateLatency: vi.fn().mockResolvedValue(undefined),
  simulateError: vi.fn().mockReturnValue(false),
  createErrorResponse: vi.fn((msg: string, status: number = 500) =>
    Response.json({ error: msg }, { status })
  ),
}));

import { GET } from '@/app/api/notifications/route';
import { POST } from '@/app/api/notifications/mark-all-read/route';
import { PUT } from '@/app/api/notifications/[id]/read/route';
import { notifications } from '@/mocks/data';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/notifications', () => {
  it('returns all notifications', async () => {
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBeGreaterThan(0);
  });
});

describe('POST /api/notifications/mark-all-read', () => {
  it('marks all notifications as read', async () => {
    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);

    // verify notifications are now read
    for (const notif of notifications) {
      expect(notif.read).toBe(true);
    }
  });
});

describe('PUT /api/notifications/[id]/read', () => {
  it('marks a single notification as read', async () => {
    // Reset a notification to unread first
    notifications[0].read = false;

    const id = notifications[0].id;
    const req = new NextRequest(
      new URL(`http://localhost:3000/api/notifications/${id}/read`),
      { method: 'PUT' }
    );

    const res = await PUT(req, makeParams(id));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.read).toBe(true);
    expect(body.id).toBe(id);
  });

  it('returns 404 for unknown ID', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/notifications/nonexistent/read'),
      { method: 'PUT' }
    );

    const res = await PUT(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });
});
