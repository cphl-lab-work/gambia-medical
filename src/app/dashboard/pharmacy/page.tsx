"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";
import { DonutChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

function SummaryCard({
  title,
  value,
  subtitle,
  subtitleAlert,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleAlert?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${subtitleAlert ? "text-red-600" : "text-emerald-600"}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  const max = data.length ? Math.max(...data.map((d) => d.value), 1) : 1;
  const formatCurrency = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
        No revenue data for this period.
      </div>
    );
  }
  return (
    <div className="h-56 flex flex-col">
      <div className="flex items-end flex-1 gap-1.5 min-h-0 pt-6">
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1 min-w-0 group"
            >
              <span className="text-[10px] font-medium text-slate-500 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                {formatCurrency(d.value)}
              </span>
              <div className="w-full flex-1 flex flex-col justify-end min-h-[60px]">
                <div
                  className="w-full max-w-[40px] mx-auto rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all min-h-[4px] shadow-sm"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                  title={`${d.monthLabel}: ${formatCurrency(d.value)}`}
                />
              </div>
              <span className="text-xs text-slate-500 font-medium truncate w-full text-center">
                {d.monthLabel}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 px-0.5 text-[10px] text-slate-400">
        <span>{formatCurrency(0)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}

const STOCK_ALERTS = [
  { name: "Metformin 850mg", category: "Antidiabetics", batch: "BT-2024-003", units: 35, status: "Low Stock" as const },
  { name: "Omeprazole 20mg", category: "Gastrointestinal", batch: "BT-2024-007", units: 0, status: "Out of Stock" as const },
  { name: "Ciprofloxacin 500mg", category: "Antibiotics", batch: "BT-2024-011", units: 22, status: "Low Stock" as const },
];

const RECENT_PRESCRIPTIONS = [
  { patient: "John Smith", doctor: "Dr. Sarah Wilson", drugCount: 2, status: "Pending" as const },
  { patient: "Mary Johnson", doctor: "Dr. Sarah Wilson", drugCount: 1, status: "Dispensed" as const },
  { patient: "Robert Davis", doctor: "Dr. James Lee", drugCount: 3, status: "Partial" as const },
];

type RevenuePoint = { month: string; monthLabel: string; value: number; year: number };

const ALL_MONTHLY_REVENUE: RevenuePoint[] = [
  { month: "2024-07", monthLabel: "Jul 24", value: 14000, year: 2024 },
  { month: "2024-08", monthLabel: "Aug 24", value: 16500, year: 2024 },
  { month: "2024-09", monthLabel: "Sep 24", value: 18200, year: 2024 },
  { month: "2024-10", monthLabel: "Oct 24", value: 20500, year: 2024 },
  { month: "2024-11", monthLabel: "Nov 24", value: 22800, year: 2024 },
  { month: "2024-12", monthLabel: "Dec 24", value: 25200, year: 2024 },
  { month: "2025-01", monthLabel: "Jan 25", value: 23800, year: 2025 },
  { month: "2025-02", monthLabel: "Feb 25", value: 26100, year: 2025 },
  { month: "2025-03", monthLabel: "Mar 25", value: 27500, year: 2025 },
  { month: "2025-04", monthLabel: "Apr 25", value: 28900, year: 2025 },
  { month: "2025-05", monthLabel: "May 25", value: 30200, year: 2025 },
  { month: "2025-06", monthLabel: "Jun 25", value: 31800, year: 2025 },
];

const DRUG_CATEGORIES = [
  { label: "Antibiotics", value: 280, color: "#93c5fd" },
  { label: "Cardiovascular", value: 220, color: "#fdba74" },
  { label: "Analgesics", value: 190, color: "#60a5fa" },
  { label: "Antidiabetics", value: 150, color: "#22c55e" },
  { label: "Gastrointestinal", value: 120, color: "#a78bfa" },
  { label: "Other", value: 288, color: "#94a3b8" },
];

type RevenueFilter = "last6" | "last12" | "2024" | "2025";

function filterRevenue(data: RevenuePoint[], filter: RevenueFilter): RevenuePoint[] {
  switch (filter) {
    case "last6":
      return data.slice(-6);
    case "last12":
      return data.slice(-12);
    case "2024":
      return data.filter((d) => d.year === 2024);
    case "2025":
      return data.filter((d) => d.year === 2025);
    default:
      return data.slice(-6);
  }
}

export default function PharmacyPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>("last6");

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "pharmacy")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const totalDrugsInCategories = DRUG_CATEGORIES.reduce((s, x) => s + x.value, 0);
  const filteredRevenue = filterRevenue(ALL_MONTHLY_REVENUE, revenueFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Pharmacy</h1>
            <p className="text-sm text-slate-500 mt-1">
              Drug inventory, sales, prescriptions, and stock alerts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Drugs"
            value="1,248"
            subtitle="+12 this week"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <SummaryCard
            title="Today's Sales"
            value="$847.50"
            subtitle="+8.2% vs yesterday"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SummaryCard
            title="Pending Rx (Prescriptions)"
            value="12"
            subtitle="3 urgent"
            subtitleAlert
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <SummaryCard
            title="Low Stock Alerts"
            value="8"
            subtitle="5 expiring soon"
            subtitleAlert
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection
            title="Monthly Revenue"
            action={
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value as RevenueFilter)}
                className="text-xs rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by period"
              >
                <option value="last6">Last 6 months</option>
                <option value="last12">Last 12 months</option>
                <option value="2024">Year 2024</option>
                <option value="2025">Year 2025</option>
              </select>
            }
          >
            <RevenueBarChart data={filteredRevenue} />
          </DashboardSection>
          <DashboardSection title="Drug Categories">
            <DonutChart total={totalDrugsInCategories} segments={DRUG_CATEGORIES} size={160} stroke={22} />
          </DashboardSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection
            title="Stock Alerts"
            action={
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            }
          >
            <ul className="space-y-3">
              {STOCK_ALERTS.map((item) => (
                <li
                  key={item.name + item.batch}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.category} · Batch: {item.batch}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-slate-600 tabular-nums">{item.units} units</span>
                    <span
                      className={
                        item.status === "Out of Stock"
                          ? "px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700"
                          : "px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                      }
                    >
                      {item.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </DashboardSection>

          <DashboardSection
            title="Recent Prescriptions"
            action={
              <span className="p-1.5 rounded-lg text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            }
          >
            <ul className="space-y-3">
              {RECENT_PRESCRIPTIONS.map((item) => (
                <li
                  key={item.patient + item.doctor}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{item.patient}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.doctor} · {item.drugCount} drug(s)
                    </p>
                  </div>
                  <span
                    className={
                      item.status === "Pending"
                        ? "px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                        : item.status === "Dispensed"
                          ? "px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                          : "px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
                    }
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </DashboardSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
