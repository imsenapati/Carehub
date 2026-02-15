import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchJson('/api/notifications'),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/notifications/${id}/read`, { method: 'PUT' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) || []
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(['notifications'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson('/api/notifications/mark-all-read', { method: 'POST' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => ({ ...n, read: true })) || []
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) queryClient.setQueryData(['notifications'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
