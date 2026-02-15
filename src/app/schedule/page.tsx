'use client';

import { useState, useMemo, useCallback } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useProviders } from '@/hooks/useProviders';
import { Appointment } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

export default function SchedulePage() {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState<{ date: string; time: string } | null>(null);
  const [dragItem, setDragItem] = useState<Appointment | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: string; time: string } | null>(null);
  const [showConfirmDrop, setShowConfirmDrop] = useState(false);

  const { data: providers } = useProviders();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const { data: appointments, isLoading } = useAppointments({
    startDate: format(view === 'week' ? weekStart : currentDate, 'yyyy-MM-dd'),
    endDate: format(view === 'week' ? weekEnd : currentDate, 'yyyy-MM-dd'),
    providerId: selectedProvider || undefined,
  });

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const days = useMemo(() => {
    if (view === 'day') return [currentDate];
    return Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  }, [currentDate, view, weekStart]);

  const getAppointmentsForSlot = useCallback((date: Date, hour: number) => {
    if (!appointments) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter((a) => {
      const apptHour = parseInt(a.startTime.split(':')[0]);
      return a.date === dateStr && apptHour === hour;
    });
  }, [appointments]);

  const hasConflict = useCallback((date: string, startTime: string, excludeId?: string) => {
    if (!appointments) return false;
    const hour = parseInt(startTime.split(':')[0]);
    return appointments.some(
      (a) => a.id !== excludeId && a.date === date && parseInt(a.startTime.split(':')[0]) === hour
    );
  }, [appointments]);

  const handleDragStart = (appt: Appointment) => {
    setDragItem(appt);
  };

  const handleDrop = (date: string, time: string) => {
    if (!dragItem) return;
    setDropTarget({ date, time });
    setShowConfirmDrop(true);
  };

  const confirmDrop = () => {
    if (!dragItem || !dropTarget) return;
    const endHour = parseInt(dropTarget.time.split(':')[0]) + 1;
    updateAppointment.mutate(
      {
        id: dragItem.id,
        data: {
          date: dropTarget.date,
          startTime: dropTarget.time,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
        },
      },
      {
        onSuccess: () => {
          addToast('Appointment rescheduled', 'success');
          setShowConfirmDrop(false);
          setDragItem(null);
          setDropTarget(null);
        },
      }
    );
  };

  const handleCreateAppointment = (formData: Record<string, string>) => {
    createAppointment.mutate(
      {
        patientName: formData.patientName,
        reason: formData.reason,
        providerId: selectedProvider || 'prov-1',
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type as Appointment['type'],
        room: formData.room,
        status: 'scheduled',
      },
      {
        onSuccess: () => {
          addToast('Appointment created', 'success');
          setNewAppointmentSlot(null);
        },
      }
    );
  };

  const typeColor = (type: string) => {
    const map: Record<string, string> = {
      'check-up': 'border-l-blue-500 bg-blue-50',
      'follow-up': 'border-l-green-500 bg-green-50',
      urgent: 'border-l-red-500 bg-red-50',
      procedure: 'border-l-purple-500 bg-purple-50',
      consultation: 'border-l-amber-500 bg-amber-50',
      telehealth: 'border-l-cyan-500 bg-cyan-50',
    };
    return map[type] || 'border-l-gray-500 bg-gray-50';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            {view === 'week'
              ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              : format(currentDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">All Providers</option>
            {providers?.map((p) => (
              <option key={p.id} value={p.id}>Dr. {p.lastName}</option>
            ))}
          </select>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-2 text-sm ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(view === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              &#8249;
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(view === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        {/* Day headers */}
        <div className={`grid border-b border-[var(--color-border)]`} style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
          <div className="p-3 border-r border-gray-100" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${isToday(day) ? 'bg-blue-50' : ''}`}
            >
              <p className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</p>
              <p className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </p>
              {isToday(day) && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mx-auto mt-1" />}
            </div>
          ))}
        </div>

        {/* Time slots */}
        {isLoading ? (
          <div className="p-8">
            <Skeleton height={400} className="w-full" />
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid border-b border-gray-50"
                style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
              >
                <div className="p-2 text-xs text-gray-400 text-right pr-3 border-r border-gray-100">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const slotAppts = getAppointmentsForSlot(day, hour);
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                  return (
                    <div
                      key={`${dateStr}-${hour}`}
                      className={`min-h-[60px] p-1 border-r border-gray-100 last:border-r-0 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isToday(day) ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => {
                        if (slotAppts.length === 0) {
                          setNewAppointmentSlot({ date: dateStr, time: timeStr });
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-blue-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-blue-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-blue-100');
                        handleDrop(dateStr, timeStr);
                      }}
                    >
                      {slotAppts.map((appt) => {
                        const conflict = slotAppts.length > 1;
                        return (
                          <div
                            key={appt.id}
                            draggable
                            onDragStart={() => handleDragStart(appt)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appt);
                            }}
                            className={`px-2 py-1 rounded text-xs border-l-2 mb-1 cursor-grab active:cursor-grabbing ${typeColor(appt.type)} ${
                              conflict ? 'ring-2 ring-amber-400' : ''
                            }`}
                          >
                            <p className="font-medium truncate">{appt.patientName}</p>
                            <p className="text-gray-500 truncate">{appt.startTime} - {appt.reason}</p>
                            {conflict && <span className="text-amber-600 font-medium">Conflict</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Detail Side Panel */}
      {selectedAppointment && (
        <AppointmentDetailPanel
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onDelete={(id) => {
            deleteAppointment.mutate(id, {
              onSuccess: () => {
                addToast('Appointment deleted', 'success');
                setSelectedAppointment(null);
              },
            });
          }}
        />
      )}

      {/* Create Appointment Modal */}
      {newAppointmentSlot && (
        <NewAppointmentModal
          date={newAppointmentSlot.date}
          time={newAppointmentSlot.time}
          onClose={() => setNewAppointmentSlot(null)}
          onSubmit={handleCreateAppointment}
          isPending={createAppointment.isPending}
        />
      )}

      {/* Confirm Drag Drop Modal */}
      <Modal isOpen={showConfirmDrop} onClose={() => { setShowConfirmDrop(false); setDragItem(null); }} title="Reschedule Appointment" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Move <strong>{dragItem?.patientName}</strong>&apos;s appointment to{' '}
          <strong>{dropTarget?.date}</strong> at <strong>{dropTarget?.time}</strong>?
        </p>
        {dropTarget && hasConflict(dropTarget.date, dropTarget.time, dragItem?.id) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-700">
            Warning: There is a scheduling conflict at this time slot.
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowConfirmDrop(false); setDragItem(null); }} className="px-4 py-2 text-sm text-gray-600">
            Cancel
          </button>
          <button onClick={confirmDrop} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}

function AppointmentDetailPanel({ appointment, onClose, onDelete }: {
  appointment: Appointment;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-[var(--color-border)] z-50 slide-in overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Patient</p>
            <p className="font-medium">{appointment.patientName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Date &amp; Time</p>
            <p className="font-medium">{appointment.date}</p>
            <p className="text-sm text-gray-600">{appointment.startTime} - {appointment.endTime}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Provider</p>
            <p className="font-medium">{appointment.providerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Type</p>
            <Badge variant="primary">{appointment.type}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Status</p>
            <Badge variant={appointment.status === 'confirmed' ? 'success' : appointment.status === 'cancelled' ? 'danger' : 'default'}>
              {appointment.status}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Room</p>
            <p className="font-medium">{appointment.room}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Reason</p>
            <p className="text-sm text-gray-700">{appointment.reason}</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => onDelete(appointment.id)}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

function NewAppointmentModal({ date, time, onClose, onSubmit, isPending }: {
  date: string;
  time: string;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    patientName: '',
    reason: '',
    type: 'check-up',
    room: 'Room 101',
    startTime: time,
    endTime: `${(parseInt(time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
    date,
  });

  return (
    <Modal isOpen={true} onClose={onClose} title="New Appointment">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
          <input
            type="text"
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="check-up">Check-up</option>
              <option value="follow-up">Follow-up</option>
              <option value="urgent">Urgent</option>
              <option value="procedure">Procedure</option>
              <option value="consultation">Consultation</option>
              <option value="telehealth">Telehealth</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105', 'Room 201', 'Room 202', 'Room 203', 'Telehealth'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
