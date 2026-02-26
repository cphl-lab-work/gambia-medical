"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import Link from "next/link";

const ACTIVITIES = [
  { id: "1", action: "Logged in", detail: "Dashboard", at: "2025-02-26T09:00:00", icon: "login" },
  { id: "2", action: "Viewed patient clerking", detail: "James Okello", at: "2025-02-26T09:15:00", icon: "view" },
  { id: "3", action: "Updated clerking record", detail: "OPD arrival", at: "2025-02-26T09:22:00", icon: "edit" },
  { id: "4", action: "Viewed appointments", detail: "Appointments list", at: "2025-02-26T09:30:00", icon: "view" },
  { id: "5", action: "Marked appointment paid", detail: "Mary Akinyi", at: "2025-02-26T09:45:00", icon: "edit" },
  { id: "6", action: "Logged in", detail: "Dashboard", at: "2025-02-25T08:00:00", icon: "login" },
  { id: "7", action: "Viewed reports", detail: "Transactions report", at: "2025-02-25T14:20:00", icon: "view" },
];

function formatActivityDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return `Today ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

export default function ActivityPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<ReturnType<typeof getStoredAuth>>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuth(a);
  }, [router]);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Activity log</h1>
            <p className="text-sm text-slate-500 mt-1">Your recent activity across the system.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <ul className="space-y-0">
            {ACTIVITIES.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-4 border-b border-slate-100 last:border-0">
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  {item.icon === "login" ? "🔐" : item.icon === "edit" ? "✎" : "👁"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.action}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatActivityDate(item.at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
