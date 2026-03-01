"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";

export interface StaffRecord {
  id: string;
  staffCode: string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  department?: string;
  createdAt?: string;
}

interface RecentStaffProps {
  staff: StaffRecord[];
  allowCreate?: boolean;
  onAddStaff: () => void;
  onEditStaff: (s: StaffRecord) => void;
  onViewStaff?: (s: StaffRecord) => void;
}

const SORT_OPTS = [
  { value: "name", label: "Name A–Z" },
  { value: "id", label: "ID" },
];

const selectSmall = {
  control: (base: Record<string, unknown>) => ({ ...base, minHeight: "36px", borderColor: "#e2e8f0" }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export default function RecentStaff({ staff, allowCreate, onAddStaff, onEditStaff, onViewStaff }: RecentStaffProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [actionRowId, setActionRowId] = useState<string | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setActionRowId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let out = staff || [];
    if (q) {
      out = out.filter((s) => s.name.toLowerCase().includes(q) || s.staffCode.toLowerCase().includes(q) || (s.phone ?? "").toLowerCase().includes(q));
    }
    return [...out].sort((a, b) => (sortBy === "id" ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name)));
  }, [staff, searchQuery, sortBy]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold text-slate-800">Staff directory</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/staff/all")}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All &rarr;
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, code, phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="min-w-[140px]">
          <Select
            classNamePrefix="rs"
            options={SORT_OPTS}
            value={SORT_OPTS.find((o) => o.value === sortBy) ?? SORT_OPTS[0]}
            onChange={(opt) => setSortBy((opt?.value as "name" | "id") ?? "name")}
            styles={selectSmall}
          />
        </div>

        {allowCreate && (
          <button
            type="button"
            onClick={onAddStaff}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New staff
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
              <th className="pb-3 pt-4 px-4">Name</th>
              <th className="pb-3 pt-4 px-4">Role</th>
              <th className="pb-3 pt-4 px-4">Phone</th>
              <th className="pb-3 pt-4 px-4">Department</th>
              <th className="pb-3 pt-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  {searchQuery ? "No staff match your search." : "No staff yet."}
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.staffCode}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.role ?? "—"}</td>
                  <td className="py-3 px-4 text-slate-600">{s.phone ?? "—"}</td>
                  <td className="py-3 px-4 text-slate-600">{s.department ?? "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <div ref={actionRowId === s.id ? actionRef : null} className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setActionRowId(actionRowId === s.id ? null : s.id)}
                        className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Staff actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </button>
                      {actionRowId === s.id && (
                        <div className="absolute right-0 mt-1 w-40 origin-top-right rounded-lg border border-slate-200 bg-white shadow-lg z-30 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActionRowId(null);
                              onViewStaff && onViewStaff(s);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionRowId(null);
                              onEditStaff(s);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
