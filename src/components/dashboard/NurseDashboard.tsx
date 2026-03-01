"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DonutChart, DashboardSection } from "./DashboardCharts";
import RecentPatients, { PatientRecord } from "@/components/patients/recent-patients";
import NewPatientForm from "@/components/patients/new-patient-form";

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  const isPositive = subtitle.startsWith("+");
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          <p className={`text-xs mt-1 ${isPositive ? "text-emerald-600" : "text-slate-500"}`}>
            {subtitle}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function GenderLineChart() {
  const points = [0, 20, 45, 60, 55, 70, 75];
  const pointsMale = [100, 85, 60, 45, 40, 35, 25];
  const w = 240;
  const h = 120;
  const pad = 8;
  const max = 100;
  const toX = (i: number) => pad + (i / (points.length - 1)) * (w - pad * 2);
  const toY = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const femalePath = points.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const malePath = pointsMale.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 max-w-[280px]" preserveAspectRatio="xMidYMid meet">
        <path d={femalePath} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={malePath} fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-[#a78bfa]" />
          <span className="text-slate-600">75% Females Patients (25y)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 rounded bg-[#fb923c]" />
          <span className="text-slate-600">25% Males Patients (40y)</span>
        </span>
      </div>
    </div>
  );
}

const NOTIFICATIONS = [
  { id: "1", text: "You have some invoices to pay this month" },
  { id: "2", text: "Ahmed Mohamed Canceled his appointment today" },
  { id: "3", text: "You Added Samah successfully to assistant's List" },
];

const AGE_DISTRIBUTION = [
  { label: "+65", value: 22, color: "#a78bfa" },
  { label: "25-35", value: 35, color: "#f87171" },
  { label: "18-25", value: 28, color: "#2dd4bf" },
  { label: "1-18", value: 15, color: "#fb923c" },
];

const UPCOMING_APPOINTMENTS = [
  { id: "1", time: "12:20 PM", patientName: "Patient Ahmed", doctorName: "Dr. Nazar Becks" },
  { id: "2", time: "12:40 PM", patientName: "Sarah Ali", doctorName: "Dr. Sarah Wilson" },
  { id: "3", time: "01:00 PM", patientName: "Omar Hassan", doctorName: "Dr. Nazar Becks" },
  { id: "4", time: "07:40 PM", patientName: "Layla Mohamed", doctorName: "Dr. John Darwin" },
];

const UPCOMING_STATS = { today: 4, thisWeek: 18 };

export default function NurseDashboard() {
  const router = useRouter();
  const totalAge = AGE_DISTRIBUTION.reduce((s, x) => s + x.value, 0);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [pendingEncId, setPendingEncId] = useState<string | null>(null);
  const [formInitialData, setFormInitialData] = useState<Partial<PatientRecord>>({});

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        if (data.patients?.length) setPatients(data.patients);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col lg:flex-row flex-wrap gap-6 lg:gap-8">
      <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Nurse Dashboard</h1>
          <Link href="/dashboard/triage" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Record vitals →
          </Link>
        </div>

        {/* Top row - Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Clinic Visits"
            value="1000"
            subtitle="+20% vs last month"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

      {/* Action cards below Recent Patients */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col">
          <h3 className="font-semibold text-slate-800">Write Prescription and get discount</h3>
          <p className="text-sm text-slate-500 mt-1">Create prescriptions for patients and benefit from partner discounts.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/dashboard/recipe" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              More info
            </Link>
            <Link
              href="/dashboard/pharmacy/prescriptions"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Prescription
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col">
          <h3 className="font-semibold text-slate-800">Invite your Assistants now</h3>
          <p className="text-sm text-slate-500 mt-1">Add assistants to help manage appointments and patient flow.</p>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Add Assistant
            </button>
          </div>
        </div>
      </div>
              </svg>
            }
          />
          <SummaryCard
            title="Video Consultation"
            value="200"
            subtitle="+14% vs last month"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
          />
          <SummaryCard
            title="Income"
            value="20.000k"
            subtitle="This month"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
        />
      </div>

        {/* Notifications */}
        <DashboardSection
          title="Notifications"
          action={
            <Link href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              See All
            </Link>
          }
        >
          <ul className="space-y-2">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id}>
                <Link href="#" className="flex items-center justify-between gap-2 py-2 text-sm text-slate-700 hover:text-slate-900 group">
                  <span className="flex-1 min-w-0">{n.text}</span>
                  <span className="shrink-0 text-slate-400 group-hover:text-blue-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardSection>

        {/* Patient Gender & Age Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardSection title="Patient Gender Distribution">
            <GenderLineChart />
          </DashboardSection>
          <DashboardSection title="Patient Age Distribution">
            <DonutChart total={totalAge} segments={AGE_DISTRIBUTION} size={140} stroke={20} />
        </DashboardSection>
      </div>

        

        
      </div>

      {/* Right panel - Upcoming Appointments */}
      <aside className="w-full lg:w-80 shrink-0">
        <div className="lg:sticky lg:top-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              See All
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{UPCOMING_STATS.today}</p>
                <p className="text-xs font-medium text-slate-500">Today</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-slate-800 tabular-nums">{UPCOMING_STATS.thisWeek}</p>
                <p className="text-xs font-medium text-slate-500">This week</p>
              </div>
            </div>
            <div>
              <label htmlFor="nurse-clinic" className="block text-xs font-medium text-slate-500 mb-1">
                Clinic
              </label>
              <select
                id="nurse-clinic"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Maadi Clinic</option>
                <option>Main Branch</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Slots · Doctor attending</p>
              <ul className="space-y-2">
                {UPCOMING_APPOINTMENTS.map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-start justify-between gap-2 py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 tabular-nums">{apt.time}</p>
                      <p className="text-sm font-medium text-slate-700 truncate">{apt.patientName}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5 truncate">{apt.doctorName}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                        aria-label="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard/appointments"
              className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </Link>
          </div>
        </div>
      </aside>
      {/* Recent Patients (full-width row below aside) */}
      <div className="w-full">
        <RecentPatients
          patients={patients}
          allowCreate={true}
          onAddPatient={() => {
            setEditingPatientId(null);
            setPendingEncId(`MUL-OPD-${Math.floor(Math.random() * 90000) + 10000}`);
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

      {showNewPatientForm && (
        <NewPatientForm
          editingPatientId={editingPatientId}
          pendingEncId={pendingEncId}
          initialData={formInitialData}
          onSave={async (patientData) => {
            try {
              if (editingPatientId) {
                await fetch("/api/patients", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patient: patientData }) });
                setPatients((prev) => prev.map((p) => (p.id === editingPatientId ? patientData : p)));
              } else {
                await fetch("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patient: patientData }) });
                setPatients((prev) => [...prev, patientData]);
              }
            } catch (err) {
              console.error("Failed to save patient:", err);
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
