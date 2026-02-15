import { Patient, Provider, Appointment, Vital, Note, Notification } from '@/types';

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];
const streets = ['Main St', 'Oak Ave', 'Elm St', 'Park Blvd', 'Cedar Ln', 'Maple Dr', 'Pine Rd', 'Washington Ave', 'Lake St', 'Hill Rd'];
const insuranceProviders = ['BlueCross BlueShield', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana', 'Kaiser Permanente'];
const allergies = ['Penicillin', 'Sulfa', 'Aspirin', 'Ibuprofen', 'Codeine', 'Latex', 'Peanuts', 'Shellfish', 'None'];
const conditions = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'COPD', 'Heart Failure', 'Atrial Fibrillation', 'Chronic Kidney Disease', 'Depression', 'Anxiety', 'Osteoarthritis', 'Hypothyroidism', 'GERD', 'Hyperlipidemia', 'Obesity', 'None'];
const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105', 'Room 201', 'Room 202', 'Room 203', 'Telehealth'];
const appointmentReasons = ['Annual physical', 'Follow-up visit', 'Blood pressure check', 'Diabetes management', 'Medication review', 'Lab results review', 'Chest pain evaluation', 'Shortness of breath', 'Joint pain', 'Headache', 'Back pain', 'Skin rash', 'Cough/cold', 'Wellness check'];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function pickMultiple<T>(arr: T[], count: number, seed: number): T[] {
  const result: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < count; i++) {
    let idx: number;
    let attempt = 0;
    do {
      idx = Math.floor(seededRandom(seed + i + result.length + attempt) * arr.length);
      attempt++;
    } while (used.has(idx) && used.size < arr.length);
    used.add(idx);
    result.push(arr[idx]);
  }
  return result;
}

function padZero(n: number): string {
  return n.toString().padStart(2, '0');
}

// Generate providers
export const providers: Provider[] = [
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
  {
    id: 'prov-2',
    firstName: 'Michael',
    lastName: 'Okafor',
    title: 'DO',
    specialty: 'Family Medicine',
    email: 'michael.okafor@carehub.com',
    phone: '(555) 100-0002',
    photoUrl: '',
    color: '#10B981',
  },
  {
    id: 'prov-3',
    firstName: 'Emily',
    lastName: 'Park',
    title: 'MD',
    specialty: 'Cardiology',
    email: 'emily.park@carehub.com',
    phone: '(555) 100-0003',
    photoUrl: '',
    color: '#F59E0B',
  },
  {
    id: 'prov-4',
    firstName: 'David',
    lastName: 'Martinez',
    title: 'MD',
    specialty: 'Endocrinology',
    email: 'david.martinez@carehub.com',
    phone: '(555) 100-0004',
    photoUrl: '',
    color: '#8B5CF6',
  },
  {
    id: 'prov-5',
    firstName: 'Rachel',
    lastName: 'Thompson',
    title: 'NP',
    specialty: 'Primary Care',
    email: 'rachel.thompson@carehub.com',
    phone: '(555) 100-0005',
    photoUrl: '',
    color: '#EC4899',
  },
];

// Generate 50 patients
export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const seed = i + 1;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const cityIdx = Math.floor(seededRandom(seed * 3) * cities.length);
  const dobYear = 1940 + Math.floor(seededRandom(seed * 7) * 60);
  const dobMonth = 1 + Math.floor(seededRandom(seed * 11) * 12);
  const dobDay = 1 + Math.floor(seededRandom(seed * 13) * 28);
  const statusArr: Patient['status'][] = ['active', 'active', 'active', 'active', 'inactive', 'deceased'];
  const riskArr: Patient['riskLevel'][] = ['low', 'low', 'medium', 'medium', 'high', 'critical'];
  const numAllergies = Math.floor(seededRandom(seed * 17) * 3);
  const numConditions = 1 + Math.floor(seededRandom(seed * 19) * 4);

  return {
    id: `pat-${padZero(i + 1)}`,
    mrn: `MRN-${(100000 + i * 137).toString()}`,
    firstName: fn,
    lastName: ln,
    dateOfBirth: `${dobYear}-${padZero(dobMonth)}-${padZero(dobDay)}`,
    gender: pick(['male', 'female', 'other'], seed * 23) as Patient['gender'],
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
    phone: `(555) ${padZero(200 + i)}-${padZero(1000 + i * 7).slice(-4)}`,
    address: {
      street: `${100 + i * 13} ${pick(streets, seed * 29)}`,
      city: cities[cityIdx],
      state: states[cityIdx],
      zip: `${10001 + i * 97}`,
    },
    insuranceProvider: pick(insuranceProviders, seed * 31),
    insuranceId: `INS-${(200000 + i * 251).toString()}`,
    primaryProviderId: providers[i % providers.length].id,
    status: pick(statusArr, seed * 37),
    riskLevel: pick(riskArr, seed * 41),
    photoUrl: '',
    allergies: pickMultiple(allergies, numAllergies, seed * 43),
    conditions: pickMultiple(conditions, numConditions, seed * 47),
    createdAt: `2023-${padZero(1 + (i % 12))}-${padZero(1 + (i % 28))}T10:00:00Z`,
    updatedAt: `2024-${padZero(1 + (i % 12))}-${padZero(1 + (i % 28))}T10:00:00Z`,
  };
});

