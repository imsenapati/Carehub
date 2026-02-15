import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient, PatientFilters, PaginatedResponse, Appointment, Vital, Note } from '@/types';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function usePatients(filters: PatientFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.provider) params.set('provider', filters.provider);
  if (filters.hasUpcoming !== undefined) params.set('hasUpcoming', String(filters.hasUpcoming));
  if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  return useQuery<PaginatedResponse<Patient>>({
    queryKey: ['patients', filters],
    queryFn: () => fetchJson(`/api/patients?${params.toString()}`),
  });
}

export function usePatient(id: string) {
  return useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => fetchJson(`/api/patients/${id}`),
    enabled: !!id,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      fetchJson<Patient>(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery<Appointment[]>({
    queryKey: ['patient-appointments', patientId],
    queryFn: () => fetchJson(`/api/patients/${patientId}/appointments`),
    enabled: !!patientId,
  });
}

export function usePatientVitals(patientId: string) {
  return useQuery<Vital[]>({
    queryKey: ['patient-vitals', patientId],
    queryFn: () => fetchJson(`/api/patients/${patientId}/vitals`),
    enabled: !!patientId,
    retry: 3,
  });
}

export function usePatientNotes(patientId: string) {
  return useQuery<Note[]>({
    queryKey: ['patient-notes', patientId],
    queryFn: () => fetchJson(`/api/patients/${patientId}/notes`),
    enabled: !!patientId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: Partial<Note> }) =>
      fetchJson<Note>(`/api/patients/${patientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onMutate: async ({ patientId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['patient-notes', patientId] });
      const previous = queryClient.getQueryData<Note[]>(['patient-notes', patientId]);
      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        patientId,
        providerId: 'prov-1',
        providerName: 'Dr. Chen',
        date: new Date().toISOString().split('T')[0],
        type: (data.type as Note['type']) || 'progress',
        title: data.title || '',
        content: data.content || '',
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Note[]>(['patient-notes', patientId], (old) =>
        [optimisticNote, ...(old || [])]
      );
      return { previous };
    },
    onError: (_, { patientId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['patient-notes', patientId], context.previous);
      }
    },
    onSettled: (_, __, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['patient-notes', patientId] });
    },
  });
}
