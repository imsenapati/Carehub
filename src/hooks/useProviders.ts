import { useQuery } from '@tanstack/react-query';
import { Provider } from '@/types';

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers');
      if (!res.ok) throw new Error('Failed to fetch providers');
      return res.json();
    },
  });
}
