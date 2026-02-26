"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import Link from "next/link";

const FAQ = [
  { q: "How do I book an appointment for a patient?", a: "Go to Appointments, click Book appointment, fill patient details and fee. The patient then pays at the accountant; after payment you can allocate date and doctor." },
  { q: "Where do I record patient clerking?", a: "Go to Patient clerking. Use New patient clerking to add a record (arrival source, date/time, status). Only receptionist and nurse can create or edit." },
  { q: "How do I see who can access patient data?", a: "Go to Settings → Roles and permissions. There you can see (or, as admin, change) which roles can view and edit demographics, clinical notes, lab results, prescriptions, and billing." },
  { q: "How do I switch to another role?", a: "Click your avatar → Switch profile, then choose the profile. Useful for testing different roles." },
];

export default function HelpPage() {
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
          <h1 className="text-xl font-semibold text-slate-800">Help center</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Frequently asked questions</h2>
          <ul className="space-y-4">
            {FAQ.map((item, i) => (
              <li key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                <p className="font-medium text-slate-800 text-sm">{item.q}</p>
                <p className="text-sm text-slate-600 mt-1">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
