"use client";

import { useRouter } from "next/navigation";
import type { PatientRecord } from "./recent-patients";

interface ViewPatientPanelProps {
  patient: PatientRecord;
  onClose: () => void;
  onEdit?: (patient: PatientRecord) => void;
}

function Field({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function ViewPatientPanel({ patient, onClose, onEdit }: ViewPatientPanelProps) {
  const router = useRouter();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 mt-0"
        style={{ marginTop: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md lg:left-56 lg:right-0 lg:max-w-none bg-white shadow-2xl z-50 flex flex-col mt-0"
        style={{ marginTop: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Patient Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">{patient.name}</h3>
              <p className="text-sm text-slate-500">{patient.uhid}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age" value={patient.age} />
              <Field label="Gender" value={patient.gender} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" value={patient.phone} />
              <Field label="Email" value={patient.email} />
            </div>
            <Field label="Address" value={patient.address} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country" value={patient.countryCode} />
              <Field label="District" value={patient.district} />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Next of Kin</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={patient.nextOfKin} />
                <Field label="Relationship" value={patient.nextOfKinRelationship} />
              </div>
              <div className="mt-3">
                <Field label="Phone" value={patient.nextOfKinPhone} />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Insurance</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type" value={patient.insuranceType === "insurance" ? "Insurance" : "Self-pay"} />
                {patient.insuranceType === "insurance" && (
                  <Field label="Policy" value={patient.insurancePolicy} />
                )}
              </div>
            </div>
            {patient.arrivalSource && (
              <div className="border-t border-slate-100 pt-4">
                <Field label="Arrival Source" value={patient.arrivalSource} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-3 flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => { onEdit(patient); onClose(); }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem(`opd_patient_${patient.id}`, JSON.stringify(patient));
              router.push(`/dashboard/medical-clerking/opd?patientId=${patient.id}`);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start OPD
          </button>
        </div>
      </div>
    </>
  );
}
