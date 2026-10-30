import React, { useEffect, useState } from 'react';
import { date, dateTime, rpc, rupees } from '../lib';
import { Badge, Card, ErrorText } from '../ui';

const AUTOPAY_ON = new Set(['authenticated', 'active', 'pending']);

const Billing = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    rpc('admin_billing', { p_limit: 200 }).then(setData, (e) => setError(e.message));
  }, []);

  if (error) return <ErrorText error={error} />;
  if (!data) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <Card title={`UPI Autopay subscriptions (${data.subscriptions.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2 pr-3">Member</th><th className="py-2 pr-3">Plan</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Paid until</th><th className="py-2">Subscription</th></tr>
            </thead>
            <tbody>
              {data.subscriptions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 break-all">{s.email}</td>
                  <td className="py-2 pr-3">{s.plan}</td>
                  <td className="py-2 pr-3"><Badge tone={AUTOPAY_ON.has(s.status) ? 'green' : s.status === 'halted' ? 'red' : 'slate'}>{s.status}</Badge></td>
                  <td className="py-2 pr-3 whitespace-nowrap">{date(s.current_end)}</td>
                  <td className="py-2 text-slate-500">{s.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.subscriptions.length === 0 && <p className="text-sm text-slate-500">No subscriptions yet.</p>}
        </div>
      </Card>
      <Card title={`Payments (latest ${data.payments.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2 pr-3">When</th><th className="py-2 pr-3">Member</th><th className="py-2 pr-3">Amount</th><th className="py-2 pr-3">Type</th><th className="py-2">Payment</th></tr>
            </thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 whitespace-nowrap">{dateTime(p.created_at)}</td>
                  <td className="py-2 pr-3 break-all">{p.email}</td>
                  <td className="py-2 pr-3 tabular-nums">{rupees(p.amount_paise)}</td>
                  <td className="py-2 pr-3">{p.plan} · {p.subscription_id ? 'Autopay' : 'one-time'}</td>
                  <td className="py-2 text-slate-500">{p.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.payments.length === 0 && <p className="text-sm text-slate-500">No payments yet.</p>}
        </div>
      </Card>
    </div>
  );
};

export default Billing;
