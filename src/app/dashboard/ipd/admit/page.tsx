"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getStoredAuth,
  getStoredPatients,
  getStoredIpdAdmissions,
  setStoredIpdAdmissions,
  type IpdAdmission,
} from "@/helpers/local-storage";
import { v4 as uuidv4 } from "uuid";

const WARDS = [
  "General Ward",
  "Female Ward",
  "Male Ward",
  "Paediatric Ward",
  "Maternity Ward",
  "Surgical Ward",
  "ICU",
  "HDU",
  "Isolation Ward",
  "Private Ward",
];

interface PatientRecord {
  id: string;
  uhid: string;
  name: string;
  gender?: string;
  age?: number;
  phone?: string;
}

function AdmitIpdContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");

  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [showPatientDrop, setShowPatientDrop] = useState(false);

  // Form fields
  const [ward, setWard] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [admittingDoctor, setAdmittingDoctor] = useState("");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [admissionTime, setAdmissionTime] = useState(
    new Date().toTimeString().slice(0, 5),
  );
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuth({ role: a.role, name: a.name });

    const all = getStoredPatients() as PatientRecord[];
    setPatients(all);

    if (patientIdParam) {
      const found = all.find((p) => p.id === patientIdParam);
      if (found) {
        setPatient(found);
        setPatientQuery(found.name);
      }
    }
  }, [router, patientIdParam]);

  const patientSuggestions = patientQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
          p.uhid.toLowerCase().includes(patientQuery.toLowerCase()),
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!patient) return setError("Please select a patient.");
    if (!ward) return setError("Ward is required.");
    if (!bedNumber.trim()) return setError("Bed number is required.");
    if (!admittingDoctor.trim()) return setError("Admitting doctor is required.");
    if (!admissionDate) return setError("Admission date is required.");
    if (!admissionTime) return setError("Admission time is required.");
    if (!diagnosis.trim()) return setError("Diagnosis / reason for admission is required.");

    setSaving(true);
    try {
      const admission: IpdAdmission = {
        id: uuidv4(),
        patientId: patient.id,
        patientName: patient.name,
        patientUhid: patient.uhid,
        patientGender: patient.gender ?? null,
        patientAge: patient.age ?? null,
        patientPhone: patient.phone ?? null,
        ward,
        bedNumber: bedNumber.trim(),
        admittingDoctor: admittingDoctor.trim(),
        admissionDate,
        admissionTime,
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || null,
        status: "admitted",
        dischargeDate: null,
        admittedBy: auth!.name,
        createdAt: new Date().toISOString(),
      };

      const existing = getStoredIpdAdmissions();
      setStoredIpdAdmissions([admission, ...existing]);
      setSuccess(true);

      setTimeout(() => router.push("/dashboard/ipd"), 1200);
    } finally {
      setSaving(false);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Admit Patient — IPD</h1>
          <p className="text-sm text-slate-500 mt-1">Complete the form to admit a patient to the inpatient department.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Patient
            </h2>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Search patient <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Search by name or UHID…"
                value={patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value);
                  setPatient(null);
                  setShowPatientDrop(true);
                }}
                onFocus={() => setShowPatientDrop(true)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {showPatientDrop && patientSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {patientSuggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPatient(p);
                        setPatientQuery(p.name);
                        setShowPatientDrop(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{p.name}</span>
                      <span className="text-slate-400 ml-2 text-xs">{p.uhid}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {patient && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{patient.name}</p>
                  <p className="text-xs text-emerald-600">
                    {patient.uhid}
                    {patient.gender ? ` · ${patient.gender}` : ""}
                    {patient.age ? ` · ${patient.age}y` : ""}
                    {patient.phone ? ` · ${patient.phone}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPatient(null);
                    setPatientQuery("");
                  }}
                  className="text-emerald-400 hover:text-emerald-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Admission details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Admission Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ward <span className="text-red-500">*</span>
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select ward…</option>
                  {WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bed Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B-12"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Admission Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Admission Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={admissionTime}
                  onChange={(e) => setAdmissionTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admitting Doctor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name of admitting doctor"
                value={admittingDoctor}
                onChange={(e) => setAdmittingDoctor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Diagnosis / Reason for Admission <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Primary diagnosis or reason for admission…"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                placeholder="Any additional notes (optional)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Patient admitted successfully. Redirecting to IPD…
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Admitting…
                </>
              ) : (
                "Admit Patient"
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function AdmitIpdPage() {
  return (
    <Suspense fallback={null}>
      <AdmitIpdContent />
    </Suspense>
  );
}
