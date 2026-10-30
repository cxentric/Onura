import React, { useEffect, useState } from 'react';
import { dateTime, supabase } from '../lib';
import { Card, ErrorText, inputClass } from '../ui';

const compact = (value) => (value == null ? '' : JSON.stringify(value));

const AuditLog = ({ role }) => {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase
      .from('audit_log')
      .select('*')
      .order('id', { ascending: false })
      .limit(500)
      .then(({ data, error: err }) => (err ? setError(err.message) : setRows(data)));
  }, []);

  if (error) return <ErrorText error={error} />;
  if (!rows) return <p className="text-slate-500">Loading…</p>;

  const needle = filter.trim().toLowerCase();
  const shown = rows.filter((r) => !needle || [r.action, r.target, r.actor_email, r.reason].some((v) => v?.toLowerCase().includes(needle)));

  return (
    <Card title={role === 'super_admin' ? 'Every admin action (latest 500)' : 'Your actions (latest 500)'}>
      <p className="text-sm text-slate-600 mb-3">The log can’t be edited or deleted by anyone, including the super admin.</p>
      <input type="search" placeholder="Filter by action, person, target or reason" className={`${inputClass} mb-3`} value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Who</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Change</th><th className="py-2">Reason</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">{dateTime(r.created_at)}</td>
                <td className="py-2 pr-3 break-all">{r.actor_email || 'system'}</td>
                <td className="py-2 pr-3"><span className="font-mono text-xs">{r.action}</span><br /><span className="text-slate-500 break-all">{r.target}</span></td>
                <td className="py-2 pr-3 font-mono text-xs text-slate-600 max-w-xs break-all">
                  {r.before != null && <div>before: {compact(r.before)}</div>}
                  {r.after != null && <div>after: {compact(r.after)}</div>}
                </td>
                <td className="py-2 text-slate-700">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="text-sm text-slate-500">Nothing to show.</p>}
      </div>
    </Card>
  );
};

export default AuditLog;
