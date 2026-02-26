"use client";

import { useEffect, useState } from "react";
import { getStoredAuth } from "@/helpers/local-storage";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import BlankDashboard from "@/components/dashboard/BlankDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    setRole(auth?.role ?? null);
  }, []);

  return (
    <DashboardLayout>
      {role === "doctor" || role === "admin" ? <DoctorDashboard /> : <BlankDashboard role={role} />}
    </DashboardLayout>
  );
}
