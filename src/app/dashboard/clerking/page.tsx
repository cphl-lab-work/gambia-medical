"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getClerkingRecords, setClerkingRecords } from "@/helpers/local-storage";
import { canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import Link from "next/link";
import patientClerkingSeed from "@/seed/data/patient-clerking.json";
import { generateSeedRecords, TARGET_SEED_RECORDS } from "@/seed/clerking-seed";

/** Arrival sources from seed data. */
type ArrivalSourceSeed = { id: string; label: string; description?: string };
const SEED_ARRIVAL_SOURCES = (patientClerkingSeed as { arrivalSources?: ArrivalSourceSeed[] }).arrivalSources ?? [
  { id: "opd", label: "OPD", description: "Out-Patient Department" },
  { id: "emergency", label: "Emergency Department", description: "Emergency / A&E" },
  { id: "elective", label: "Elective Admission", description: "Planned admission" },
];

/** Countries and Uganda district metadata from seed. */
type CountrySeed = { code: string; name: string };
type UgandaDistrictSeed = { name: string; subCounties: string[] };

const SEED_COUNTRIES = (patientClerkingSeed as { countries?: CountrySeed[] }).countries ?? [
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "KE", name: "Kenya" },
];

const UGANDA_DISTRICTS =
  (patientClerkingSeed as { ugandaDistricts?: UgandaDistrictSeed[] }).ugandaDistricts ??
  ([] as UgandaDistrictSeed[]);

const STATUSES = [
  { value: "Pending assessment", label: "Pending assessment" },
  { value: "Assessed", label: "Assessed" },
  { value: "Admitted", label: "Admitted" },
];

