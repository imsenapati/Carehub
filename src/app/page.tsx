'use client';

import Link from 'next/link';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useNotifications } from '@/hooks/useNotifications';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ page: 1, limit: 5, status: 'active' });
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments({ startDate: today, endDate: today });
  const { data: notifications } = useNotifications();

  const todayAppointments = appointments?.length || 0;
  const unreadNotifications = notifications?.filter((n) => !n.read).length || 0;
  const totalPatients = patientsData?.pagination.total || 0;

  const isLoading = patientsLoading || appointmentsLoading;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. Chen</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your overview for today</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Today's Appointments"
            value={todayAppointments}
            subtitle="scheduled for today"
            color="blue"
            href="/schedule"
          />
          <DashboardCard
            title="Active Patients"
            value={totalPatients}
            subtitle="in your panel"
            color="green"
            href="/patients"
          />
          <DashboardCard
            title="Unread Notifications"
            value={unreadNotifications}
            subtitle="require attention"
            color="amber"
          />
          <DashboardCard
            title="Critical Alerts"
            value={notifications?.filter((n) => n.type === 'patient-alert' && !n.read).length || 0}
            subtitle="patient alerts"
            color="red"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          {appointments?.slice(0, 5).map((appt) => (
            <div key={appt.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs">
                {appt.patientName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{appt.patientName}</p>
                <p className="text-xs text-gray-500">{appt.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{appt.startTime}</p>
                <p className="text-xs text-gray-500">{appt.room}</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-sm py-4 text-center">No appointments today</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Patients</h2>
            <Link href="/patients" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          {patientsData?.data.slice(0, 5).map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-xs">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                <p className="text-xs text-gray-500">MRN: {patient.mrn}</p>
              </div>
              <RiskBadge level={patient.riskLevel} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, subtitle, color, href }: {
  title: string;
  value: number;
  subtitle: string;
  color: 'blue' | 'green' | 'amber' | 'red';
  href?: string;
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  const content = (
    <div className={`rounded-xl border border-[var(--color-border)] p-6 bg-white ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="mt-2">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[level] || styles.low}`}>
      {level}
    </span>
  );
}
