import { NextRequest } from 'next/server';
import { patients, appointments } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';
import { Patient, PaginatedResponse } from '@/types';

export async function GET(request: NextRequest) {
  await simulateLatency();

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') as Patient['status'] | null;
  const provider = searchParams.get('provider');
  const hasUpcoming = searchParams.get('hasUpcoming');
  const riskLevel = searchParams.get('riskLevel') as Patient['riskLevel'] | null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'lastName';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  const today = new Date().toISOString().split('T')[0];

  let filtered = [...patients];

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.firstName.toLowerCase().includes(search) ||
        p.lastName.toLowerCase().includes(search) ||
        p.mrn.toLowerCase().includes(search) ||
        p.dateOfBirth.includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (provider) {
    filtered = filtered.filter((p) => p.primaryProviderId === provider);
  }

  if (hasUpcoming === 'true') {
    const patientsWithUpcoming = new Set(
      appointments.filter((a) => a.date >= today).map((a) => a.patientId)
    );
    filtered = filtered.filter((p) => patientsWithUpcoming.has(p.id));
  }

  if (riskLevel) {
    filtered = filtered.filter((p) => p.riskLevel === riskLevel);
  }

  filtered.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  const response: PaginatedResponse<Patient> = {
    data,
    pagination: { page, limit, total, totalPages },
  };

  return Response.json(response);
}
