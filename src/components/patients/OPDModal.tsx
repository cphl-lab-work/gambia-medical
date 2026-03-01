"use client";

import { useState, useEffect } from "react";
import ContentAreaModal from "@/components/ui/ContentAreaModal";

export interface OPDPatient {
  id: string;
  uhid: string;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  insuranceType?: string;
  insurancePolicy?: string;
  district?: string | null;
  email?: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
}

interface Props {
  patient: OPDPatient | null;
  onClose: () => void;
}

const OPD_STEPS = ["Triage", "Consult", "Lab Order", "Results", "Meds", "Follow-up"] as const;
type OPDStep = (typeof OPD_STEPS)[number];

const TRIAGE_CATEGORIES = ["Green", "Yellow", "Orange", "Red"] as const;
const TRIAGE_COLORS: Record<string, string> = {
  Green: "bg-emerald-500",
  Yellow: "bg-yellow-400",
  Orange: "bg-orange-500",
  Red: "bg-red-600",
};

interface TriageForm {
  weight: string; height: string; temp: string;
  bpSys: string; bpDia: string; pulse: string;
  rr: string; spo2: string; pain: string;
  triageCategory: string; chiefComplaint: string; notes: string;
}

const EMPTY_TRIAGE: TriageForm = {
  weight: "", height: "", temp: "", bpSys: "", bpDia: "",
  pulse: "", rr: "", spo2: "", pain: "0",
  triageCategory: "Green", chiefComplaint: "", notes: "",
};

const ICD10_OPTIONS = [
  { code: "B54",   label: "Malaria" },
  { code: "J18.9", label: "Pneumonia" },
  { code: "B17.9", label: "Acute hepatitis" },
  { code: "B24",   label: "HIV disease" },
  { code: "I10",   label: "Hypertension" },
  { code: "E14.9", label: "Diabetes mellitus" },
  { code: "A41.9", label: "Sepsis" },
] as const;

interface ConsultForm {
  chiefComplaint: string;
  hpi: string;
  examination: string;
  diagnoses: string[];   // array of ICD-10 codes
  plan: string;
  admitIPD: boolean;
}

const EMPTY_CONSULT: ConsultForm = {
  chiefComplaint: "",
  hpi: "",
  examination: "",
  diagnoses: [],
  plan: "",
  admitIPD: false,
};

// ─── Lab Order constants ────────────────────────────────────────────────────

const LAB_FACILITIES = ["Main Hospital Lab", "Satellite Clinic Lab", "Reference Lab", "External Lab"];
const LAB_LOCATIONS  = ["OPD Clinic", "Emergency Ward", "General Ward", "ICU", "Maternity", "Paediatrics", "Surgical Ward"];
const LAB_CLINICIANS = ["Dr. Amina Namusoke", "Dr. John Doe", "Dr. Jane Smith", "Dr. Alex Hales", "Dr. Samuel Otieno"];
const LAB_PROGRAMS   = ["None", "VL (Viral Load)", "EID (Early Infant Diagnosis)", "HepB", "TB/DRTB", "Malaria", "HIV", "COVID-19"];
const LAB_PRIORITIES = ["Routine", "Urgent", "STAT"] as const;

const LAB_TESTS = [
  "Full Blood Count (FBC)",
  "Malaria RDT / Smear",
  "Blood Glucose (Random)",
  "Blood Glucose (Fasting)",
  "HbA1c",
  "Lipid Profile",
  "Liver Function Tests (LFTs)",
  "Kidney Function Tests (KFTs)",
  "Electrolytes (Na/K/Cl/HCO3)",
  "HIV Test (Rapid)",
  "CD4 Count",
  "Viral Load",
  "Hepatitis B Surface Antigen (HBsAg)",
  "Hepatitis C Antibody",
  "Widal Test",
  "Blood Culture & Sensitivity",
  "Urine Routine & Microscopy",
  "Urine Culture & Sensitivity",
  "Stool Routine & Microscopy",
  "Sputum AFB (TB)",
  "GeneXpert (TB)",
  "Pregnancy Test (Beta-hCG)",
  "Thyroid Function (TSH/T3/T4)",
  "INR / PT / APTT",
  "ESR",
  "CRP",
  "Serum Albumin",
  "Serum Creatinine",
  "eGFR",
];

const SPECIMEN_TYPES = [
  "Whole Blood (EDTA)",
  "Whole Blood (Heparin)",
  "Serum",
  "Plasma",
  "DBS (Dried Blood Spot)",
  "Urine (Random)",
  "Urine (Fasting / MSU)",
  "Stool",
  "Sputum",
  "Swab (Throat)",
  "Swab (Wound)",
  "CSF",
  "Synovial Fluid",
];

const CONTAINER_TYPES = [
  "EDTA (Purple top)",
  "Heparin (Green top)",
  "SST / Gel (Yellow top)",
  "Plain (Red top)",
  "Fluoride (Grey top)",
  "Citrate (Blue top)",
  "DBS Card",
  "Sterile Urine Cup",
  "Stool Container",
  "Sputum Cup",
];

const SPECIAL_HANDLING = [
  "Cold chain (2–8 °C)",
  "Protect from light",
  "Process within 2 h",
  "Freeze immediately",
  "Do not centrifuge",
];