const GENDERS = [
  { value: "", label: "Select..." },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

/** Country code + flag for phone input. */
const COUNTRY_CODES = [
  { code: "+255", flag: "🇹🇿", label: "Tanzania" },
  { code: "+254", flag: "🇰🇪", label: "Kenya" },
  { code: "+256", flag: "🇺🇬", label: "Uganda" },
  { code: "+250", flag: "🇷🇼", label: "Rwanda" },
  { code: "+234", flag: "🇳🇬", label: "Nigeria" },
  { code: "+27", flag: "🇿🇦", label: "South Africa" },
  { code: "+251", flag: "🇪🇹", label: "Ethiopia" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+49", flag: "🇩🇪", label: "Germany" },
  { code: "+33", flag: "🇫🇷", label: "France" },
  { code: "+86", flag: "🇨🇳", label: "China" },
  { code: "+81", flag: "🇯🇵", label: "Japan" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
];

function parsePhoneForForm(phone: string | null | undefined): { countryCode: string; localNumber: string } {
  if (!phone || !phone.trim()) return { countryCode: "+256", localNumber: "" };
  const s = phone.trim();
  if (!s.startsWith("+")) return { countryCode: "+256", localNumber: s };
  const found = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => s.startsWith(c.code));
  if (found) return { countryCode: found.code, localNumber: s.slice(found.code.length).replace(/^\s+/, "") };
  const m = s.match(/^(\+\d{1,4})(.*)$/);
  return m ? { countryCode: m[1], localNumber: m[2].replace(/^\s+/, "") } : { countryCode: "+256", localNumber: s };
}

interface ClerkingRecord {
  id: string;
  patientName: string;
  patientId: string | null;
  arrivalSource: string;
  dateOfArrival: string;
  timeOfArrival: string;
  status: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  district?: string | null;
  country?: string | null;
  address?: string | null;
  email?: string | null;
  recordedBy: string;
  createdAt: string;
}

function generateNewPatientId(existingRecords: ClerkingRecord[]): string {
  const year = new Date().getFullYear();
  const prefix = `OPD-${year}-`;
  const existing = existingRecords
    .map((r) => r.patientId)
    .filter((id): id is string => id != null && id.startsWith(prefix));
  const numbers = existing
    .map((id) => parseInt(id.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

const emptyForm = () => ({
  patientName: "",
  patientId: "",
  arrivalSource: "OPD",
  dateOfArrival: new Date().toISOString().slice(0, 10),
  timeOfArrival: new Date().toTimeString().slice(0, 5),
  status: "Pending assessment",
  phoneCountryCode: "+256",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
  nationality: "",
  district: "",
  country: "",
  address: "",
  email: "",
});

const SOURCE_COLORS: Record<string, string> = {
  OPD: "#3b82f6",
  "Emergency Department": "#ef4444",
  "Elective Admission": "#10b981",
};

const STATUS_COLORS: Record<string, string> = {
  "Pending assessment": "#f59e0b",
  Assessed: "#3b82f6",
  Admitted: "#10b981",
};

function DonutChart({
  total,
  segments,
  title,
}: {
  total: number;
  segments: Array<{ label: string; value: number; color: string }>;
  title: string;
}) {
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 0.8;
  let offset = 0;
  const parts = segments.map((s) => {
    const pct = (s.value / sum) * 100;
    const start = offset;
    offset += pct + gap;
    return { ...s, pct, start };
  });
  const conic = parts
    .map(
      (p) =>
        `${p.color} ${p.start}%, ${p.color} ${p.start + p.pct}%, transparent ${p.start + p.pct}%, transparent ${Math.min(p.start + p.pct + gap, 100)}%`
    )
    .join(", ");
  const size = 140;
  const stroke = 22;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <div
            className="rounded-full ring-2 ring-white shadow"
            style={{
              width: size,
              height: size,
              background: sum > 0 ? `conic-gradient(from 0deg, ${conic})` : "#e2e8f0",
            }}
          />
          <div
            className="absolute flex flex-col items-center justify-center rounded-full bg-white"
            style={{ inset: stroke, width: size - stroke * 2, height: size - stroke * 2 }}
          >
            <span className="text-lg font-bold text-slate-800 tabular-nums">{total}</span>
          </div>
        </div>
        <div className="flex-1 w-full min-w-0 space-y-2">
          {segments.map((s) => {
            const pct = sum > 0 ? ((s.value / sum) * 100).toFixed(1) : "0";
            return (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 truncate flex-1">{s.label}</span>
                <span className="text-xs font-medium text-slate-800 tabular-nums">{s.value}</span>
                <span className="text-xs text-slate-500 tabular-nums">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BarChartSection({
  items,
  title,
}: {
  items: Array<{ label: string; total: number; admitted: number }>;
  title: string;
}) {
  const m = Math.max(...items.map((i) => i.total), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-24 text-xs text-slate-600 shrink-0 truncate" title={item.label}>{item.label}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded transition-all"
                style={{ width: `${(item.total / m) * 100}%` }}
              />
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs font-medium text-slate-700 tabular-nums leading-tight">
                {item.total} total
              </span>
              <span className="text-[11px] text-emerald-700 tabular-nums leading-tight">
                {item.admitted} admitted
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClerkingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [records, setRecords] = useState<ClerkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClerkingRecord | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState("");
  const countryCodeRef = useRef<HTMLDivElement>(null);

  const [tableSearch, setTableSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterArrivalSource, setFilterArrivalSource] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMenuRowId, setActionMenuRowId] = useState<string | null>(null);
  const [detailsRecord, setDetailsRecord] = useState<ClerkingRecord | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryCodeRef.current && !countryCodeRef.current.contains(e.target as Node)) {
        setCountryCodeOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (actionMenuRef.current && actionMenuRef.current.contains(e.target as Node)) return;
      setActionMenuRowId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredRecords = records.filter((r) => {
    const q = tableSearch.toLowerCase().trim();
    if (q) {
      const matches =
        r.patientName.toLowerCase().includes(q) ||
        (r.patientId ?? "").toLowerCase().includes(q) ||
        (r.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, ""));
      if (!matches) return false;
    }
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterArrivalSource && r.arrivalSource !== filterArrivalSource) return false;
    return true;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return a.patientName.localeCompare(b.patientName, undefined, { sensitivity: "base" });
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRecords.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const copyId = (id: string | null, patientId: string | null) => {
    const text = patientId ?? id ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {});
    setActionMenuRowId(null);
  };

  const formatDateWithTime = (dateStr: string, timeStr: string) => {
    try {
      const d = new Date(dateStr);
      const month = d.toLocaleDateString("en-GB", { month: "short" });
      const day = d.getDate();
      return `${month} ${day} - ${timeStr}`;
    } catch {
      return `${dateStr} - ${timeStr}`;
    }
  };

  const openPanelWithSearch = () => {
    setForm((f) => ({ ...f, patientName: tableSearch.trim() || f.patientName }));
    openPanelForNew();
  };

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    const role = a.role;
    if (role !== "receptionist" && role !== "nurse") {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role, name: a.name });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    let stored = getClerkingRecords();
    if (stored.length === 0) {
      const seed = (patientClerkingSeed as { clerkingRecords?: Array<Record<string, unknown>> }).clerkingRecords ?? [];
      const base = seed.map((r) => ({
        id: String(r.id ?? ""),
        patientName: String(r.patientName ?? ""),
        patientId: r.patientId != null ? String(r.patientId) : null,
        arrivalSource: String(r.arrivalSource ?? ""),
        dateOfArrival: String(r.dateOfArrival ?? ""),
        timeOfArrival: String(r.timeOfArrival ?? ""),
        status: String(r.status ?? ""),
        phone: r.phone != null ? String(r.phone) : null,
        gender: r.gender != null ? String(r.gender) : null,
        dateOfBirth: r.dateOfBirth != null ? String(r.dateOfBirth) : null,
        nationality: r.nationality != null ? String(r.nationality) : null,
        district: r.district != null ? String(r.district) : null,
        country: r.country != null ? String(r.country) : null,
        address: r.address != null ? String(r.address) : null,
        email: r.email != null ? String(r.email) : null,
        recordedBy: String(r.recordedBy ?? (r.recordedAt ? "seed" : "receptionist")),
        createdAt: String(r.createdAt ?? r.recordedAt ?? new Date().toISOString()),
      })) as ClerkingRecord[];
      stored = generateSeedRecords(TARGET_SEED_RECORDS, base);
      setClerkingRecords(stored);
    }
    setRecords(stored);
    setLoading(false);
  }, [auth]);

  const openPanelForNew = () => {
    setEditingRecord(null);
    const base = emptyForm();
    setForm({ ...base, patientId: generateNewPatientId(records) });
    setMessage(null);
    setPanelOpen(true);
  };

  const openPanelForEdit = (record: ClerkingRecord) => {
    setEditingRecord(record);
    const { countryCode, localNumber } = parsePhoneForForm(record.phone);
    setForm({
      patientName: record.patientName,
      patientId: record.patientId ?? "",
      arrivalSource: record.arrivalSource,
      dateOfArrival: record.dateOfArrival,
      timeOfArrival: record.timeOfArrival,
      status: record.status,
      phoneCountryCode: countryCode,
      phoneNumber: localNumber,
      gender: record.gender ?? "",
      dateOfBirth: record.dateOfBirth ?? "",
      nationality: record.nationality ?? "",
      district: record.district ?? "",
      country: record.country ?? "",
      address: record.address ?? "",
      email: record.email ?? "",
    });
    setMessage(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingRecord(null);
    setForm(emptyForm());
    setMessage(null);
  };

  const handleDelete = (record: ClerkingRecord) => {
    if (!confirm(`Delete clerking record for ${record.patientName}?`)) return;
    const next = records.filter((r) => r.id !== record.id);
    setClerkingRecords(next);
    setRecords(next);
    setMessage({ type: "success", text: "Record deleted." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const a = getStoredAuth();
    const fullPhone = (form.phoneNumber || "").trim() ? form.phoneCountryCode + (form.phoneNumber || "").trim() : "";
    const now = new Date().toISOString();
    const record: ClerkingRecord = {
      id: editingRecord?.id ?? `clerk-${Date.now()}`,
      patientName: form.patientName.trim(),
      patientId: form.patientId.trim() || null,
      arrivalSource: form.arrivalSource,
      dateOfArrival: form.dateOfArrival,
      timeOfArrival: form.timeOfArrival,
      status: form.status,
      phone: fullPhone || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      nationality: form.nationality.trim() || null,
      district: form.district.trim() || null,
      country: form.country.trim() || null,
      address: form.address.trim() || null,
      email: form.email.trim() || null,
      recordedBy: a?.role ?? "receptionist",
      createdAt: editingRecord?.createdAt ?? now,
    };

    if (editingRecord) {
      const next = records.map((r) => (r.id === editingRecord.id ? record : r));
      setClerkingRecords(next);
      setRecords(next);
      setMessage({ type: "success", text: "Record updated." });
    } else {
      const next = [record, ...records];
      setClerkingRecords(next);
      setRecords(next);
      setForm(emptyForm());
      setMessage({ type: "success", text: "Patient clerking record saved." });
    }
    setTimeout(() => closePanel(), 1200);
    setSubmitting(false);
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const allowCreate = canCreate(auth.role, "patient_clerking");
  const allowUpdate = canUpdate(auth.role, "patient_clerking");
  const allowDelete = canDelete(auth.role, "patient_clerking");

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Patient Clerking</h1>
            <p className="text-sm text-slate-500 mt-1">
              take patients bio data and contacts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {allowCreate && (
              <button
                type="button"
                onClick={openPanelForNew}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                New patient clerking
              </button>
            )}
          </div>
        </div>

        {/* Charts */}
        {!loading && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DonutChart
              title="Arrivals by source"
              total={records.length}
              segments={SEED_ARRIVAL_SOURCES.map(({ label }) => ({
                label,
                value: records.filter((r) => r.arrivalSource === label).length,
                color: SOURCE_COLORS[label] ?? "#94a3b8",
              }))}
            />
            <DonutChart
              title="Status breakdown"
              total={records.length}
              segments={STATUSES.map(({ value }) => ({
                label: value,
                value: records.filter((r) => r.status === value).length,
                color: STATUS_COLORS[value] ?? "#94a3b8",
              }))}
            />
            <BarChartSection
              title="Last 7 days"
              items={(() => {
                const days: Array<{ label: string; total: number; admitted: number }> = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const key = d.toISOString().slice(0, 10);
                  const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
                  const daily = records.filter((r) => r.dateOfArrival === key);
                  days.push({
                    label,
                    total: daily.length,
                    admitted: daily.filter((r) => r.status === "Admitted").length,
                  });
                }
                const nonZero = days.filter((d) => d.total > 0);
                return nonZero.length ? nonZero : days;
              })()}
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Patients Admissions</h2>
            <Link href="/dashboard/clerking/all" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              See All →
            </Link>
          </div>

          <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Filter
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="">All</option>
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Arrival source</label>
                    <select
                      value={filterArrivalSource}
                      onChange={(e) => setFilterArrivalSource(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm"
                    >
                      <option value="">All</option>
                      {SEED_ARRIVAL_SOURCES.map((s) => (
                        <option key={s.id} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFilterStatus(""); setFilterArrivalSource(""); }}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            {allowCreate && (
              <button
                type="button"
                onClick={openPanelForNew}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New patient clerking
              </button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name")}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
            >
              <option value="newest">Newest to oldest</option>
              <option value="oldest">Oldest to newest</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">Loading…</div>
          ) : sortedRecords.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500 text-sm mb-4">
                {tableSearch.trim() || filterStatus || filterArrivalSource
                  ? "No patients found matching your search."
                  : "No records yet."}
              </p>
              {allowCreate && (
                <button
                  type="button"
                  onClick={openPanelWithSearch}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Add new patient
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider bg-slate-50/80">
                    <th className="py-3 pl-6 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={sortedRecords.length > 0 && selectedIds.size === sortedRecords.length}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">ID Number</th>
                    <th className="py-3 pr-4 font-medium">Date &amp; Time</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Recorded by</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.patientName}</td>
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-600">{r.patientId ?? "—"}</span>
                          {(r.patientId ?? r.id) && (
                            <button
                              type="button"
                              onClick={() => copyId(r.id, r.patientId)}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy ID"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{formatDateWithTime(r.dateOfArrival, r.timeOfArrival)}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.arrivalSource}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.recordedBy}</td>
                      <td className="py-3 pr-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: STATUS_COLORS[r.status] ?? "#64748b" }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[r.status] ?? "#94a3b8" }} />
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-right">
                        <div
                          ref={actionMenuRowId === r.id ? (el) => { actionMenuRef.current = el; } : undefined}
                          className="relative inline-block"
                        >
                          <button
                            type="button"
                            onClick={() => setActionMenuRowId(actionMenuRowId === r.id ? null : r.id)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                            aria-label="Actions"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                          {actionMenuRowId === r.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1">
                              <button
                                type="button"
                                onClick={() => { setDetailsRecord(r); setActionMenuRowId(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                View details
                              </button>
                              {allowUpdate && (
                                <button
                                  type="button"
                                  onClick={() => { openPanelForEdit(r); setActionMenuRowId(null); }}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                              )}
                              {(auth?.role === "nurse" || auth?.role === "doctor") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    router.push(`/dashboard/triage/${r.id}`);
                                    setActionMenuRowId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  Triage records
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => { copyId(r.id, r.patientId); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                Copy ID
                              </button>
                              {allowDelete && (
                                <button
                                  type="button"
                                  onClick={() => { handleDelete(r); setActionMenuRowId(null); }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View limited details modal */}
        {detailsRecord && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailsRecord(null)} aria-hidden />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setDetailsRecord(null)}>
              <div
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient details</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Name</dt>
                    <dd className="text-slate-800 mt-0.5">{detailsRecord.patientName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">ID Number</dt>
                    <dd className="text-slate-800 mt-0.5">{detailsRecord.patientId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Arrival source</dt>
                    <dd className="text-slate-800 mt-0.5">{detailsRecord.arrivalSource}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Date &amp; Time</dt>
                    <dd className="text-slate-800 mt-0.5">{formatDateWithTime(detailsRecord.dateOfArrival, detailsRecord.timeOfArrival)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Status</dt>
                    <dd className="mt-0.5">
                      <span className="inline-flex items-center gap-1.5" style={{ color: STATUS_COLORS[detailsRecord.status] ?? "#64748b" }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[detailsRecord.status] ?? "#94a3b8" }} />
                        {detailsRecord.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Phone</dt>
                    <dd className="text-slate-800 mt-0.5">{detailsRecord.phone ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Recorded by</dt>
                    <dd className="text-slate-800 mt-0.5">{detailsRecord.recordedBy}</dd>
                  </div>
                </dl>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDetailsRecord(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Side panel - covers content area when open */}
        {panelOpen && (
          <>
            <div
              className="fixed inset-0 !mt-0 bg-black/40 z-40"
              onClick={closePanel}
              aria-hidden
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl h-screen min-h-screen !mt-0 m-0 bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingRecord ? "Edit patient clerking" : "New patient clerking"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0">
                    Record simple patient details and arrival source.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 relative">
                <div className="flex-1 overflow-y-auto px-6 py-4 pb-28 min-h-0">
                  <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Patient name *</label>
                      <input
                        type="text"
                        required
                        value={form.patientName}
                        onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID / OPD number</label>
                      <input
                        type="text"
                        value={form.patientId}
                        onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Arrival source *</label>
                    <select
                      required
                      value={form.arrivalSource}
                      onChange={(e) => setForm((f) => ({ ...f, arrivalSource: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SEED_ARRIVAL_SOURCES.map((o) => (
                        <option key={o.id} value={o.label}>{o.description ? `${o.label} (${o.description})` : o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of arrival *</label>
                      <DatePicker
                        required
                        selected={form.dateOfArrival ? new Date(form.dateOfArrival) : null}
                        onChange={(d: Date | null) =>
                          setForm((f) => ({
                            ...f,
                            dateOfArrival: d ? d.toISOString().slice(0, 10) : "",
                          }))
                        }
                        dateFormat="yyyy-MM-dd"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Time of arrival *</label>
                      <input
                        type="time"
                        required
                        value={form.timeOfArrival}
                        onChange={(e) => setForm((f) => ({ ...f, timeOfArrival: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                    <select
                      required
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {STATUSES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">Simple patient details (optional)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-sm text-slate-600 mb-1">Phone</label>
                        <div ref={countryCodeRef} className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                          <div className="relative shrink-0 border-r border-slate-200 bg-slate-50 min-w-[120px]">
                            <button
                              type="button"
                              onClick={() => setCountryCodeOpen((o) => !o)}
                              className="w-full px-3 py-2 text-left text-sm text-slate-700 flex items-center justify-between gap-1"
                              title="Country code (searchable)"
                            >
                              <span>
                                {(() => {
                                  const c = COUNTRY_CODES.find((x) => x.code === form.phoneCountryCode);
                                  return c ? `${c.flag} ${c.code}` : form.phoneCountryCode;
                                })()}
                              </span>
                              <span className="text-slate-400">▾</span>
                            </button>
                            {countryCodeOpen && (
                              <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-hidden flex flex-col">
                                <input
                                  type="text"
                                  value={countryCodeSearch}
                                  onChange={(e) => setCountryCodeSearch(e.target.value)}
                                  placeholder="Search code or country"
                                  className="px-2 py-1.5 text-sm border-b border-slate-100 focus:outline-none focus:ring-0"
                                  autoFocus
                                />
                                <div className="overflow-auto flex-1">
                                  {COUNTRY_CODES.filter(
                                    (c) =>
                                      !countryCodeSearch.trim() ||
                                      c.code.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
                                      c.label.toLowerCase().includes(countryCodeSearch.toLowerCase())
                                  ).map((c) => (
                                    <button
                                      key={c.code}
                                      type="button"
                                      onClick={() => {
                                        setForm((f) => ({ ...f, phoneCountryCode: c.code }));
                                        setCountryCodeOpen(false);
                                        setCountryCodeSearch("");
                                      }}
                                      className="w-full px-2 py-1.5 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                                    >
                                      <span>{c.flag}</span>
                                      <span>{c.code}</span>
                                      <span className="text-slate-500">{c.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <input
                            type="tel"
                            value={form.phoneNumber}
                            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                            className="flex-1 min-w-0 border-0 px-3 py-2 focus:ring-0 focus:border-0"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Gender</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {GENDERS.map((o) => (
                            <option key={o.value || "x"} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Date of birth</label>
                        <DatePicker
                          selected={form.dateOfBirth ? new Date(form.dateOfBirth) : null}
                          onChange={(d) => setForm((f) => ({ ...f, dateOfBirth: d ? d.toISOString().slice(0, 10) : "" }))}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Select date"
                          isClearable
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Nationality</label>
                        <input
                          type="text"
                          value={form.nationality}
                          onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Country</label>
                        <select
                          value={form.country}
                          onChange={(e) => {
                            const value = e.target.value;
                            setForm((f) => ({
                              ...f,
                              country: value,
                              district: value === "Uganda" ? f.district : "",
                            }));
                          }}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        >
                          <option value="">Select country (optional)</option>
                          {SEED_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">District</label>
                        {form.country === "Uganda" ? (
                          <select
                            value={form.district}
                            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                          >
                            <option value="">Select district (optional)</option>
                            {UGANDA_DISTRICTS.map((d) => (
                              <option key={d.name} value={d.name}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={form.district}
                            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Optional"
                          />
                        )}
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm text-slate-600 mb-1">Address</label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Street, town, etc. (optional)"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm text-slate-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {message && (
                    <p className={`text-sm mb-3 ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                      {message.text}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 justify-end">
                    <button
                      type="button"
                      onClick={closePanel}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Saving…" : editingRecord ? "Update record" : "Save"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
