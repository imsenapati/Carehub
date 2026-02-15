'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { usePatient, useUpdatePatient, usePatientAppointments, usePatientVitals, usePatientNotes, useCreateNote } from '@/hooks/usePatients';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Patient, Note } from '@/types';
import Link from 'next/link';

const tabs = ['overview', 'appointments', 'vitals', 'notes'] as const;
type Tab = typeof tabs[number];

function PatientDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const activeTab = (searchParams.get('tab') as Tab) || 'overview';
  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/patients/${id}?${params.toString()}`);
  };

  const { data: patient, isLoading, isError } = usePatient(id);
  const [editModalOpen, setEditModalOpen] = useState(false);

  if (isLoading) return <PatientDetailSkeleton />;
  if (isError || !patient) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium mb-2">Patient not found</p>
        <Link href="/patients" className="text-blue-600 hover:text-blue-700 text-sm">Back to patients</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/patients" className="hover:text-blue-600">Patients</Link>
        <span>/</span>
        <span className="text-gray-900">{patient.firstName} {patient.lastName}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">MRN: {patient.mrn}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">DOB: {patient.dateOfBirth}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500 capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={patient.status === 'active' ? 'success' : patient.status === 'deceased' ? 'danger' : 'default'}>
                  {patient.status}
                </Badge>
                <Badge variant={
                  patient.riskLevel === 'low' ? 'success' :
                  patient.riskLevel === 'medium' ? 'warning' :
                  patient.riskLevel === 'high' ? 'danger' : 'purple'
                }>
                  {patient.riskLevel} risk
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <InfoItem label="Phone" value={patient.phone} />
          <InfoItem label="Email" value={patient.email} />
          <InfoItem label="Insurance" value={patient.insuranceProvider} />
          <InfoItem label="Address" value={`${patient.address.city}, ${patient.address.state}`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[var(--color-border)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <ErrorBoundary>
        {activeTab === 'overview' && <OverviewTab patientId={id} patient={patient} />}
        {activeTab === 'appointments' && <AppointmentsTab patientId={id} />}
        {activeTab === 'vitals' && <VitalsTab patientId={id} />}
        {activeTab === 'notes' && <NotesTab patientId={id} />}
      </ErrorBoundary>

      {/* Edit Modal */}
      <EditPatientModal
        patient={patient}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false);
          addToast('Patient updated successfully', 'success');
        }}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function OverviewTab({ patientId, patient }: { patientId: string; patient: Patient }) {
  const { data: appointments } = usePatientAppointments(patientId);
  const { data: vitals } = usePatientVitals(patientId);
  const { data: notesData } = usePatientNotes(patientId);

  const now = new Date();
  const upcoming = appointments?.filter((a) => new Date(a.date) >= now) || [];
  const lastVisit = appointments?.filter((a) => a.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestVital = vitals?.[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard title="Last Visit" value={lastVisit ? lastVisit.date : 'No visits'} subtitle={lastVisit?.reason} />
      <SummaryCard title="Next Appointment" value={upcoming.length > 0 ? upcoming[0].date : 'None scheduled'} subtitle={upcoming[0]?.reason} />
      <SummaryCard title="Conditions" value={`${patient.conditions.length} active`} subtitle={patient.conditions.slice(0, 2).join(', ')} />
      <SummaryCard title="Recent Notes" value={`${notesData?.length || 0} notes`} subtitle={notesData?.[0]?.title} />

      {latestVital && (
        <>
          <div className="md:col-span-2 lg:col-span-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Latest Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <VitalCard label="Blood Pressure" value={`${latestVital.bloodPressureSystolic}/${latestVital.bloodPressureDiastolic}`} unit="mmHg" />
              <VitalCard label="Heart Rate" value={`${latestVital.heartRate}`} unit="bpm" />
              <VitalCard label="Temperature" value={`${latestVital.temperature}`} unit="°F" />
              <VitalCard label="O2 Saturation" value={`${latestVital.oxygenSaturation}`} unit="%" />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.length === 0 ? (
                <span className="text-sm text-gray-500">No known allergies</span>
              ) : (
                patient.allergies.map((a) => <Badge key={a} variant="danger">{a}</Badge>)
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
    </div>
  );
}

function VitalCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></p>
    </div>
  );
}

function AppointmentsTab({ patientId }: { patientId: string }) {
  const { data: appointments, isLoading } = usePatientAppointments(patientId);

  if (isLoading) return <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>;

  const now = new Date();
  const upcoming = appointments?.filter((a) => new Date(a.date) >= now && a.status !== 'cancelled') || [];
  const past = appointments?.filter((a) => new Date(a.date) < now || a.status === 'cancelled') || [];

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      'no-show': 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-purple-100 text-purple-700',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming appointments</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((appt) => (
              <div key={appt.id} className="bg-white rounded-lg border border-[var(--color-border)] p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-700">{appt.date.split('-')[2]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{appt.reason}</p>
                  <p className="text-xs text-gray-500">{appt.date} at {appt.startTime} - {appt.endTime} | {appt.room}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(appt.status)}`}>{appt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Past ({past.length})</h3>
        <div className="space-y-2">
          {past.map((appt) => (
            <div key={appt.id} className="bg-white rounded-lg border border-[var(--color-border)] p-4 flex items-center gap-4 opacity-75">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-500">{appt.date.split('-')[2]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{appt.reason}</p>
                <p className="text-xs text-gray-500">{appt.date} at {appt.startTime} | {appt.providerName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(appt.status)}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VitalsTab({ patientId }: { patientId: string }) {
  const { data: vitals, isLoading, isError, error } = usePatientVitals(patientId);

  if (isLoading) return <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>;
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium mb-2">Failed to load vitals</p>
        <p className="text-red-500 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (!vitals || vitals.length === 0) return <p className="text-gray-500">No vitals recorded.</p>;

  return (
    <div>
      {/* Chart-like display using bars */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Blood Pressure Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {vitals.slice().reverse().map((v) => {
            const sysPercent = ((v.bloodPressureSystolic - 80) / 100) * 100;
            const diaPercent = ((v.bloodPressureDiastolic - 40) / 80) * 100;
            return (
              <div key={v.id} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end justify-center" style={{ height: '120px' }}>
                  <div className="w-3 bg-blue-500 rounded-t" style={{ height: `${Math.max(sysPercent, 10)}%` }} title={`Sys: ${v.bloodPressureSystolic}`} />
                  <div className="w-3 bg-blue-300 rounded-t" style={{ height: `${Math.max(diaPercent, 10)}%` }} title={`Dia: ${v.bloodPressureDiastolic}`} />
                </div>
                <p className="text-xs text-gray-500">{v.date.slice(5)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /> Systolic</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded" /> Diastolic</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">BP</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">HR</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Temp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">RR</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SpO2</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Weight</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((v) => (
              <tr key={v.id} className="border-b border-gray-50">
                <td className="px-4 py-3 text-sm">{v.date}</td>
                <td className="px-4 py-3 text-sm font-medium">{v.bloodPressureSystolic}/{v.bloodPressureDiastolic}</td>
                <td className="px-4 py-3 text-sm">{v.heartRate} bpm</td>
                <td className="px-4 py-3 text-sm">{v.temperature}°F</td>
                <td className="px-4 py-3 text-sm">{v.respiratoryRate}</td>
                <td className="px-4 py-3 text-sm">{v.oxygenSaturation}%</td>
                <td className="px-4 py-3 text-sm">{v.weight} lbs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotesTab({ patientId }: { patientId: string }) {
  const { data: notesData, isLoading } = usePatientNotes(patientId);
  const createNote = useCreateNote();
  const { addToast } = useToast();
  const [showNewNote, setShowNewNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<Note['type']>('progress');

  if (isLoading) return <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>;

  const handleSubmit = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    createNote.mutate(
      { patientId, data: { title: noteTitle, content: noteContent, type: noteType } },
      {
        onSuccess: () => {
          setShowNewNote(false);
          setNoteTitle('');
          setNoteContent('');
          addToast('Note added successfully', 'success');
        },
        onError: () => {
          addToast('Failed to add note', 'error');
        },
      }
    );
  };

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      progress: 'bg-blue-100 text-blue-700',
      soap: 'bg-green-100 text-green-700',
      procedure: 'bg-purple-100 text-purple-700',
      discharge: 'bg-gray-100 text-gray-700',
      referral: 'bg-amber-100 text-amber-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notes ({notesData?.length || 0})</h3>
        <button
          onClick={() => setShowNewNote(!showNewNote)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          {showNewNote ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {showNewNote && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 mb-4">
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as Note['type'])}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="progress">Progress</option>
              <option value="soap">SOAP</option>
              <option value="procedure">Procedure</option>
              <option value="discharge">Discharge</option>
              <option value="referral">Referral</option>
            </select>
          </div>
          <textarea
            placeholder="Write your note here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={createNote.isPending || !noteTitle.trim() || !noteContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createNote.isPending ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notesData?.map((note) => (
          <div key={note.id} className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm">{note.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{note.providerName} &middot; {note.date}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(note.type)}`}>
                {note.type}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditPatientModal({ patient, isOpen, onClose, onSuccess }: {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const updatePatient = useUpdatePatient();
  const [form, setForm] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    status: patient.status,
    riskLevel: patient.riskLevel,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient.mutate(
      { id: patient.id, data: form },
      { onSuccess }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Patient['status'] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
            <select
              value={form.riskLevel}
              onChange={(e) => setForm({ ...form, riskLevel: e.target.value as Patient['riskLevel'] })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            type="submit"
            disabled={updatePatient.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PatientDetailSkeleton() {
  return (
    <div>
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 mb-6">
        <div className="flex items-center gap-4">
          <Skeleton width={64} height={64} rounded />
          <div>
            <Skeleton width={200} height={24} className="mb-2" />
            <Skeleton width={300} height={16} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  return (
    <Suspense fallback={<PatientDetailSkeleton />}>
      <PatientDetailContent />
    </Suspense>
  );
}
