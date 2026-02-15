import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-utils', () => ({
  simulateLatency: vi.fn().mockResolvedValue(undefined),
  simulateError: vi.fn().mockReturnValue(false),
  createErrorResponse: vi.fn((msg: string, status: number = 500) =>
    Response.json({ error: msg }, { status })
  ),
}));

import { GET, PUT } from '@/app/api/patients/[id]/route';
import { patients } from '@/mocks/data';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/patients/[id]', () => {
  it('returns patient by ID', async () => {
    const id = patients[0].id;
    const res = await GET(
      new NextRequest(new URL(`http://localhost:3000/api/patients/${id}`)),
      makeParams(id)
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe(id);
    expect(body.firstName).toBeDefined();
    expect(body.lastName).toBeDefined();
  });

  it('returns 404 for unknown ID', async () => {
    const res = await GET(
      new NextRequest(new URL('http://localhost:3000/api/patients/nonexistent')),
      makeParams('nonexistent')
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Patient not found');
  });
});

describe('PUT /api/patients/[id]', () => {
  it('updates patient fields', async () => {
    const id = patients[0].id;
    const req = new NextRequest(
      new URL(`http://localhost:3000/api/patients/${id}`),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '(555) 999-9999' }),
      }
    );

    const res = await PUT(req, makeParams(id));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.phone).toBe('(555) 999-9999');
    expect(body.updatedAt).toBeDefined();
  });

  it('returns 404 for unknown ID', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/patients/nonexistent'),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '(555) 000-0000' }),
      }
    );

    const res = await PUT(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });
});
