"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecentPatients, { PatientRecord } from "@/components/patients/recent-patients";
import NewPatientForm from "@/components/patients/new-patient-form";
import { getStoredPatients, setStoredPatients } from "@/helpers/local-storage";

interface Statistic {
  label: string;
  value: number;
  icon: string;
}

interface ScheduleItem {
  id: string;
  day: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  disease: string;
  date: string;
  time: string;
  doctorName: string;
  department: string;
}

interface Notification {
  id: string;
  patientName: string;
  message: string;
  date: string;
  time: string;
}

interface NewPatient {
  id: string;
  patientName: string;
  patientId: string | null;
  arrivalSource: string;
  arrivedAt: string;
  status: string;
}

interface PatientClerking {
  phase: string;
  triggerDescription: string;
  arrivalSources: { id: string; label: string; description: string }[];
  formFields: { id: string; label: string; type: string; required?: boolean; options?: string[] }[];
  clerkingRecords: {
    id: string;
    patientName: string;
    patientId: string | null;
    arrivalSource: string;
    dateOfArrival: string;
    timeOfArrival: string;
    status: string;
  }[];
}

interface ReceptionistData {
  statistics: Statistic[];
  schedule: ScheduleItem[];
  upcomingAppointments: Appointment[];
  newPatients?: NewPatient[];
  notifications: Notification[];
  activityPercent: number;
  patientClerking?: PatientClerking;
}

const FALLBACK: ReceptionistData = {
  statistics: [
    { label: "Expected Appointments", value: 24, icon: "appointments" },
    { label: "New Patients", value: 5, icon: "newPatients" },
    { label: "Pending Clerking", value: 3, icon: "pendingClerking" },
    { label: "Checked-in Today", value: 12, icon: "checkedIn" },
  ],
  schedule: [
    { id: "s1", day: "Mon", title: "Monitoring", start: "08:00", end: "10:00", color: "blue" },
    { id: "s2", day: "Mon", title: "Appointment", start: "10:00", end: "12:00", color: "pink" },
    { id: "s3", day: "Tue", title: "Meeting", start: "08:00", end: "09:00", color: "gray" },
    { id: "s4", day: "Tue", title: "Appointment", start: "09:00", end: "11:00", color: "gray" },
    { id: "s5", day: "Wed", title: "Appointment", start: "10:00", end: "12:00", color: "gray" },
  ],
  upcomingAppointments: [
    { id: "1", patientName: "Alex Smith", patientId: "P001", disease: "Hypertension", date: "2025-03-05", time: "10:00", doctorName: "Dr. Nazar Becks", department: "General Physician" },
    { id: "2", patientName: "Sarah Jones", patientId: "P002", disease: "Diabetes", date: "2025-03-06", time: "09:00", doctorName: "Dr. Alex Hales", department: "General Physician" },
    { id: "3", patientName: "Samuel Dutton", patientId: "P003", disease: "Asthma", date: "2025-03-07", time: "10:00", doctorName: "Dr. John Darwin", department: "Radiologist & ECG" },
    { id: "4", patientName: "Carolina Gilson", patientId: "P004", disease: "Allergy", date: "2025-03-10", time: "11:30", doctorName: "Dr. Nazar Becks", department: "Gynecologist" },
  ],
  newPatients: [
    { id: "np-1", patientName: "James Okello", patientId: "OPD-2025-001", arrivalSource: "OPD", arrivedAt: "2025-02-26T08:15", status: "Pending assessment" },
    { id: "np-2", patientName: "Mary Akinyi", patientId: "EM-2025-012", arrivalSource: "Emergency Department", arrivedAt: "2025-02-26T07:30", status: "Assessed" },
    { id: "np-3", patientName: "Peter Ochieng", patientId: "EL-2025-003", arrivalSource: "Elective Admission", arrivedAt: "2025-02-26T06:00", status: "Admitted" },
  ],
  notifications: [
    { patientName: "Tom Curtis", message: "made an appointment", date: "2025-02-16", time: "12:00", id: "n1" },
    { patientName: "Betty Jackson", message: "made an appointment", date: "2025-02-15", time: "10:00", id: "n2" },
  ],
  activityPercent: 80,
};

const HOURS = [8, 9, 10, 11, 12, 13, 14];
const DAYS = ["Mon", "Tue", "Wed"];

function timeToPosition(start: string, end: string) {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const startFrac = sH - 8 + sM / 60;
  const endFrac = eH - 8 + eM / 60;
  const left = (startFrac / 6) * 100;
  const width = ((endFrac - startFrac) / 6) * 100;
  return { left: `${left}%`, width: `${width}%` };
}

function formatAppointmentDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, ".");
}

function generateEncId(): string {
  return `MUL-OPD-${Math.floor(Math.random() * 90000) + 10000}`;
}

