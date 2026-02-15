import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-utils', () => ({
  simulateLatency: vi.fn().mockResolvedValue(undefined),
  simulateError: vi.fn().mockReturnValue(false),
  createErrorResponse: vi.fn((msg: string, status: number = 500) =>
    Response.json({ error: msg }, { status })
  ),
}));

import { GET, POST } from '@/app/api/appointments/route';
import { PUT, DELETE } from '@/app/api/appointments/[id]/route';
import { appointments } from '@/mocks/data';

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/appointments');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/appointments', () => {
  it('returns all appointments', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBeGreaterThan(0);
  });

  it('filters by date range', async () => {
    const startDate = '2020-01-01';
    const endDate = '2030-12-31';
    const res = await GET(makeGetRequest({ startDate, endDate }));
    const body = await res.json();

    for (const appt of body) {
      expect(appt.date >= startDate).toBe(true);
      expect(appt.date <= endDate).toBe(true);
    }
  });

  it('filters by providerId', async () => {
    const providerId = appointments[0].providerId;
    const res = await GET(makeGetRequest({ providerId }));
    const body = await res.json();

    for (const appt of body) {
      expect(appt.providerId).toBe(providerId);
    }
  });

  it('sorts by date then startTime', async () => {
    const res = await GET(makeGetRequest());
    const body = await res.json();

    for (let i = 1; i < body.length; i++) {
      const prev = body[i - 1];
      const curr = body[i];
      if (prev.date === curr.date) {
        expect(curr.startTime.localeCompare(prev.startTime)).toBeGreaterThanOrEqual(0);
      } else {
        expect(curr.date.localeCompare(prev.date)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('POST /api/appointments', () => {
  it('creates a new appointment', async () => {
    const newAppt = {
      patientName: 'Test Patient',
      reason: 'Check-up',
      date: '2025-06-15',
      startTime: '10:00',
      endTime: '11:00',
      type: 'check-up',
    };

    const req = new NextRequest(
      new URL('http://localhost:3000/api/appointments'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt),
      }
    );

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBeDefined();
    expect(body.patientName).toBe('Test Patient');
    expect(body.date).toBe('2025-06-15');
    expect(body.status).toBe('scheduled');
  });
});

describe('PUT /api/appointments/[id]', () => {
  it('updates an appointment', async () => {
    const id = appointments[0].id;
    const req = new NextRequest(
      new URL(`http://localhost:3000/api/appointments/${id}`),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: 'Room 999' }),
      }
    );

    const res = await PUT(req, makeParams(id));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.room).toBe('Room 999');
  });

  it('returns 404 for unknown ID', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/appointments/nonexistent'),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: 'Room 1' }),
      }
    );

    const res = await PUT(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/appointments/[id]', () => {
  it('cancels an appointment', async () => {
    const id = appointments[0].id;
    const req = new NextRequest(
      new URL(`http://localhost:3000/api/appointments/${id}`),
      { method: 'DELETE' }
    );

    const res = await DELETE(req, makeParams(id));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 404 for unknown ID', async () => {
    const req = new NextRequest(
      new URL('http://localhost:3000/api/appointments/nonexistent'),
      { method: 'DELETE' }
    );

    const res = await DELETE(req, makeParams('nonexistent'));
    expect(res.status).toBe(404);
  });
});