// Generate appointments: ~120 spread across 2 weeks centered on today
function generateAppointments(): Appointment[] {
  const appts: Appointment[] = [];
  const today = new Date();
  const types: Appointment['type'][] = ['check-up', 'follow-up', 'urgent', 'procedure', 'consultation', 'telehealth'];
  const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
  const hours = [8, 9, 10, 11, 13, 14, 15, 16];

  let id = 1;
  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    const apptCount = 8 + Math.floor(seededRandom(dayOffset + 100) * 5);
    for (let j = 0; j < apptCount; j++) {
      const seed = id * 53;
      const patientIdx = Math.floor(seededRandom(seed) * patients.length);
      const providerIdx = Math.floor(seededRandom(seed + 1) * providers.length);
      const hour = hours[j % hours.length];
      const isPast = dayOffset < 0;

      appts.push({
        id: `appt-${padZero(id)}`,
        patientId: patients[patientIdx].id,
        patientName: `${patients[patientIdx].firstName} ${patients[patientIdx].lastName}`,
        providerId: providers[providerIdx].id,
        providerName: `Dr. ${providers[providerIdx].lastName}`,
        date: date.toISOString().split('T')[0],
        startTime: `${padZero(hour)}:${seededRandom(seed + 2) > 0.5 ? '30' : '00'}`,
        endTime: `${padZero(hour)}:${seededRandom(seed + 2) > 0.5 ? '59' : '30'}`,
        type: pick(types, seed + 3),
        status: isPast ? pick(['completed', 'completed', 'completed', 'no-show', 'cancelled'], seed + 4) as Appointment['status'] : pick(['scheduled', 'confirmed', 'scheduled'], seed + 4) as Appointment['status'],
        room: pick(rooms, seed + 5),
        notes: '',
        reason: pick(appointmentReasons, seed + 6),
      });
      id++;
    }
  }
  return appts;
}

export const appointments: Appointment[] = generateAppointments();

// Generate vitals for each patient (last 6 readings)
export const vitals: Vital[] = patients.flatMap((patient, pi) =>
  Array.from({ length: 6 }, (_, vi) => {
    const seed = (pi + 1) * 100 + vi;
    const date = new Date();
    date.setMonth(date.getMonth() - vi);
    return {
      id: `vital-${patient.id}-${vi}`,
      patientId: patient.id,
      date: date.toISOString().split('T')[0],
      bloodPressureSystolic: 110 + Math.floor(seededRandom(seed) * 40),
      bloodPressureDiastolic: 65 + Math.floor(seededRandom(seed + 1) * 25),
      heartRate: 60 + Math.floor(seededRandom(seed + 2) * 40),
      temperature: 97 + Math.round(seededRandom(seed + 3) * 30) / 10,
      respiratoryRate: 12 + Math.floor(seededRandom(seed + 4) * 8),
      oxygenSaturation: 94 + Math.floor(seededRandom(seed + 5) * 6),
      weight: 120 + Math.floor(seededRandom(seed + 6) * 100),
      height: 60 + Math.floor(seededRandom(seed + 7) * 16),
      recordedBy: `Dr. ${providers[pi % providers.length].lastName}`,
    };
  })
);

