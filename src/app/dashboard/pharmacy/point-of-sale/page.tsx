"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";
type SaleItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
};

const SAMPLE_CART: SaleItem[] = [
  { id: "1", name: "Paracetamol 500mg", qty: 2, unitPrice: 3.2 },
  { id: "2", name: "Amoxicillin 500mg", qty: 1, unitPrice: 11.0 },
  { id: "3", name: "Omeprazole 20mg", qty: 1, unitPrice: 8.99 },
];

export default function PharmacyPointOfSalePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [cart] = useState<SaleItem[]>(SAMPLE_CART);

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

  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const tax = 0; // or e.g. subtotal * 0.05
  const total = subtotal + tax;

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Point of Sale</h1>
            <p className="text-sm text-slate-500 mt-1">
              Process sales and view total amount to sell for the current transaction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80">
              <h2 className="font-medium text-slate-800">Current sale</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Item</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Qty</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Unit price</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((i) => (
                    <tr key={i.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-800">{i.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{i.qty}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">${i.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-800">
                        ${(i.qty * i.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-medium text-slate-800 mb-4">Total amount to sell</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="tabular-nums">${tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-slate-200 font-semibold text-slate-800 text-lg">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Total amount to sell for this transaction. Complete sale to record payment.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
