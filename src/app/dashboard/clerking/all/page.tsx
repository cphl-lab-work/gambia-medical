"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getClerkingRecords, setClerkingRecords } from "@/helpers/local-storage";
import patientClerkingSeed from "@/seed/data/patient-clerking.json";
import { generateSeedRecords, TARGET_SEED_RECORDS } from "@/seed/clerking-seed";

type ArrivalSourceSeed = { id: string; label: string; description?: string };
const SEED_ARRIVAL_SOURCES = (patientClerkingSeed as { arrivalSources?: ArrivalSourceSeed[] }).arrivalSources ?? [];

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
  recordedBy: string;
  createdAt: string;
}

const STATUSES = [
  { value: "Pending assessment", label: "Pending assessment" },
  { value: "Assessed", label: "Assessed" },
  { value: "Admitted", label: "Admitted" },
];

const STATUS_COLORS: Record<string, string> = {
  "Pending assessment": "#f59e0b",
  Assessed: "#3b82f6",
  Admitted: "#10b981",
};

function formatDateWithTime(dateStr: string, timeStr: string) {
  try {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString("en-GB", { month: "short" });
    const day = d.getDate();
    return `${month} ${day} - ${timeStr}`;
  } catch {
    return `${dateStr} - ${timeStr}`;
  }
}

const PAGE_SIZE = 10;

export default function AllClerkingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [records, setRecords] = useState<ClerkingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterArrivalSource, setFilterArrivalSource] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);

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
        recordedBy: String(r.recordedBy ?? (r.recordedAt ? "seed" : "receptionist")),
        createdAt: String(r.createdAt ?? r.recordedAt ?? new Date().toISOString()),
      })) as ClerkingRecord[];
      stored = generateSeedRecords(TARGET_SEED_RECORDS, base);
      setClerkingRecords(stored);
    }
    setRecords(stored);
    setLoading(false);
  }, [auth]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records
      .filter((r) => {
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
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return a.patientName.localeCompare(b.patientName, undefined, { sensitivity: "base" });
      });
  }, [records, search, filterStatus, filterArrivalSource, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleExportCsv = () => {
    const rows = filtered.length ? filtered : records;
    if (!rows.length) return;
    const header = ["Name", "ID Number", "Date", "Time", "Type", "Status"];
    const csvRows = rows.map((r) => [
      r.patientName,
      r.patientId ?? "",
      r.dateOfArrival,
      r.timeOfArrival,
      r.arrivalSource,
      r.status,
    ]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const body = [header, ...csvRows].map((row) => row.map((v) => escape(String(v ?? ""))).join(",")).join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient-clerking.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (typeof window === "undefined") return;
    const rows = filtered.length ? filtered : records;
    const htmlRows = rows
      .map(
        (r) =>
          `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${r.patientName}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${r.patientId ?? ""}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${formatDateWithTime(
              r.dateOfArrival,
              r.timeOfArrival
            )}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${r.arrivalSource}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e5e7eb;">${r.status}</td>
          </tr>`
      )
      .join("");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!doctype html>
      <html>
      <head>
        <meta charSet="utf-8" />
        <title>Patient clerking</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; color: #0f172a; }
          h1 { font-size: 16px; margin-bottom: 12px; }
          table { border-collapse: collapse; width: 100%; }
          th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
        </style>
      </head>
      <body>
        <h1>Patient clerking list</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID Number</th>
              <th>Date &amp; Time</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${htmlRows}
          </tbody>
        </table>
      </body>
      </html>`);
    win.document.close();
    win.focus();
    win.print();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">All patient admissions</h1>
            <p className="text-sm text-slate-500 mt-1">Limited view of all recorded patient clerking records.</p>
          </div>
          <Link
            href="/dashboard/clerking"
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={filterArrivalSource}
                onChange={(e) => {
                  setFilterArrivalSource(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
              >
                <option value="">All types</option>
                {SEED_ARRIVAL_SOURCES.map((s) => (
                  <option key={s.id} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Export to Excel
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Export to PDF
              </button>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as "newest" | "oldest" | "name");
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
              >
                <option value="newest">Newest to oldest</option>
                <option value="oldest">Oldest to newest</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">Loading…</div>
          ) : !filtered.length ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No patient clerking records found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider bg-slate-50/80">
                      <th className="py-3 pl-6 pr-4 font-medium">Name</th>
                      <th className="py-3 pr-4 font-medium">ID Number</th>
                      <th className="py-3 pr-4 font-medium">Date &amp; Time</th>
                      <th className="py-3 pr-4 font-medium">Type</th>
                      <th className="py-3 pr-6 font-medium text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="py-3 pl-6 pr-4 font-medium text-slate-800">{r.patientName}</td>
                        <td className="py-3 pr-4 text-slate-600">{r.patientId ?? "—"}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatDateWithTime(r.dateOfArrival, r.timeOfArrival)}</td>
                        <td className="py-3 pr-4 text-slate-600">{r.arrivalSource}</td>
                        <td className="py-3 pr-6">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: STATUS_COLORS[r.status] ?? "#64748b" }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[r.status] ?? "#94a3b8" }}
                            />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
                <div>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{filtered.length}</span> patients
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Prev
                  </button>
                  <span>
                    Page{" "}
                    <span className="font-semibold text-slate-700">
                      {currentPage}
                    </span>{" "}
                    of <span className="font-semibold text-slate-700">{totalPages}</span>
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

