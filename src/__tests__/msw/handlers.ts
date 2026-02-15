import { http, HttpResponse } from 'msw';

const mockPatient = {
  id: 'pat-01',
  mrn: 'MRN-100000',
  firstName: 'James',
  lastName: 'Smith',
  dateOfBirth: '1970-01-15',
  gender: 'male',
  email: 'james.smith@email.com',
  phone: '(555) 200-1000',
  address: { street: '100 Main St', city: 'New York', state: 'NY', zip: '10001' },
  insuranceProvider: 'BlueCross BlueShield',
  insuranceId: 'INS-200000',
  primaryProviderId: 'prov-1',
  status: 'active',
  riskLevel: 'low',
  photoUrl: '',
  allergies: ['Penicillin'],
  conditions: ['Hypertension'],
  createdAt: '2023-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

export const handlers = [
  http.get('/api/patients', () => {
    return HttpResponse.json({
      data: [mockPatient],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  }),

  http.get('/api/patients/:id', ({ params }) => {
    if (params.id === 'pat-01') {
      return HttpResponse.json(mockPatient);
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  http.get('/api/providers', () => {
    return HttpResponse.json([
      {
        id: 'prov-1',
        firstName: 'Sarah',
        lastName: 'Chen',
        title: 'MD',
        specialty: 'Internal Medicine',
        email: 'sarah.chen@carehub.com',
        phone: '(555) 100-0001',
        photoUrl: '',
        color: '#3B82F6',
      },
    ]);
  }),

  http.get('/api/notifications', () => {
    return HttpResponse.json([
      {
        id: 'notif-01',
        type: 'appointment',
        title: 'Test',
        message: 'Test notification',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/appointments', () => {
    return HttpResponse.json([]);
  }),
];
