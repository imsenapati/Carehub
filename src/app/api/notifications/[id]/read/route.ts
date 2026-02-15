import { NextRequest } from 'next/server';
import { notifications } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const notif = notifications.find((n) => n.id === id);
  if (!notif) {
    return Response.json({ error: 'Notification not found' }, { status: 404 });
  }

  notif.read = true;

  return Response.json(notif);
}
