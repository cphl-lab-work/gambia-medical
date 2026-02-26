"use client";

import { useEffect, useState } from "react";
import { getStoredAuth } from "@/helpers/local-storage";
import DashboardLayout from "@/components/DashboardLayout";
import { getDashboardForRole } from "@/components/dashboard";

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    setRole(auth?.role ?? null);
  }, []);

  const Dashboard = getDashboardForRole(role);

  return (
    <DashboardLayout>
      <Dashboard role={role} />
    </DashboardLayout>
  );
}
