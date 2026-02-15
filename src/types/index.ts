export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  insuranceProvider: string;
  insuranceId: string;
  primaryProviderId: string;
  status: 'active' | 'inactive' | 'deceased';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  photoUrl: string;
  allergies: string[];
  conditions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  email: string;
  phone: string;
  photoUrl: string;
  color: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'check-up' | 'follow-up' | 'urgent' | 'procedure' | 'consultation' | 'telehealth';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  room: string;
  notes: string;
  reason: string;
}

export interface Vital {
  id: string;
  patientId: string;
  date: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  recordedBy: string;
}

export interface Note {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  date: string;
  type: 'progress' | 'soap' | 'procedure' | 'discharge' | 'referral';
  title: string;
  content: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'patient-alert' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  patientId?: string;
  appointmentId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'deceased';
  provider?: string;
  hasUpcoming?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
