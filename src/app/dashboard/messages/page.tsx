"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import Link from "next/link";

const MESSAGES = [
  { id: "1", sender: "Lab Results", time: "10:32 AM", message: "Blood work for John Doe is ready for review.", initial: "L", unread: true, date: "Today" },
  { id: "2", sender: "Appointments", time: "9:15 AM", message: "Reminder: Patient Sarah – 2:00 PM today.", initial: "A", unread: true, date: "Today" },
  { id: "3", sender: "Dr. Nazar Becks", time: "4:45 PM", message: "Please send over the latest lab reports when you can.", initial: "N", unread: false, date: "Yesterday" },
  { id: "4", sender: "Pharmacy", time: "11:20 AM", message: "Prescription #8821 is ready for pickup.", initial: "P", unread: false, date: "Yesterday" },
];

export default function MessagesPage() {
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
            <h1 className="text-xl font-semibold text-slate-800">Messages</h1>
            <p className="text-sm text-slate-500 mt-1">Your messages and notifications.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {MESSAGES.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 px-4 py-4 hover:bg-slate-50 ${m.unread ? "bg-blue-50/50" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {m.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800 truncate">{m.sender}</span>
                  <span className="text-xs text-slate-400 shrink-0">{m.date} · {m.time}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{m.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
