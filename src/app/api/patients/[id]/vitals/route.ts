import { NextRequest } from 'next/server';
import { vitals } from '@/mocks/data';
import { simulateLatency, simulateError } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();

  // 5% failure rate on this endpoint
  if (simulateError()) {
    return Response.json(
      { error: 'Internal server error - vitals service temporarily unavailable' },
      { status: 500 }
    );
  }

  const { id } = await params;

  const patientVitals = vitals
    .filter((v) => v.patientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return Response.json(patientVitals);
}