// Generate notes
export const notes: Note[] = patients.slice(0, 30).flatMap((patient, pi) =>
  Array.from({ length: 2 + Math.floor(seededRandom(pi * 67) * 3) }, (_, ni) => {
    const seed = (pi + 1) * 200 + ni;
    const date = new Date();
    date.setDate(date.getDate() - ni * 14 - Math.floor(seededRandom(seed) * 7));
    const types: Note['type'][] = ['progress', 'soap', 'procedure', 'discharge', 'referral'];
    const provIdx = pi % providers.length;
    return {
      id: `note-${patient.id}-${ni}`,
      patientId: patient.id,
      providerId: providers[provIdx].id,
      providerName: `Dr. ${providers[provIdx].lastName}`,
      date: date.toISOString().split('T')[0],
      type: pick(types, seed + 1),
      title: pick([
        'Follow-up Visit Note',
        'Annual Physical Examination',
        'Medication Adjustment',
        'Lab Results Discussion',
        'Referral to Specialist',
        'Post-Procedure Follow-up',
        'Chronic Disease Management',
        'Acute Visit Note',
      ], seed + 2),
      content: pick([
        'Patient presents for routine follow-up. Vitals stable. Blood pressure well controlled on current medication regimen. Continue current treatment plan. Follow up in 3 months.',
        'Comprehensive annual physical. All screening tests up to date. Discussed diet and exercise. Patient reports good compliance with medications. No new complaints.',
        'Patient reports increased fatigue and shortness of breath with exertion. Ordered CBC, BMP, and chest X-ray. Will review results at next visit. Adjusted medication dosage.',
        'Reviewed recent lab work. HbA1c improved from 8.2 to 7.4. Continue current diabetes management. Encouraged patient to maintain dietary modifications.',
        'Patient seen for chronic knee pain. Conservative management has been ineffective. Discussed options including physical therapy referral and possible orthopedic consultation.',
        'Post-surgical follow-up. Wound healing well. No signs of infection. Patient tolerating pain medication. Cleared for gradual return to normal activities.',
        'Blood pressure elevated at 158/92 despite current medication. Adding second antihypertensive. Diet counseling provided. Recheck in 2 weeks.',
        'Patient reports persistent cough for 3 weeks. No fever. Lungs clear on auscultation. Likely post-nasal drip. Started on nasal corticosteroid. Follow up if not improved in 2 weeks.',
      ], seed + 3),
      updatedAt: date.toISOString(),
    };
  })
);

// Generate notifications
export const notifications: Notification[] = [
  { id: 'notif-01', type: 'appointment', title: 'Appointment Reminder', message: 'James Smith has a check-up scheduled for today at 10:00 AM', read: false, createdAt: new Date().toISOString(), patientId: 'pat-01', appointmentId: 'appt-01' },
  { id: 'notif-02', type: 'patient-alert', title: 'Critical Lab Result', message: 'Mary Johnson\'s potassium level is critically high (6.2 mEq/L)', read: false, createdAt: new Date(Date.now() - 1800000).toISOString(), patientId: 'pat-02' },
  { id: 'notif-03', type: 'message', title: 'New Message', message: 'Dr. Park sent you a message regarding patient Robert Williams', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), patientId: 'pat-03' },
  { id: 'notif-04', type: 'appointment', title: 'Appointment Cancelled', message: 'Patricia Brown cancelled her 2:00 PM appointment', read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), patientId: 'pat-04' },
  { id: 'notif-05', type: 'system', title: 'System Update', message: 'CareHub will undergo maintenance tonight at 11 PM EST', read: true, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'notif-06', type: 'patient-alert', title: 'Missed Appointment', message: 'John Jones did not show up for his 9:00 AM appointment', read: true, createdAt: new Date(Date.now() - 21600000).toISOString(), patientId: 'pat-05' },
  { id: 'notif-07', type: 'appointment', title: 'New Appointment', message: 'New urgent appointment scheduled for Jennifer Garcia at 3:30 PM', read: true, createdAt: new Date(Date.now() - 28800000).toISOString(), patientId: 'pat-06' },
  { id: 'notif-08', type: 'message', title: 'Lab Report Ready', message: 'Lab results are ready for Michael Miller', read: true, createdAt: new Date(Date.now() - 43200000).toISOString(), patientId: 'pat-07' },
  { id: 'notif-09', type: 'patient-alert', title: 'High Blood Pressure Alert', message: 'Linda Davis recorded BP 178/105 at her last visit', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), patientId: 'pat-08' },
  { id: 'notif-10', type: 'appointment', title: 'Appointment Confirmed', message: 'David Rodriguez confirmed his appointment for tomorrow at 11 AM', read: true, createdAt: new Date(Date.now() - 100000000).toISOString(), patientId: 'pat-09' },
];
