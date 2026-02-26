"use client";

const iconClass = "w-5 h-5 shrink-0";

export function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          <p className={`text-xs mt-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{change}% vs past month
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DonutChart({
  total,
  segments,
  size = 200,
  stroke = 28,
}: {
  total: number;
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  stroke?: number;
}) {
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 0.8;
  let offset = 0;
  const parts = segments.map((s) => {
    const pct = (s.value / sum) * 100;
    const start = offset;
    offset += pct + gap;
    return { ...s, pct, start };
  });
  const conic = parts
    .map(
      (p) =>
        `${p.color} ${p.start}%, ${p.color} ${p.start + p.pct}%, transparent ${p.start + p.pct}%, transparent ${Math.min(p.start + p.pct + gap, 100)}%`
    )
    .join(", ");
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 overflow-hidden">
      <div className="relative shrink-0 max-w-full" style={{ width: size, height: size, minWidth: 0 }}>
        <div
          className="rounded-full ring-2 ring-white shadow-md"
          style={{
            width: size,
            height: size,
            maxWidth: "100%",
            maxHeight: "100%",
            background: sum > 0 ? `conic-gradient(from 0deg, ${conic})` : "#e2e8f0",
          }}
        />
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-white shadow-inner"
          style={{ inset: stroke, width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <span className="text-xl font-bold text-slate-800 tabular-nums">{total.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Total</span>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 grid grid-cols-2 gap-2 overflow-hidden">
        {segments.map((s) => {
          const pct = ((s.value / sum) * 100).toFixed(1);
          return (
            <div
              key={s.label}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors min-w-0"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white"
                style={{ backgroundColor: s.color }}
              />
              <div className="min-w-0 overflow-hidden">
                <p className="font-medium text-slate-800 text-xs truncate">{s.label}</p>
                <p className="text-xs text-slate-500 truncate">
                  <span className="font-semibold text-slate-700 tabular-nums">{s.value.toLocaleString()}</span>
                  <span className="mx-0.5">·</span>
                  <span className="tabular-nums">{pct}%</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BarChart({
  items,
  max,
  barColor = "bg-blue-600",
}: {
  items: Array<{ role: string; count: number }>;
  max?: number;
  barColor?: string;
}) {
  const m = max ?? Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.role} className="flex items-center gap-3">
          <span className="w-24 text-sm text-slate-600 shrink-0 truncate">{item.role}</span>
          <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
            <div
              className={`h-full ${barColor} rounded transition-all`}
              style={{ width: `${(item.count / m) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-800 w-12 tabular-nums">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {action ?? <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">⋯</button>}
      </div>
      {children}
    </div>
  );
}
