import { NextRequest } from 'next/server';
import { appointments } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const patientAppts = appointments
    .filter((a) => a.patientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return Response.json(patientAppts);
}
