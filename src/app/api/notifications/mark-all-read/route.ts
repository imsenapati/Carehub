import { notifications } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function POST() {
  await simulateLatency();

  notifications.forEach((n) => {
    n.read = true;
  });

  return Response.json({ success: true });
}
