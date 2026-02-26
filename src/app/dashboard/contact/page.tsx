"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
export default function ContactPage() {
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
          <h1 className="text-xl font-semibold text-slate-800">Contact us</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <section>
            <h2 className="font-semibold text-slate-800 mb-2">System administrator</h2>
            <p className="text-sm text-slate-600">Dr. Sarah Johnson</p>
            <a href="mailto:admin@medilab360.com" className="text-sm text-blue-600 hover:underline">admin@medilab360.com</a>
            <p className="text-sm text-slate-600 mt-1"><a href="tel:+256700123456" className="text-blue-600 hover:underline">+256 700 123 456</a></p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800 mb-2">IT support</h2>
            <p className="text-sm text-slate-600">For technical issues with MediLab360.</p>
            <a href="mailto:support@medilab360.com" className="text-sm text-blue-600 hover:underline">support@medilab360.com</a>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
