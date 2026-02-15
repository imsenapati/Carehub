import { providers } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET() {
  await simulateLatency();
  return Response.json(providers);
}
