import { NextRequest } from 'next/server';
import { appointments } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let filtered = appointments.filter((a) => a.providerId === id);

  if (startDate) {
    filtered = filtered.filter((a) => a.date >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter((a) => a.date <= endDate);
  }

  filtered.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return Response.json(filtered);
}
