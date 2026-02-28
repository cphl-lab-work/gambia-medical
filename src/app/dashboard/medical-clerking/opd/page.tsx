"use client";

import { useEffect, useState } from "react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [patient, setPatient] = useState<PatientRecord | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "medical_clerking")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  useEffect(() => {
    if (!patientId) return;
    const stored = sessionStorage.getItem(`opd_patient_${patientId}`);
    if (stored) {
      setPatient(JSON.parse(stored));
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/medical-clerking")}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">OPD Encounter</h1>
            <p className="text-sm text-slate-500">Outpatient department visit</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Patient Information</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">{patient.name}</h3>
              <p className="text-sm text-slate-500">{patient.uhid}</p>
            </div>
            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              OPD
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Age</p>
              <p className="text-slate-800 mt-0.5">{patient.age}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Gender</p>
              <p className="text-slate-800 mt-0.5">{patient.gender}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Phone</p>
              <p className="text-slate-800 mt-0.5">{patient.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Insurance</p>
              <p className="text-slate-800 mt-0.5">
                {patient.insuranceType === "insurance" ? (patient.insurancePolicy ?? "Insurance") : "Self-pay"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Vital Signs</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Blood Pressure", placeholder: "e.g. 120/80 mmHg" },
                { label: "Temperature", placeholder: "e.g. 36.6 °C" },
                { label: "Pulse Rate", placeholder: "e.g. 72 bpm" },
                { label: "Respiratory Rate", placeholder: "e.g. 18 /min" },
                { label: "SpO2", placeholder: "e.g. 98%" },
                { label: "Weight", placeholder: "e.g. 70 kg" },
              ].map((v) => (
                <div key={v.label}>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{v.label}</label>
                  <input
                    type="text"
                    placeholder={v.placeholder}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Chief Complaint</h2>
            <textarea
              rows={4}
              placeholder="Describe the patient's chief complaint..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
            />
            <h2 className="text-base font-semibold text-slate-800 mt-6 mb-4">History of Present Illness</h2>
            <textarea
              rows={4}
              placeholder="Describe the history of present illness..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Diagnosis &amp; Plan</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Provisional Diagnosis</label>
              <textarea
                rows={3}
                placeholder="Enter provisional diagnosis..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Treatment Plan</label>
              <textarea
                rows={3}
                placeholder="Enter treatment plan..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/medical-clerking")}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              router.push("/dashboard/medical-clerking");
            }}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Save Encounter
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
