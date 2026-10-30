import React, { useEffect, useState } from 'react';
import { rpc, rupees } from '../lib';
import { ErrorText } from '../ui';

const Stat = ({ label, value, hint }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    rpc('admin_stats').then(setStats, (e) => setError(e.message));
  }, []);

  if (error) return <ErrorText error={error} />;
  if (!stats) return <p className="text-slate-500">Loading…</p>;

  const conversion = stats.users ? Math.round((stats.pro / stats.users) * 100) : 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Members" value={stats.users.toLocaleString('en-IN')} hint={`${stats.signups7d} joined in the last 7 days`} />
      <Stat label="Active in the last 7 days" value={stats.active7d.toLocaleString('en-IN')} />
      <Stat label="Pro members" value={stats.pro.toLocaleString('en-IN')} hint={`${conversion}% of members`} />
      <Stat label="UPI Autopay subscriptions" value={stats.autopay.toLocaleString('en-IN')} hint="Active, authenticated or pending" />
      <Stat label="Revenue, last 30 days" value={rupees(stats.revenue30dPaise)} />
      <Stat label="Revenue, all time" value={rupees(stats.revenueTotalPaise)} />
      <Stat label="Connections made" value={stats.connections.toLocaleString('en-IN')} />
    </div>
  );
};

export default Dashboard;