export default function ReceptionistDashboard() {
  const router = useRouter();
  const [data, setData] = useState<ReceptionistData | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [pendingEncId, setPendingEncId] = useState<string | null>(null);
  const [formInitialData, setFormInitialData] = useState<Partial<PatientRecord>>({});

  useEffect(() => {
    fetch("/api/receptionist/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));

    const stored = getStoredPatients();
    if (stored.length > 0) {
      setPatients(stored as PatientRecord[]);
    } else {
      fetch("/api/patients")
        .then((r) => r.json())
        .then((data) => {
          const list = (data.patients ?? []) as PatientRecord[];
          if (list.length) {
            setStoredPatients(list);
            setPatients(list);
          }
        })
        .catch(() => {});
    }
  }, []);

  const d = data ?? FALLBACK;
  const { statistics, schedule, upcomingAppointments, newPatients = [], notifications, activityPercent, patientClerking } = d;
  const clerkingRecords = patientClerking?.clerkingRecords ?? newPatients.map((p) => ({
    id: p.id,
    patientName: p.patientName,
    patientId: p.patientId,
    arrivalSource: p.arrivalSource,
    dateOfArrival: p.arrivedAt.slice(0, 10),
    timeOfArrival: p.arrivedAt.slice(11, 16),
    status: p.status,
  }));

  const calendarDays = (() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let i = 1; i <= last.getDate(); i++) days.push(i);
    return days;
  })();
  const today = new Date();
  const isCurrentMonth = calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear();
  const todayDate = today.getDate();

  const upcomingStats = (() => {
    const todayStr = today.toISOString().slice(0, 10);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const todayCount = upcomingAppointments.filter((a) => a.date === todayStr).length;
    const thisWeekCount = upcomingAppointments.filter((a) => {
      const d = new Date(a.date);
      return d >= today && d < weekEnd;
    }).length;
    return { today: todayCount, thisWeek: thisWeekCount };
  })();

  return (
    <div className="space-y-6">
      <div>
        <div className="space-y-6">
          {/* Statistic */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Statistic</h2>
              <button type="button" className="p-1 text-slate-400 hover:text-slate-600">⋯</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statistics.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-slate-50">
                  <div className="flex justify-center mb-1">
                    {stat.icon === "appointments" && (
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                    {stat.icon === "newPatients" && (
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    )}
                    {stat.icon === "pendingClerking" && (
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    )}
                    {stat.icon === "checkedIn" && (
                      <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <p className="text-2xl font-semibold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
              <button type="button" className="p-1 text-slate-400 hover:text-slate-600">⋯</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{upcomingStats.today}</p>
                <p className="text-xs font-medium text-slate-500">Today</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{upcomingStats.thisWeek}</p>
                <p className="text-xs font-medium text-slate-500">This week</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{upcomingAppointments.length}</p>
                <p className="text-xs font-medium text-slate-500">Total upcoming</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Disease</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3 pr-4">Doctor</th>
                    <th className="pb-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm shrink-0">
                            {apt.patientName.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{apt.patientName}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{apt.disease}</td>
                      <td className="py-3 pr-4 text-slate-600">{formatAppointmentDate(apt.date)}</td>
                      <td className="py-3 pr-4 text-slate-600">{apt.time}</td>
                      <td className="py-3 pr-4">
                        <span className="font-medium text-slate-800">{apt.doctorName}</span>
                        {apt.department && (
                          <span className="block text-xs text-slate-500">{apt.department}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                          Details <span className="text-blue-500">›</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Patients */}
          <RecentPatients
            patients={patients}
            allowCreate={true}
            onAddPatient={() => {
              setEditingPatientId(null);
              setPendingEncId(generateEncId());
              setFormInitialData({});
              setShowNewPatientForm(true);
            }}
            onEditPatient={(p) => {
              setEditingPatientId(p.id);
              setPendingEncId(p.uhid);
              setFormInitialData(p);
              setShowNewPatientForm(true);
            }}
            onViewPatient={(p) => router.push(`/dashboard/medical-clerking?view=${p.id}`)}
          />
        </div>
      </div>
      {showNewPatientForm && (
        <NewPatientForm
          editingPatientId={editingPatientId}
          pendingEncId={pendingEncId}
          initialData={formInitialData}
          onSave={(patientData) => {
            if (editingPatientId) {
              const next = patients.map((p) => (p.id === editingPatientId ? patientData : p));
              setStoredPatients(next);
              setPatients(next);
            } else {
              const next = [...patients, patientData];
              setStoredPatients(next);
              setPatients(next);
            }
            setShowNewPatientForm(false);
            setEditingPatientId(null);
            setPendingEncId(null);
          }}
          onClose={() => { setShowNewPatientForm(false); setEditingPatientId(null); }}
        />
      )}
    </div>
  );
}
