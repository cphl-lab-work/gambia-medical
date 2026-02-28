"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getClerkingRecords, type ClerkingRecord } from "@/helpers/local-storage";

type TriageTab = "medical" | "consultation" | "triage" | "billing" | "consent";

interface PageProps {
  params: { id: string };
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CONSULT_TYPES = ["Instant", "Scheduled"] as const;

const DOCTOR_OPTIONS = [
  { id: "doc-1", name: "Dr. John Doe", specialty: "General medicine" },
  { id: "doc-2", name: "Dr. Mary Smith", specialty: "Internal medicine" },
  { id: "doc-3", name: "Dr. Peter Kim", specialty: "Paediatrics" },
];

export default function TriageDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [record, setRecord] = useState<ClerkingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TriageTab>("medical");

  const [form, setForm] = useState({
    bloodType: "",
    heightCm: "",
    weightKg: "",
    allergies: "",
    currentMeds: "",
    chronic: "",
    pastSurgeries: "",
    previousHosp: "",
    fam_diabetes: false,
    fam_hypertension: false,
    fam_asthma: false,
    fam_heart: false,
    fam_cancer: false,
    fam_mental: false,
    familyNotes: "",
    smokingStatus: "",
    alcohol: "",
    exercise: "",
    diet: "",
  });

  const [consultation, setConsultation] = useState({
    doctorId: "",
    type: "" as "" | (typeof CONSULT_TYPES)[number],
    date: "",
    time: "",
    amount: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    // Allow nurses and doctors to access detailed triage view
    if (a.role !== "nurse" && a.role !== "doctor" && a.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setAuthRole(a.role);

    const all = getClerkingRecords();
    const found = all.find((r) => r.id === params.id);
    setRecord(found ?? null);
    setLoading(false);
  }, [params.id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Triage detail persistence can be wired to an API or localStorage later.
  };

  if (!authRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 text-sm">Loading patient triage details…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-10">
          <button
            type="button"
            onClick={() => router.push("/dashboard/clerking")}
            className="mb-4 text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to patient clerking
          </button>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Patient clerking record not found. The record may have been deleted.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const headerSubtitle = `${record.dateOfArrival} • ${record.timeOfArrival} • ${record.arrivalSource}`;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => router.push("/dashboard/clerking")}
              className="mb-2 text-xs text-slate-500 hover:text-slate-700"
            >
              ← Back to patient clerking
            </button>
            <h1 className="text-xl font-semibold text-slate-800 truncate">
              Triage details – {record.patientName}
            </h1>
            <p className="text-sm text-slate-500 mt-1 truncate">
              {headerSubtitle}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap gap-4 text-sm text-slate-700">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Patient ID</div>
            <div className="font-medium">{record.patientId ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Status</div>
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {record.status}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Phone</div>
            <div className="font-medium">{record.phone ?? "—"}</div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="text-xs uppercase tracking-wide text-slate-400">Recorded by</div>
            <div className="font-medium truncate">{record.recordedBy}</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 pt-3">
            <nav className="flex flex-wrap gap-2 text-sm">
              {[
                { id: "medical" as TriageTab, label: "Medical information" },
                { id: "consultation" as TriageTab, label: "Consultation" },
                { id: "triage" as TriageTab, label: "Triage & vitals" },
                { id: "billing" as TriageTab, label: "Insurance & billing" },
                { id: "consent" as TriageTab, label: "Consent & documents" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === "medical" && (
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Medical Information</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the patient&apos;s medical history and details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Blood Type</label>
                    <select
                      value={form.bloodType}
                      onChange={(e) => setForm((f) => ({ ...f, bloodType: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select blood type</option>
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={form.heightCm}
                      onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter height"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={form.weightKg}
                      onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter weight"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Allergies</label>
                    <textarea
                      value={form.allergies}
                      onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="List any allergies (medications, food, etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Current Medications</label>
                    <textarea
                      value={form.currentMeds}
                      onChange={(e) => setForm((f) => ({ ...f, currentMeds: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="List any current medications"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Chronic Conditions</label>
                    <textarea
                      value={form.chronic}
                      onChange={(e) => setForm((f) => ({ ...f, chronic: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="List any chronic conditions"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Medical History</h3>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Past Surgeries</label>
                    <textarea
                      value={form.pastSurgeries}
                      onChange={(e) => setForm((f) => ({ ...f, pastSurgeries: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="List any past surgeries with dates"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Previous Hospitalizations</label>
                    <textarea
                      value={form.previousHosp}
                      onChange={(e) => setForm((f) => ({ ...f, previousHosp: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="List any previous hospitalizations with dates"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Family Medical History</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-slate-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_diabetes}
                        onChange={(e) => setForm((f) => ({ ...f, fam_diabetes: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Diabetes</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_hypertension}
                        onChange={(e) => setForm((f) => ({ ...f, fam_hypertension: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Hypertension</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_asthma}
                        onChange={(e) => setForm((f) => ({ ...f, fam_asthma: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Asthma</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_heart}
                        onChange={(e) => setForm((f) => ({ ...f, fam_heart: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Heart disease</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_cancer}
                        onChange={(e) => setForm((f) => ({ ...f, fam_cancer: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Cancer</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.fam_mental}
                        onChange={(e) => setForm((f) => ({ ...f, fam_mental: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mental health conditions</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Additional Family History Notes</label>
                    <textarea
                      value={form.familyNotes}
                      onChange={(e) => setForm((f) => ({ ...f, familyNotes: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[64px]"
                      placeholder="Enter any additional family medical history"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Lifestyle Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Smoking Status</label>
                      <select
                        value={form.smokingStatus}
                        onChange={(e) => setForm((f) => ({ ...f, smokingStatus: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select status</option>
                        <option value="never">Never</option>
                        <option value="former">Former smoker</option>
                        <option value="current">Current smoker</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Alcohol Consumption</label>
                      <select
                        value={form.alcohol}
                        onChange={(e) => setForm((f) => ({ ...f, alcohol: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select consumption</option>
                        <option value="none">None</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Exercise Frequency</label>
                      <select
                        value={form.exercise}
                        onChange={(e) => setForm((f) => ({ ...f, exercise: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select frequency</option>
                        <option value="none">None</option>
                        <option value="1-2">1–2 times per week</option>
                        <option value="3-5">3–5 times per week</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">Dietary Habits</label>
                      <textarea
                        value={form.diet}
                        onChange={(e) => setForm((f) => ({ ...f, diet: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
                        placeholder="Describe dietary habits"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "consultation" && (
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Consultation</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Attach a doctor for this patient&apos;s consultation and capture the consultation details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Assigned doctor</label>
                    <select
                      value={consultation.doctorId}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          doctorId: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select doctor</option>
                      {DOCTOR_OPTIONS.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} – {doc.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Consultation type</label>
                    <select
                      value={consultation.type}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          type: e.target.value as typeof c.type,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type</option>
                      {CONSULT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Consultation amount</label>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-md">
                        UGX
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={consultation.amount}
                        onChange={(e) =>
                          setConsultation((c) => ({
                            ...c,
                            amount: e.target.value,
                          }))
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Preferred date</label>
                    <input
                      type="date"
                      value={consultation.date}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          date: e.target.value,
                        }))
                      }
                      disabled={consultation.type !== "Scheduled"}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Preferred time</label>
                    <input
                      type="time"
                      value={consultation.time}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          time: e.target.value,
                        }))
                      }
                      disabled={consultation.type !== "Scheduled"}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    {consultation.type === "Instant" && (
                      <p className="mt-1 text-xs text-slate-500">
                        Instant consultations are started as soon as a doctor is available.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Reason for consultation</label>
                    <textarea
                      value={consultation.reason}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          reason: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the main complaint, symptoms, or question for the doctor."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1">Additional notes</label>
                    <textarea
                      value={consultation.notes}
                      onChange={(e) =>
                        setConsultation((c) => ({
                          ...c,
                          notes: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any extra context for the consulting doctor."
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  Consultation details are saved together with this patient&apos;s triage record when you click{" "}
                  <span className="font-semibold">Save</span> below. Integration with your doctor schedule or billing
                  system can be wired later.
                </div>
              </div>
            )}

            {activeTab !== "medical" && (
              <div className="px-6 py-8 text-sm text-slate-500">
                This section is a placeholder. Detailed forms for this tab will be implemented later.
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-xs text-slate-500">
                Changes here are not yet synced to the EMR.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/clerking")}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

