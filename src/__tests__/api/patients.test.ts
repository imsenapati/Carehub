import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-utils', () => ({
  simulateLatency: vi.fn().mockResolvedValue(undefined),
  simulateError: vi.fn().mockReturnValue(false),
  createErrorResponse: vi.fn((msg: string, status: number = 500) =>
    Response.json({ error: msg }, { status })
  ),
}));

import { GET } from '@/app/api/patients/route';

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost:3000/api/patients');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe('GET /api/patients', () => {
  it('returns paginated patients with defaults', async () => {
    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data.length).toBeLessThanOrEqual(10);
    expect(body.pagination).toEqual(
      expect.objectContaining({ page: 1, limit: 10 })
    );
    expect(body.pagination.total).toBeGreaterThan(0);
  });

  it('filters by search term', async () => {
    const res = await GET(makeRequest({ search: 'MRN' }));
    const body = await res.json();

    expect(body.data.length).toBeGreaterThan(0);
    for (const patient of body.data) {
      const match =
        patient.firstName.toLowerCase().includes('mrn') ||
        patient.lastName.toLowerCase().includes('mrn') ||
        patient.mrn.toLowerCase().includes('mrn') ||
        patient.dateOfBirth.includes('mrn');
      expect(match).toBe(true);
    }
  });

  it('filters by status', async () => {
    const res = await GET(makeRequest({ status: 'active' }));
    const body = await res.json();

    for (const patient of body.data) {
      expect(patient.status).toBe('active');
    }
  });

  it('filters by risk level', async () => {
    const res = await GET(makeRequest({ riskLevel: 'high' }));
    const body = await res.json();

    for (const patient of body.data) {
      expect(patient.riskLevel).toBe('high');
    }
  });

  it('sorts by lastName ascending by default', async () => {
    const res = await GET(makeRequest({ limit: '50' }));
    const body = await res.json();

    for (let i = 1; i < body.data.length; i++) {
      expect(
        body.data[i].lastName.localeCompare(body.data[i - 1].lastName)
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('sorts by lastName descending', async () => {
    const res = await GET(makeRequest({ limit: '50', sortOrder: 'desc' }));
    const body = await res.json();

    for (let i = 1; i < body.data.length; i++) {
      expect(
        body.data[i - 1].lastName.localeCompare(body.data[i].lastName)
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it('paginates correctly', async () => {
    const res = await GET(makeRequest({ page: '2', limit: '5' }));
    const body = await res.json();

    expect(body.pagination.page).toBe(2);
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  it('returns empty data for non-matching search', async () => {
    const res = await GET(makeRequest({ search: 'zzzznonexistent99999' }));
    const body = await res.json();

    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });
});
