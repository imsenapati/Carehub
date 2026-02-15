import { NextRequest } from 'next/server';
import { appointments } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  await simulateLatency();

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const providerId = searchParams.get('providerId');

  let filtered = [...appointments];

  if (startDate) {
    filtered = filtered.filter((a) => a.date >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter((a) => a.date <= endDate);
  }

  if (providerId) {
    filtered = filtered.filter((a) => a.providerId === providerId);
  }

  filtered.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return Response.json(filtered);
}

export async function POST(request: NextRequest) {
  await simulateLatency();

  const body = await request.json();

  const newAppt = {
    id: `appt-${Date.now()}`,
    patientId: body.patientId || '',
    patientName: body.patientName || '',
    providerId: body.providerId || 'prov-1',
    providerName: body.providerName || 'Dr. Chen',
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    type: body.type || 'check-up',
    status: body.status || 'scheduled',
    room: body.room || 'Room 101',
    notes: body.notes || '',
    reason: body.reason || '',
  };

  appointments.push(newAppt);

  return Response.json(newAppt, { status: 201 });
}
