import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatients, usePatient } from '@/hooks/usePatients';
import { ReactNode } from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('usePatients', () => {
  it('fetches paginated patient data', async () => {
    const { result } = renderHook(
      () => usePatients({ page: 1, limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toBeInstanceOf(Array);
    expect(result.current.data?.data.length).toBeGreaterThan(0);
    expect(result.current.data?.pagination).toBeDefined();
  });
});

describe('usePatient', () => {
  it('fetches a single patient by ID', async () => {
    const { result } = renderHook(
      () => usePatient('pat-01'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe('pat-01');
    expect(result.current.data?.firstName).toBe('James');
  });

  it('returns error for unknown patient ID', async () => {
    const { result } = renderHook(
      () => usePatient('nonexistent'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
