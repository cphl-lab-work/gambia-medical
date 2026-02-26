"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";
type InventoryProduct = {
  id: string;
  name: string;
  dosage?: string;
  category: string;
  batch: string;
  units: number;
  unitPrice: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  expiryDate: string;
};

const INVENTORY_PRODUCTS: InventoryProduct[] = [
  { id: "1", name: "Metformin", dosage: "850mg", category: "Antidiabetics", batch: "BT-2024-003", units: 35, unitPrice: 12.5, status: "Low Stock", expiryDate: "2025-06-15" },
  { id: "2", name: "Omeprazole", dosage: "20mg", category: "Gastrointestinal", batch: "BT-2024-007", units: 0, unitPrice: 8.99, status: "Out of Stock", expiryDate: "2025-08-22" },
  { id: "3", name: "Ciprofloxacin", dosage: "500mg", category: "Antibiotics", batch: "BT-2024-011", units: 22, unitPrice: 15.0, status: "Low Stock", expiryDate: "2025-09-10" },
  { id: "4", name: "Amlodipine", dosage: "5mg", category: "Cardiovascular", batch: "BT-2024-015", units: 120, unitPrice: 6.5, status: "In Stock", expiryDate: "2026-01-05" },
  { id: "5", name: "Paracetamol", dosage: "500mg", category: "Analgesics", batch: "BT-2024-019", units: 450, unitPrice: 3.2, status: "In Stock", expiryDate: "2026-03-20" },
  { id: "6", name: "Ibuprofen", dosage: "400mg", category: "Analgesics", batch: "BT-2024-021", units: 280, unitPrice: 4.5, status: "In Stock", expiryDate: "2025-11-12" },
  { id: "7", name: "Losartan", dosage: "50mg", category: "Cardiovascular", batch: "BT-2024-008", units: 18, unitPrice: 9.75, status: "Low Stock", expiryDate: "2025-07-30" },
  { id: "8", name: "Amoxicillin", dosage: "500mg", category: "Antibiotics", batch: "BT-2024-012", units: 95, unitPrice: 11.0, status: "In Stock", expiryDate: "2025-12-01" },
];

export default function PharmacyInventoryPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [products] = useState<InventoryProduct[]>(INVENTORY_PRODUCTS);
  const [filter, setFilter] = useState<string>("");

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

  const filtered = filter
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(filter.toLowerCase()) ||
          p.category.toLowerCase().includes(filter.toLowerCase()) ||
          p.batch.toLowerCase().includes(filter.toLowerCase())
      )
    : products;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Inventory · Products</h1>
            <p className="text-sm text-slate-500 mt-1">
              List of pharmacy inventory products. Search and filter by name, category, or batch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="search"
            placeholder="Search by name, category, or batch…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-slate-500">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Batch</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-700">Units</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-700">Unit price</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Expiry</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{p.name}</span>
                      {p.dosage && <span className="text-slate-500 ml-1">{p.dosage}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 text-slate-600">{p.batch}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">{p.units}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">${p.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.status === "Out of Stock"
                            ? "px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700"
                            : p.status === "Low Stock"
                              ? "px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                              : "px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-500">No products match your search.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
