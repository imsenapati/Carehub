import { NextRequest } from 'next/server';
import { patients } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const patient = patients.find((p) => p.id === id);
  if (!patient) {
    return Response.json({ error: 'Patient not found' }, { status: 404 });
  }

  return Response.json(patient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const idx = patients.findIndex((p) => p.id === id);
  if (idx === -1) {
    return Response.json({ error: 'Patient not found' }, { status: 404 });
  }

  const body = await request.json();
  patients[idx] = { ...patients[idx], ...body, updatedAt: new Date().toISOString() };

  return Response.json(patients[idx]);
}
