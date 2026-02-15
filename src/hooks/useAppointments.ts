import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useAppointments(params: { startDate?: string; endDate?: string; providerId?: string }) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.providerId) searchParams.set('providerId', params.providerId);

  return useQuery<Appointment[]>({
    queryKey: ['appointments', params],
    queryFn: () => fetchJson(`/api/appointments?${searchParams.toString()}`),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Appointment>) =>
      fetchJson<Appointment>('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) =>
      fetchJson<Appointment>(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/appointments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
