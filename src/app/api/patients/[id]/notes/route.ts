import { NextRequest } from 'next/server';
import { notes } from '@/mocks/data';
import { simulateLatency } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;

  const patientNotes = notes
    .filter((n) => n.patientId === id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return Response.json(patientNotes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateLatency();
  const { id } = await params;
  const body = await request.json();

  const newNote = {
    id: `note-${Date.now()}`,
    patientId: id,
    providerId: 'prov-1',
    providerName: 'Dr. Chen',
    date: new Date().toISOString().split('T')[0],
    type: body.type || 'progress',
    title: body.title || '',
    content: body.content || '',
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);

  return Response.json(newNote, { status: 201 });
}