const LAB_ICD10 = [
  { code: "B54",   label: "Malaria" },
  { code: "J18.9", label: "Pneumonia" },
  { code: "B17.9", label: "Acute hepatitis" },
  { code: "B24",   label: "HIV disease" },
  { code: "I10",   label: "Hypertension" },
  { code: "E14.9", label: "Diabetes mellitus" },
  { code: "A41.9", label: "Sepsis" },
  { code: "A15.0", label: "Pulmonary tuberculosis" },
  { code: "Z11.4", label: "Screening for HIV" },
];

interface TestRow {
  id: string;
  testName: string;
  specimenType: string;
  containerType: string;
  numContainers: number;
  collectionDateTime: string;
  fastingRequired: boolean;
  specialHandling: string[];
}

function newTestRow(): TestRow {
  return {
    id: Math.random().toString(36).slice(2),
    testName: "",
    specimenType: "",
    containerType: "",
    numContainers: 1,
    collectionDateTime: "",
    fastingRequired: false,
    specialHandling: [],
  };
}

interface LabOrderForm {
  orderDateTime: string;
  facility: string;
  location: string;
  clinician: string;
  priority: string;
  clinicalNotes: string;
  diagnoses: string[];
  program: string;
  tests: TestRow[];
  dxDropdownOpen: boolean;
}

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function LabOrderForm({ onBack, onNext }: {
  onBack: () => void;
  onNext: (tests: { testName: string; specimenType: string }[]) => void;
}) {
  const [form, setForm] = useState<LabOrderForm>({
    orderDateTime: nowLocal(),
    facility: "",
    location: "",
    clinician: "",
    priority: "Routine",
    clinicalNotes: "",
    diagnoses: [],
    program: "None",
    tests: [newTestRow()],
    dxDropdownOpen: false,
  });

  function setField<K extends keyof LabOrderForm>(key: K, val: LabOrderForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function toggleDx(code: string) {
    setField("diagnoses", form.diagnoses.includes(code)
      ? form.diagnoses.filter(c => c !== code)
      : [...form.diagnoses, code]);
  }

  function updateTest(id: string, patch: Partial<TestRow>) {
    setField("tests", form.tests.map(t => t.id === id ? { ...t, ...patch } : t));
  }

  function toggleHandling(id: string, val: string) {
    setField("tests", form.tests.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        specialHandling: t.specialHandling.includes(val)
          ? t.specialHandling.filter(v => v !== val)
          : [...t.specialHandling, val],
      };
    }));
  }

  function removeTest(id: string) {
    if (form.tests.length === 1) return;
    setField("tests", form.tests.filter(t => t.id !== id));
  }

  const fieldCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 capitalize";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Lab Order</h3>
        <p className="text-sm text-slate-500 mt-0.5">Complete the requisition and add tests.</p>
      </div>

      {/* ── Order Header ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Order Date/Time */}
          <div>
            <label className={labelCls}>Order Date / Time</label>
            <input type="datetime-local" className={fieldCls}
              value={form.orderDateTime}
              onChange={e => setField("orderDateTime", e.target.value)} />
          </div>
          {/* Facility */}
          <div>
            <label className={labelCls}>Ordering Facility</label>
            <select className={fieldCls} value={form.facility} onChange={e => setField("facility", e.target.value)}>
              <option value="">Select facility…</option>
              {LAB_FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {/* Location */}
          <div>
            <label className={labelCls}>Location / Ward / Clinic</label>
            <select className={fieldCls} value={form.location} onChange={e => setField("location", e.target.value)}>
              <option value="">Select location…</option>
              {LAB_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {/* Clinician */}
          <div>
            <label className={labelCls}>Ordering Clinician</label>
            <select className={fieldCls} value={form.clinician} onChange={e => setField("clinician", e.target.value)}>
              <option value="">Select clinician…</option>
              {LAB_CLINICIANS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Program */}
          <div>
            <label className={labelCls}>Program</label>
            <select className={fieldCls} value={form.program} onChange={e => setField("program", e.target.value)}>
              {LAB_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {/* Priority */}
          <div>
            <label className={labelCls}>Priority</label>
            <div className="flex gap-2 mt-1">
              {LAB_PRIORITIES.map(p => (
                <button key={p} type="button"
                  onClick={() => setField("priority", p)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.priority === p
                      ? p === "STAT"   ? "bg-red-600 border-red-600 text-white"
                      : p === "Urgent" ? "bg-amber-500 border-amber-500 text-white"
                      :                  "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className={labelCls}>Clinical Notes / Indication</label>
          <textarea rows={3} className={`${fieldCls} resize-none`}
            placeholder="Describe the clinical indication, symptoms, or relevant history…"
            value={form.clinicalNotes}
            onChange={e => setField("clinicalNotes", e.target.value)} />
        </div>

        {/* Provisional Diagnosis ICD-10 */}
        <div className="relative">
          <label className={labelCls}>Provisional Diagnosis (ICD-10)</label>
          <button type="button"
            onClick={() => setField("dxDropdownOpen", !form.dxDropdownOpen)}
            className={`${fieldCls} flex items-center justify-between`}>
            <span className={form.diagnoses.length === 0 ? "text-slate-400" : "text-slate-800"}>
              {form.diagnoses.length === 0 ? "Select diagnoses…" : `${form.diagnoses.length} selected`}
            </span>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${form.dxDropdownOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {form.dxDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setField("dxDropdownOpen", false)} aria-hidden />
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {LAB_ICD10.map(opt => {
                  const sel = form.diagnoses.includes(opt.code);
                  return (
                    <button key={opt.code} type="button"
                      onClick={() => toggleDx(opt.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b border-slate-100 last:border-0 transition-colors ${sel ? "bg-blue-50 text-blue-800" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${sel ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                        {sel && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      <span className="text-xs font-mono text-slate-400">{opt.code}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {form.diagnoses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.diagnoses.map(code => {
                const opt = LAB_ICD10.find(o => o.code === code);
                return (
                  <span key={code} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    {opt?.label} <span className="font-mono opacity-70">({code})</span>
                    <button type="button" onClick={() => toggleDx(code)} className="ml-0.5 hover:text-blue-600">×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Test Rows ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Tests Requested</p>
          <button type="button"
            onClick={() => setField("tests", [...form.tests, newTestRow()])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Test
          </button>
        </div>

        {form.tests.map((test, idx) => (
          <div key={test.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Test #{idx + 1}</p>
              {form.tests.length > 1 && (
                <button type="button" onClick={() => removeTest(test.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Test Name */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className={labelCls}>Test Name</label>
                <select className={fieldCls} value={test.testName}
                  onChange={e => updateTest(test.id, { testName: e.target.value })}>
                  <option value="">Select test…</option>
                  {LAB_TESTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {/* Specimen Type */}
              <div>
                <label className={labelCls}>Specimen Type</label>
                <select className={fieldCls} value={test.specimenType}
                  onChange={e => updateTest(test.id, { specimenType: e.target.value })}>
                  <option value="">Select specimen…</option>
                  {SPECIMEN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Container */}
              <div>
                <label className={labelCls}>Container Type</label>
                <select className={fieldCls} value={test.containerType}
                  onChange={e => updateTest(test.id, { containerType: e.target.value })}>
                  <option value="">Select container…</option>
                  {CONTAINER_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Num Containers */}
              <div>
                <label className={labelCls}>No. of Containers</label>
                <input type="number" min={1} max={10} className={fieldCls}
                  value={test.numContainers}
                  onChange={e => updateTest(test.id, { numContainers: Number(e.target.value) })} />
              </div>
              {/* Collection DateTime */}
              <div>
                <label className={labelCls}>Collection Date / Time</label>
                <input type="datetime-local" className={fieldCls}
                  value={test.collectionDateTime}
                  onChange={e => updateTest(test.id, { collectionDateTime: e.target.value })} />
              </div>
            </div>

            {/* Fasting + Special Handling */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                <input type="checkbox" checked={test.fastingRequired}
                  onChange={e => updateTest(test.id, { fastingRequired: e.target.checked })}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-slate-700 font-medium">Fasting required</span>
              </label>
              <div>
                <p className={labelCls}>Special Handling</p>
                <div className="flex flex-wrap gap-3">
                  {SPECIAL_HANDLING.map(h => (
                    <label key={h} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={test.specialHandling.includes(h)}
                        onChange={() => toggleHandling(test.id, h)}
                        className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-slate-700">{h}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Attachments ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className={labelCls}>Attachments (referral form, prior results)</label>
        <label className="mt-2 flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <svg className="w-7 h-7 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
          </svg>
          <span className="text-sm text-slate-500">Click to upload or drag &amp; drop</span>
          <span className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG up to 10 MB</span>
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
        </label>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pb-2">
        <button type="button" onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Back
        </button>
        <button type="button"
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17H17.01M3 10H21M5 21H19A2 2 0 0021 19V7A2 2 0 0019 5H5A2 2 0 003 7V19A2 2 0 005 21Z" />
          </svg>
          Print Requisition
        </button>
        <button type="button"
          onClick={() => onNext(form.tests.map(t => ({ testName: t.testName, specimenType: t.specimenType })))}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          Submit Order
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Results / Specimen Collection constants ────────────────────────────────

const COLLECTORS = [
  "Dr. Amina Namusoke", "Dr. John Doe", "Dr. Jane Smith", "Dr. Alex Hales",
  "Nurse Grace Apio", "Nurse James Okello", "Lab Tech Susan Nalwanga",
];

const COLLECTION_SITES = [
  "OPD Phlebotomy Room",
  "Emergency Room",
  "General Ward",
  "ICU",
  "Maternity Ward",
  "Surgical Ward",
  "Paediatrics Ward",
  "Bedside",
];

interface SpecimenRow {
  testName: string;
  specimenType: string;
  collected: boolean;
  collector: string;
  collectionDateTime: string;
  collectionSite: string;
  complications: string;
  tested: boolean;
  result: string;
  remarks: string;
}

interface ResultsForm {
  specimens: SpecimenRow[];
}

function ResultsTab({
  labTests,
  onBack,
  onNext,
}: {
  labTests: { testName: string; specimenType: string }[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [specimens, setSpecimens] = useState<SpecimenRow[]>(() =>
    (labTests.length > 0 ? labTests : [{ testName: "—", specimenType: "—" }]).map(t => ({
      testName: t.testName || "—",
      specimenType: t.specimenType || "—",
      collected: false,
      collector: "",
      collectionDateTime: "",
      collectionSite: "",
      complications: "",
      tested: false,
      result: "",
      remarks: "",
    }))
  );

  function updateRow(idx: number, patch: Partial<SpecimenRow>) {
    setSpecimens(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  const fieldCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 capitalize";

  const allCollected = specimens.every(s => s.collected);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Results &amp; Specimen Collection</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Record specimen collection details for each ordered test.
          </p>
        </div>

        {/* Print labels button */}
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17H17.01M3 10H21M5 21H19A2 2 0 0021 19V7A2 2 0 0019 5H5A2 2 0 003 7V19A2 2 0 005 21Z" />
          </svg>
          Print Labels / Sheet
        </button>
      </div>

      {/* Collection instructions banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
        <div className="text-sm text-blue-800 space-y-0.5">
          <p className="font-semibold">Collection Instructions</p>
          <ul className="list-disc list-inside text-blue-700 space-y-0.5 text-xs">
            <li>Confirm patient identity (name + UHID) before collection.</li>
            <li>Label all containers immediately after collection.</li>
            <li>Record exact collection date and time.</li>
            <li>Note any complications or special handling requirements.</li>
            <li>Transport specimens promptly — refrigerate if cold chain required.</li>
          </ul>
        </div>
      </div>

      {/* Specimen rows */}
      {specimens.map((row, idx) => (
        <div key={idx}
          className={`bg-white rounded-xl border p-5 space-y-4 transition-colors ${
            row.collected ? "border-emerald-300" : "border-slate-200"
          }`}
        >
          {/* Row header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Specimen {idx + 1}
              </span>
              <span className="text-sm font-semibold text-slate-800">{row.testName}</span>
              {row.specimenType && row.specimenType !== "—" && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {row.specimenType}
                </span>
              )}
            </div>
            {/* Collected toggle */}
            <button
              type="button"
              onClick={() => updateRow(idx, { collected: !row.collected })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                row.collected
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                row.collected ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
              }`}>
                {row.collected && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {row.collected ? "Collected" : "Mark Collected"}
            </button>
          </div>

          {/* Collection fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Collector */}
            <div>
              <label className={labelCls}>Collector</label>
              <select className={fieldCls} value={row.collector}
                onChange={e => updateRow(idx, { collector: e.target.value })}>
                <option value="">Select collector…</option>
                {COLLECTORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Collection DateTime */}
            <div>
              <label className={labelCls}>Collection Date / Time</label>
              <input type="datetime-local" className={fieldCls}
                value={row.collectionDateTime}
                onChange={e => updateRow(idx, { collectionDateTime: e.target.value })} />
            </div>
            {/* Collection Site */}
            <div>
              <label className={labelCls}>Collection Site</label>
              <select className={fieldCls} value={row.collectionSite}
                onChange={e => updateRow(idx, { collectionSite: e.target.value })}>
                <option value="">Select site…</option>
                {COLLECTION_SITES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Complications / Notes */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>Complications / Notes</label>
              <textarea rows={2} className={`${fieldCls} resize-none`}
                placeholder="Any complications during collection, patient reactions, haemolysis, insufficient volume…"
                value={row.complications}
                onChange={e => updateRow(idx, { complications: e.target.value })} />
            </div>
          </div>

          {/* Results fields (only if collected) */}
          {row.collected && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Results Entry</span>
                {/* Tested toggle */}
                <button
                  type="button"
                  onClick={() => updateRow(idx, { tested: !row.tested })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    row.tested
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    row.tested ? "bg-blue-500 border-blue-500" : "border-slate-300"
                  }`}>
                    {row.tested && (
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {row.tested ? "Tested" : "Mark Tested"}
                </button>
              </div>
              {/* Result field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Result</label>
                  <input
                    type="text"
                    className={fieldCls}
                    placeholder="Enter result value(s)"
                    value={row.result}
                    onChange={e => updateRow(idx, { result: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Remarks</label>
                  <input
                    type="text"
                    className={fieldCls}
                    placeholder="Any remarks on result, e.g. 'Normal', 'Abnormal', 'Repeat needed'"
                    value={row.remarks}
                    onChange={e => updateRow(idx, { remarks: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Summary badge */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        allCollected
          ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
          : "bg-amber-50 border border-amber-300 text-amber-800"
      }`}>
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {allCollected
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />}
        </svg>
        {allCollected
          ? `All ${specimens.length} specimen(s) marked as collected.`
          : `${specimens.filter(s => s.collected).length} of ${specimens.length} specimen(s) collected.`}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-2">
        <button type="button" onClick={onBack}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
          ← Back
        </button>
        <button type="button" onClick={() => {/* save results logic here, e.g., show a toast or call a prop */}} className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Results
        </button>
        <button type="button" onClick={onNext}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          Next: Meds
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Admission form constants ────────────────────────────────────────────────

const WARD_OPTIONS        = ["Emergency", "General", "Pediatrics", "Maternity", "Surgical", "ICU"];
const ADMISSION_TYPE_OPTIONS = ["Emergency", "Elective", "Transfer", "Observation"];
const SOURCE_OPTIONS      = ["OPD", "ER", "Referral", "Clinic", "Self"];
const CLINICIAN_OPTIONS   = ["Dr. Amina Namusoke", "Dr. John Doe", "Dr. Jane Smith", "Dr. Alex Hales"];

const ADMISSION_ICD10 = [
  { code: "B54",   label: "Malaria" },
  { code: "J18.9", label: "Pneumonia" },
  { code: "B17.9", label: "Acute hepatitis" },
  { code: "B24",   label: "HIV disease" },
  { code: "I10",   label: "Hypertension" },
  { code: "E14.9", label: "Diabetes mellitus" },
  { code: "A41.9", label: "Sepsis" },
];

function AdmissionFormSection() {
  const [ward, setWard]                   = useState("");
  const [bed, setBed]                     = useState("");
  const [admissionType, setAdmissionType] = useState("");
  const [source, setSource]               = useState("");
  const [clinician, setClinician]         = useState("");
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState<string[]>([]);
  const [reason, setReason]               = useState("");
  const [dxOpen, setDxOpen] = useState(false);

  function toggleDiagnosis(code: string) {
    setPrimaryDiagnoses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  return (
    <div className="mt-4 p-5 rounded-xl border border-amber-300 bg-amber-50 space-y-4">
      <h4 className="text-base font-semibold text-amber-800">Admission Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Ward</label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={ward} onChange={e => setWard(e.target.value)}>
            <option value="">Select ward…</option>
            {WARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Bed</label>
          <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="e.g. MW-01" value={bed} onChange={e => setBed(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Admission Type</label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={admissionType} onChange={e => setAdmissionType(e.target.value)}>
            <option value="">Select type…</option>
            {ADMISSION_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Source</label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={source} onChange={e => setSource(e.target.value)}>
            <option value="">Select source…</option>
            {SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Attending Clinician</label>
          <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" value={clinician} onChange={e => setClinician(e.target.value)}>
            <option value="">Select clinician…</option>
            {CLINICIAN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="relative">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Primary Diagnoses</label>
          <button
            type="button"
            onClick={() => setDxOpen((o: boolean) => !o)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <span className={primaryDiagnoses.length === 0 ? "text-slate-400" : "text-slate-800"}>
              {primaryDiagnoses.length === 0
                ? "Select diagnoses…"
                : `${primaryDiagnoses.length} selected`}
            </span>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${dxOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Dropdown list */}
          {dxOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div className="fixed inset-0 z-10" onClick={() => setDxOpen(false)} aria-hidden />
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                {ADMISSION_ICD10.map((opt) => {
                  const selected = primaryDiagnoses.includes(opt.code);
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => toggleDiagnosis(opt.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b border-slate-100 last:border-0 transition-colors ${
                        selected ? "bg-blue-50 text-blue-800" : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                      }`}>
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                      <span className="text-xs font-mono text-slate-400">{opt.code}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {/* Selected pills */}
          {primaryDiagnoses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {primaryDiagnoses.map((code) => {
                const opt = ADMISSION_ICD10.find((o) => o.code === code);
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {opt?.label} <span className="font-mono opacity-70">({code})</span>
                    <button
                      type="button"
                      onClick={() => toggleDiagnosis(code)}
                      className="ml-0.5 hover:text-blue-600 leading-none"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 capitalize">Reason for Admission</label>
          <textarea rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none" placeholder="Reason for admission…" value={reason} onChange={e => setReason(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

export default function OPDModal({ patient, onClose }: Props) {
  const [activeStep, setActiveStep] = useState<OPDStep>("Triage");
  const [triage, setTriage] = useState<TriageForm>(EMPTY_TRIAGE);
  const [consult, setConsult] = useState<ConsultForm>(EMPTY_CONSULT);
  const [triageSaved, setTriageSaved] = useState(false);
  const [dxOpen, setDxOpen] = useState(false);
  // Lab tests lifted so Results tab can read them
  const [labTests, setLabTests] = useState<{ testName: string; specimenType: string }[]>([]);
  const [meds, setMeds] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Reset state when a new patient is opened
  useEffect(() => {
    if (patient) {
      setActiveStep("Triage");
      setTriage(EMPTY_TRIAGE);
      setConsult(EMPTY_CONSULT);
      setTriageSaved(false);
      setLabTests([]);
    }
  }, [patient?.id]);

  if (!patient) return null;

  const encId = `ENC-${patient.uhid?.replace(/\D/g, "").slice(-5) || "00000"}`;

  const completedSteps = new Set<OPDStep>(triageSaved ? ["Triage"] : []);

  return (
    <ContentAreaModal open={!!patient} onClose={onClose} title={`OPD — ${patient.name}`}>
        {/* ── Patient banner ─────────────────────────────────── */}
        <div className="shrink-0 bg-slate-800 text-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
                {patient.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold leading-tight truncate">{patient.name}</h2>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono shrink-0">
                    {patient.uhid}
                  </span>
                  <span className="text-xs bg-blue-500/80 px-2 py-0.5 rounded-full font-mono shrink-0">
                    {encId}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-sm text-white/70">
                  {patient.gender && <span>{patient.gender}</span>}
                  {patient.age != null && <span>{patient.age} yrs</span>}
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {patient.phone}
                    </span>
                  )}
                  {patient.district && <span>{patient.district}</span>}
                  {patient.insuranceType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${patient.insuranceType === "insurance" ? "bg-emerald-500/70" : "bg-slate-600/80"}`}>
                      {patient.insuranceType === "insurance" ? `Insurance${patient.insurancePolicy ? ` · ${patient.insurancePolicy}` : ""}` : "Self-pay"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close OPD"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Next-of-kin row */}
          {patient.nextOfKin && (
            <div className="mt-2 text-xs text-white/50 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Next of kin: {patient.nextOfKin}
              {patient.nextOfKinRelationship && ` (${patient.nextOfKinRelationship})`}
              {patient.nextOfKinPhone && ` · ${patient.nextOfKinPhone}`}
            </div>
          )}
        </div>

        {/* ── Step tabs ───────────────────────────────────────── */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-6">
          <nav className="flex gap-1 overflow-x-auto" role="tablist">
            {OPD_STEPS.map((step, idx) => {
              const done = completedSteps.has(step);
              const active = activeStep === step;
              return (
                <button
                  key={step}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveStep(step)}
                  className={`relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {done ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {step}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">

          {/* ── TRIAGE ── */}
          {activeStep === "Triage" && (
            <div className="w-[90%] mx-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Triage Assessment</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Record vitals and assign a triage category for {patient.name}.</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-white text-sm font-semibold ${TRIAGE_COLORS[triage.triageCategory] ?? "bg-slate-400"}`}>
                  {triage.triageCategory}
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
                {/* Chief complaint */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Chief Complaint <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Headache, fever for 3 days…"
                    value={triage.chiefComplaint}
                    onChange={(e) => setTriage((t) => ({ ...t, chiefComplaint: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Vitals row 1 */}
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">Vitals</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: "Weight (kg)", key: "weight", type: "number", placeholder: "e.g. 68" },
                      { label: "Height (cm)", key: "height", type: "number", placeholder: "e.g. 172" },
                      { label: "Temp (°C)",   key: "temp",   type: "number", placeholder: "e.g. 37.2", step: "0.1" },
                      { label: "Pulse (bpm)", key: "pulse",  type: "number", placeholder: "e.g. 72" },
                      { label: "RR (br/min)", key: "rr",    type: "number", placeholder: "e.g. 18" },
                      { label: "SpO₂ (%)",    key: "spo2",  type: "number", placeholder: "e.g. 98" },
                    ].map(({ label, key, type, placeholder, step }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
                        <input
                          type={type}
                          step={step}
                          placeholder={placeholder}
                          value={triage[key as keyof TriageForm]}
                          onChange={(e) => setTriage((t) => ({ ...t, [key]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* BP + Pain + Category */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">BP (mmHg)</label>
                    <div className="flex gap-2">
                      <input
                        type="number" placeholder="Sys"
                        value={triage.bpSys}
                        onChange={(e) => setTriage((t) => ({ ...t, bpSys: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="self-center text-slate-400 font-bold">/</span>
                      <input
                        type="number" placeholder="Dia"
                        value={triage.bpDia}
                        onChange={(e) => setTriage((t) => ({ ...t, bpDia: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Pain Score (0–10)</label>
                    <input
                      type="number" min={0} max={10}
                      value={triage.pain}
                      onChange={(e) => setTriage((t) => ({ ...t, pain: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Triage Category</label>
                    <div className="flex gap-2">
                      {TRIAGE_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTriage((t) => ({ ...t, triageCategory: c }))}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                            triage.triageCategory === c
                              ? `${TRIAGE_COLORS[c]} text-white border-transparent`
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Triage Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Additional observations…"
                    value={triage.notes}
                    onChange={(e) => setTriage((t) => ({ ...t, notes: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setTriageSaved(true); }}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Triage
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTriageSaved(true); setActiveStep("Consult"); }}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next: Consult
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CONSULT ── */}
          {activeStep === "Consult" && (
            <div className="w-[89%] mx-auto space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Consultation</h3>
                <p className="text-sm text-slate-500 mt-0.5">Document clinical findings and management plan for {patient.name}.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">

                {/* Chief Complaint */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Chief Complaint <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Patient's main complaint in their own words…"
                    value={consult.chiefComplaint}
                    onChange={(e) => setConsult((c) => ({ ...c, chiefComplaint: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* HPI */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    History of Presenting Illness (HPI)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Onset, duration, character, relieving/aggravating factors, associated symptoms, relevant past history…"
                    value={consult.hpi}
                    onChange={(e) => setConsult((c) => ({ ...c, hpi: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Examination */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Examination
                  </label>
                  <textarea
                    rows={4}
                    placeholder="General appearance, vital signs review, systems examination findings…"
                    value={consult.examination}
                    onChange={(e) => setConsult((c) => ({ ...c, examination: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Diagnoses ICD-10 */}
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Diagnoses (ICD-10)
                  </label>

                  {/* Dropdown trigger */}
                  <button
                    type="button"
                    onClick={() => setDxOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <span className={consult.diagnoses.length === 0 ? "text-slate-400" : "text-slate-800"}>
                      {consult.diagnoses.length === 0
                        ? "Select diagnoses…"
                        : `${consult.diagnoses.length} diagnosis${consult.diagnoses.length > 1 ? "es" : ""} selected`}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${dxOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown list */}
                  {dxOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div className="fixed inset-0 z-10" onClick={() => setDxOpen(false)} aria-hidden />
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        {ICD10_OPTIONS.map((opt) => {
                          const selected = consult.diagnoses.includes(opt.code as string);
                          return (
                            <button
                              key={opt.code}
                              type="button"
                              onClick={() => {
                                setConsult((c) => ({
                                  ...c,
                                  diagnoses: selected
                                    ? c.diagnoses.filter((d) => d !== opt.code)
                                    : [...c.diagnoses, opt.code],
                                }));
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left border-b border-slate-100 last:border-0 transition-colors ${
                                selected ? "bg-blue-50 text-blue-800" : "bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {/* Checkbox indicator */}
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                selected ? "bg-blue-600 border-blue-600" : "border-slate-300"
                              }`}>
                                {selected && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="flex-1">{opt.label}</span>
                              <span className="text-xs font-mono text-slate-400">{opt.code}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Selected pills */}
                  {consult.diagnoses.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {consult.diagnoses.map((code) => {
                        const opt = ICD10_OPTIONS.find((o) => o.code === code);
                        return (
                          <span
                            key={code}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {opt?.label} <span className="font-mono opacity-70">({code})</span>
                            <button
                              type="button"
                              onClick={() => setConsult((c) => ({ ...c, diagnoses: c.diagnoses.filter((d) => d !== code) }))}
                              className="ml-0.5 hover:text-blue-600 leading-none"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wider">
                    Plan (Summary)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Investigations ordered, medications prescribed, referrals, patient education, review date…"
                    value={consult.plan}
                    onChange={(e) => setConsult((c) => ({ ...c, plan: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Admit IPD checkbox */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  consult.admitIPD ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
                  onClick={() => setConsult((c) => ({ ...c, admitIPD: !c.admitIPD }))}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    consult.admitIPD ? "bg-amber-500 border-amber-500" : "border-slate-300 bg-white"
                  }`}>
                    {consult.admitIPD && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Admit patient (IPD)</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check to flag this patient for inpatient admission. You can complete the IPD form after saving this consultation.
                    </p>
                  </div>
                </div>

                {/* Admission form section */}
                {consult.admitIPD && (
                  <AdmissionFormSection />
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveStep("Triage")}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Consult
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep("Lab Order")}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next: Lab Order
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── LAB ORDER ── */}
          {activeStep === "Lab Order" && (
            <div className="w-[89%] mx-auto">
              <LabOrderForm
                onBack={() => setActiveStep("Consult")}
                onNext={(tests) => { setLabTests(tests); setActiveStep("Results"); }}
              />
            </div>
          )}

          {/* ── RESULTS / SPECIMEN COLLECTION ── */}
          {activeStep === "Results" && (
            <div className="w-[89%] mx-auto">
              <ResultsTab
                labTests={labTests}
                onBack={() => setActiveStep("Lab Order")}
                onNext={() => setActiveStep("Meds")}
              />
            </div>
          )}

          {/* ── MEDS ── */}
          {activeStep === "Meds" && (
            <MedsForm
              value={meds}
              onChange={setMeds}
              onBack={() => setActiveStep("Results")}
              onNext={() => setActiveStep("Follow-up")}
            />
          )}

          {/* ── FOLLOW-UP ── */}
          {activeStep === "Follow-up" && (
            <FollowUpForm
              value={followUp}
              onChange={setFollowUp}
              onBack={() => setActiveStep("Meds")}
            />
          )}
        </div>
    </ContentAreaModal>
  );
}




// ─── Meds and Follow-up Forms ─────────────────────────────────────────────
const DRUG_OPTIONS = [
  "Amoxicillin 500mg",
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Ciprofloxacin 500mg",
  "Metronidazole 400mg",
  "Azithromycin 500mg",
  "Ceftriaxone 1g",
  // Add more as needed
];

function MedsForm({ onBack, onNext, value, onChange }: {
  onBack: () => void;
  onNext: () => void;
  value: string;
  onChange: (val: string) => void;
}) {
  const fieldCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 capitalize";

  // Medications state: array of { drug, dose, freq, route, duration, instructions }
  const [medications, setMedications] = useState<Array<{
    drug: string;
    dose: string;
    freq: string;
    route: string;
    duration: string;
    instructions: string;
  }>>([
    { drug: "", dose: "", freq: "", route: "", duration: "", instructions: "" }
  ]);
  const [remark, setRemark] = useState("");

  function updateMed(idx: number, patch: Partial<typeof medications[0]>) {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }
  function addMed() {
    setMedications(prev => [...prev, { drug: "", dose: "", freq: "", route: "", duration: "", instructions: "" }]);
  }
  function removeMed(idx: number) {
    if (medications.length === 1) return;
    setMedications(prev => prev.filter((_, i) => i !== idx));
  }

  // Optionally, sync to parent if needed
  useEffect(() => {
    onChange(JSON.stringify({ medications, remark }));
    // eslint-disable-next-line
  }, [medications, remark]);

  return (
    <div className="w-[89%] mx-auto space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Medications</h3>
        <p className="text-sm text-slate-500 mt-0.5">Prescribe and record medications for the patient.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        {medications.map((med, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 border-b pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <div>
              <label className={labelCls}>Drug</label>
              <select className={fieldCls} value={med.drug} onChange={e => updateMed(idx, { drug: e.target.value })}>
                <option value="">Select drug…</option>
                {DRUG_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Dose</label>
              <input className={fieldCls} placeholder="e.g., 1 tab" value={med.dose} onChange={e => updateMed(idx, { dose: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Freq</label>
              <input className={fieldCls} placeholder="OD" value={med.freq} onChange={e => updateMed(idx, { freq: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Route</label>
              <input className={fieldCls} placeholder="PO" value={med.route} onChange={e => updateMed(idx, { route: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Duration</label>
              <input className={fieldCls} placeholder="e.g., 5 days" value={med.duration} onChange={e => updateMed(idx, { duration: e.target.value })} />
            </div>
            {/* Instructions on a new row spanning all columns */}
            <div className="md:col-span-5">
              <label className={labelCls}>Instructions</label>
              <input className={fieldCls} placeholder="Special instructions" value={med.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })} />
            </div>
            <div className="md:col-span-5 flex justify-end">
              {medications.length > 1 && (
                <button type="button" onClick={() => removeMed(idx)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addMed} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medication
        </button>
        <div>
          <label className={labelCls}>General Remark</label>
          <textarea rows={2} className={fieldCls} placeholder="Any general notes or remarks…" value={remark} onChange={e => setRemark(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
        <button type="button" onClick={onBack} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={() => {/* save meds logic here, e.g., show a toast or call a prop */}} className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Meds
        </button>
        <button type="button" onClick={onNext} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2">Next: Follow-up<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
      {/* Medication summary list */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-slate-700 mb-2">Medications Saved</h4>
        {medications.length === 0 || (medications.length === 1 && !medications[0].drug) ? (
          <p className="text-slate-400 text-sm">No medications added yet.</p>
        ) : (
          <ul className="space-y-2">
            {medications.map((med, idx) => (
              med.drug && (
                <li key={idx} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm">
                  <span className="font-semibold text-blue-700">{med.drug}</span> —
                  {med.dose && <span> {med.dose},</span>}
                  {med.freq && <span> {med.freq},</span>}
                  {med.route && <span> {med.route},</span>}
                  {med.duration && <span> {med.duration},</span>}
                  {med.instructions && <span> <em>({med.instructions})</em></span>}
                </li>
              )
            ))}
          </ul>
        )}
        {remark && (
          <div className="mt-2 text-xs text-slate-500"><span className="font-semibold">General Remark:</span> {remark}</div>
        )}
      </div>
    </div>
  );
}

const CLINIC_OPTIONS = [
  "Medical OPD",
  "Surgical OPD",
  "Pediatrics OPD",
  "Maternity",
  "Specialist Clinic",
  // Add more as needed
];
const STATUS_OPTIONS = ["Open", "Closed", "Pending"];

function FollowUpForm({ onBack, value, onChange }: {
  onBack: () => void;
  value: string;
  onChange: (val: string) => void;
}) {
  const fieldCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-sm font-bold text-slate-700 mb-1.5 capitalize";

  // Follow-up state: { date, clinic, status, notes }
  const [date, setDate] = useState("");
  const [clinic, setClinic] = useState(CLINIC_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [notes, setNotes] = useState("");

  // Optionally, sync to parent if needed
  useEffect(() => {
    onChange(JSON.stringify({ date, clinic, status, notes }));
    // eslint-disable-next-line
  }, [date, clinic, status, notes]);

  return (
    <div className="w-[89%] mx-auto space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Follow-up</h3>
        <p className="text-sm text-slate-500 mt-0.5">Record follow-up date, clinic, status, and notes.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Follow-up Date</label>
            <input type="date" className={fieldCls} value={date} onChange={e => setDate(e.target.value)} placeholder="dd/mm/yyyy" />
          </div>
          <div>
            <label className={labelCls}>Clinic</label>
            <select className={fieldCls} value={clinic} onChange={e => setClinic(e.target.value)}>
              {CLINIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={fieldCls} value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            rows={3}
            className={fieldCls}
            placeholder="Any additional notes, instructions, referrals, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
        <button type="button" onClick={onBack} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">← Back</button>
        <button type="button" onClick={() => {/* save follow-up logic here, e.g., show a toast or call a prop */}} className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Follow-up
        </button>
      </div>
      {/* Follow-up summary */}
      <div className="mt-6">
        <h4 className="text-base font-semibold text-slate-700 mb-2">Follow-up Details Saved</h4>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm">
          <div><span className="font-semibold">Date:</span> {date || <span className="text-slate-400">—</span>}</div>
          <div><span className="font-semibold">Clinic:</span> {clinic || <span className="text-slate-400">—</span>}</div>
          <div><span className="font-semibold">Status:</span> {status || <span className="text-slate-400">—</span>}</div>
          <div><span className="font-semibold">Notes:</span> {notes || <span className="text-slate-400">—</span>}</div>
        </div>
      </div>
    </div>
  );
}
