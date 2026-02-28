"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";

interface PatientRecord {
  id: string;
  uhid: string;
  phone: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  nextOfKin: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  countryCode?: string | null;
  district?: string | null;
  arrivalSource?: "OPD" | "Emergency Department" | "Elective Admission";
  email?: string;
  insuranceType: "self-pay" | "insurance";
  insurancePolicy?: string;
}

export default function OPDPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">Loading…</div>}>
      <OPDPageContent />
    </Suspense>
  );
}

const OPD_STEPS = ["Triage", "Consult", "Lab Order", "Results", "Meds", "Follow-up"] as const;
type OPDStep = (typeof OPD_STEPS)[number];

const TRIAGE_CATEGORIES = ["Green", "Yellow", "Orange", "Red"] as const;

interface TriageForm {
  weight: string;
  height: string;
  temp: string;
  bpSys: string;
  bpDia: string;
  pulse: string;
  rr: string;
  spo2: string;
  pain: string;
  triageCategory: string;
  notes: string;
}

const EMPTY_TRIAGE: TriageForm = {
  weight: "", height: "", temp: "", bpSys: "", bpDia: "",
  pulse: "", rr: "", spo2: "", pain: "", triageCategory: "Green", notes: "",
};

function OPDPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [activeStep, setActiveStep] = useState<OPDStep>("Triage");
  const [triage, setTriage] = useState<TriageForm>(EMPTY_TRIAGE);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) { router.replace("/login"); return; }
    if (!canRead(a.role, "medical_clerking")) { router.replace("/dashboard"); return; }
    setAuth({ role: a.role });
  }, [router]);

  useEffect(() => {
    if (!patientId) return;
    const stored = sessionStorage.getItem(`opd_patient_${patientId}`);
    if (stored) setPatient(JSON.parse(stored));
  }, [patientId]);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-slate-500 mb-4">No patient data found.</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/medical-clerking")}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Back to Medical Clerking
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const encId = `ENC-${patient.uhid?.replace(/\D/g, "").slice(-5) || "00000"}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* OPD Flow header */}
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">OPD Flow</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Registration &rarr; triage &rarr; consult &rarr; labs &rarr; results &rarr; meds &rarr; follow-up
              </p>
            </div>
            <nav className="flex items-center gap-1 flex-wrap">
              {OPD_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(step)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeStep === step
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {step}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Step content */}
        {activeStep === "Triage" && (
          <div className="space-y-6">
            {/* Section heading + patient info */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Triage</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {patient.name} &middot; {patient.uhid} &middot; {encId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/medical-clerking")}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            </div>

            {/* Triage form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={triage.weight}
                    onChange={(e) => setTriage((t) => ({ ...t, weight: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={triage.height}
                    onChange={(e) => setTriage((t) => ({ ...t, height: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={triage.temp}
                    onChange={(e) => setTriage((t) => ({ ...t, temp: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">BP</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Sys"
                      value={triage.bpSys}
                      onChange={(e) => setTriage((t) => ({ ...t, bpSys: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Dia"
                      value={triage.bpDia}
                      onChange={(e) => setTriage((t) => ({ ...t, bpDia: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pulse</label>
                  <input
                    type="number"
                    value={triage.pulse}
                    onChange={(e) => setTriage((t) => ({ ...t, pulse: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">RR</label>
                  <input
                    type="number"
                    value={triage.rr}
                    onChange={(e) => setTriage((t) => ({ ...t, rr: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">SpO2</label>
                  <input
                    type="number"
                    value={triage.spo2}
                    onChange={(e) => setTriage((t) => ({ ...t, spo2: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Pain (0–10)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={triage.pain}
                    onChange={(e) => setTriage((t) => ({ ...t, pain: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Triage category</label>
                  <select
                    value={triage.triageCategory}
                    onChange={(e) => setTriage((t) => ({ ...t, triageCategory: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                  >
                    {TRIAGE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                <textarea
                  rows={4}
                  value={triage.notes}
                  onChange={(e) => setTriage((t) => ({ ...t, notes: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    /* save triage */
                  }}
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save triage
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep("Consult")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Next: Consult
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep !== "Triage" && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <p className="text-slate-500 text-sm">
              <span className="font-semibold text-slate-700">{activeStep}</span> — coming soon.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
