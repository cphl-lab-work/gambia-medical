export default function BlankDashboard({ role }: { role: string | null }) {
  const label = role ? role.replace("_", " ") : "User";
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        <p className="text-lg">{label} dashboard</p>
        <p className="text-sm mt-2">Content coming soon.</p>
      </div>
    </div>
  );
}
