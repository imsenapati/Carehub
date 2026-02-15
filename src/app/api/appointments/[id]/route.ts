import { NextRequest } from 'next/server';
import { appointments } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) {
    return Response.json({ error: 'Appointment not found' }, { status: 404 });
  }

  const body = await request.json();
  appointments[idx] = { ...appointments[idx], ...body };

  return Response.json(appointments[idx]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) {
    return Response.json({ error: 'Appointment not found' }, { status: 404 });
  }

  appointments[idx] = { ...appointments[idx], status: 'cancelled' };

  return Response.json({ success: true });
}
