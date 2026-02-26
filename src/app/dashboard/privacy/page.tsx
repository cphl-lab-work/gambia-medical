"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="text-xl font-semibold text-slate-800">Privacy & security</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <section>
            <h2 className="font-semibold text-slate-800 mb-2">Data we collect</h2>
            <p className="text-sm text-slate-600">
              MediLab360 collects only the data necessary to provide care and run operations: your profile (name, email, role), activity logs for audit, and patient data you create or access as permitted by your role.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800 mb-2">Access control</h2>
            <p className="text-sm text-slate-600">
              Patient data access is controlled by roles and permissions. Admins can configure which roles can view or edit demographics, clinical notes, lab results, prescriptions, and billing in Settings → Roles and permissions.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800 mb-2">Security</h2>
            <p className="text-sm text-slate-600">
              Sessions are stored securely. Always log out when leaving a shared device. Report any suspected breach to your system administrator.
            </p>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
