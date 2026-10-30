import React, { useCallback, useEffect, useState } from 'react';
import { industryById, roleById } from '../../../src/data/kb';
import { ROLE_LABELS, can, date, dateTime, rpc, rupees, serverAction } from '../lib';
import { Badge, Button, Card, ErrorText, Field, inputClass, useReason } from '../ui';

const PAGE = 50;
const AUTOPAY_ON = new Set(['authenticated', 'active', 'pending']);

const planBadge = (user) =>
  user.proUntil && new Date(user.proUntil) > new Date() ? <Badge tone="green">Pro to {date(user.proUntil)}</Badge> : <Badge>Free</Badge>;

const UserDetail = ({ userId, role, me, onChanged, onClose }) => {
  const askReason = useReason();
  const [user, setUser] = useState(null);
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const manage = can(role, 'manageUsers');

  const load = useCallback(() => rpc('admin_user_detail', { p_user_id: userId }).then(setUser, (e) => setError(e.message)), [userId]);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (title, action, options = {}) => {
    const reason = await askReason({ title, ...options });
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      await action(reason);
      await load();
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return <Card title="Member">{error ? <ErrorText error={error} /> : <p className="text-slate-500">Loading…</p>}</Card>;

  const isPro = user.proUntil && new Date(user.proUntil) > new Date();
  const goal = user.progress?.goal;
  const activeSub = user.subscriptions.find((s) => AUTOPAY_ON.has(s.status));

  return (
    <Card title={user.name || user.email} actions={<Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}>
      <div className="space-y-5 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <dt className="text-slate-500">Email</dt><dd className="break-all">{user.email}</dd>
          <dt className="text-slate-500">Signed up</dt><dd>{dateTime(user.createdAt)} {user.provider && `(${user.provider})`}</dd>
          <dt className="text-slate-500">Last sign-in</dt><dd>{dateTime(user.lastSignInAt)}</dd>
          <dt className="text-slate-500">Plan</dt><dd>{isPro ? `Pro until ${date(user.proUntil)}` : 'Free'}</dd>
          <dt className="text-slate-500">Status</dt><dd>{user.blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>}</dd>
          <dt className="text-slate-500">Connections</dt><dd>{user.connections}</dd>
          {user.adminRole && (<><dt className="text-slate-500">Admin role</dt><dd>{ROLE_LABELS[user.adminRole]}</dd></>)}
        </dl>

        <div>
          <h3 className="font-medium text-slate-800 mb-1">Learning (Pro sync)</h3>
          {user.progress ? (
            <p className="text-slate-700">
              Goal: {goal ? `${roleById[goal.role]?.name || goal.role} in ${industryById[goal.industry]?.name || goal.industry}` : 'not set'} ·{' '}
              {user.progress.xp} XP · streak {user.progress.streak?.current ?? 0} (best {user.progress.streak?.best ?? 0}) · {user.progress.answered} questions answered
            </p>
          ) : (
            <p className="text-slate-500">Not synced. Free members’ progress stays on their device.</p>
          )}
        </div>

        <div>
          <h3 className="font-medium text-slate-800 mb-1">Subscriptions</h3>
          {user.subscriptions.length === 0 && <p className="text-slate-500">None</p>}
          {user.subscriptions.map((s) => (
            <p key={s.id} className="text-slate-700">
              {s.id} · {s.plan} · <Badge tone={AUTOPAY_ON.has(s.status) ? 'green' : 'slate'}>{s.status}</Badge> · next {date(s.current_end)}
            </p>
          ))}
        </div>

        <div>
          <h3 className="font-medium text-slate-800 mb-1">Payments</h3>
          {user.payments.length === 0 && <p className="text-slate-500">None</p>}
          {user.payments.map((p) => (
            <p key={p.id} className="text-slate-700">{dateTime(p.created_at)} · {rupees(p.amount_paise)} · {p.plan} · {p.subscription_id ? 'Autopay' : 'one-time'} · {p.id}</p>
          ))}
        </div>

        {manage && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="font-medium text-slate-800">Actions</h3>
            <div className="flex flex-wrap items-end gap-2">
              <Field label="Give Pro (days)">
                <input type="number" min={1} max={3650} value={days} onChange={(e) => setDays(Number(e.target.value))} className={`${inputClass} w-28`} />
              </Field>
              <Button
                disabled={busy || !(days > 0)}
                onClick={() =>
                  run(`Give ${user.name || user.email} ${days} days of Pro?`, (reason) => {
                    const from = isPro ? new Date(user.proUntil) : new Date();
                    return rpc('admin_set_pro_until', { p_user_id: user.id, p_until: new Date(from.getTime() + days * 86400000).toISOString(), p_reason: reason });
                  }, { confirmLabel: 'Give Pro' })
                }
              >
                Give Pro
              </Button>
              {isPro && (
                <Button variant="secondary" disabled={busy} onClick={() => run('End Pro now?', (reason) => rpc('admin_set_pro_until', { p_user_id: user.id, p_until: new Date().toISOString(), p_reason: reason }), { danger: true, confirmLabel: 'End Pro' })}>
                  End Pro now
                </Button>
              )}
              {activeSub && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => run('Cancel this member’s Autopay?', (reason) => serverAction('user-action', { userId: user.id, action: 'cancel_autopay', subscriptionId: activeSub.id, reason }), {
                    detail: 'No more automatic debits. Pro continues until the end of the period already paid for.',
                    danger: true,
                    confirmLabel: 'Cancel Autopay',
                  })}
                >
                  Cancel Autopay
                </Button>
              )}
              {user.adminRole !== 'super_admin' && user.id !== me.id && (
                <Button
                  variant={user.blocked ? 'secondary' : 'danger'}
                  disabled={busy}
                  onClick={() =>
                    run(user.blocked ? 'Unblock this account?' : 'Block this account?', (reason) => serverAction('user-action', { userId: user.id, action: user.blocked ? 'unblock' : 'block', reason }), {
                      detail: user.blocked ? 'They will be able to sign in again.' : 'They won’t be able to sign in. Their current session ends within the hour.',
                      danger: !user.blocked,
                      confirmLabel: user.blocked ? 'Unblock' : 'Block',
                    })
                  }
                >
                  {user.blocked ? 'Unblock' : 'Block'}
                </Button>
              )}
            </div>
            <ErrorText error={error} />
          </div>
        )}
      </div>
    </Card>
  );
};

const Users = ({ role, me }) => {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(
    () => rpc('admin_list_users', { p_search: search, p_limit: PAGE, p_offset: offset }).then(setData, (e) => setError(e.message)),
    [search, offset]
  );
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      <Card className="xl:col-span-3" title={data ? `${data.total.toLocaleString('en-IN')} members` : 'Members'}>
        <input
          type="search"
          placeholder="Search by email or name"
          className={`${inputClass} mb-3`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />
        <ErrorText error={error} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2 pr-3">Member</th><th className="py-2 pr-3">Joined</th><th className="py-2 pr-3">Plan</th><th className="py-2">Status</th></tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id} onClick={() => setSelected(u.id)} className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${selected === u.id ? 'bg-blue-50' : ''}`}>
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-800">{u.name || '—'}</p>
                    <p className="text-slate-500 break-all">{u.email}</p>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{date(u.createdAt)}</td>
                  <td className="py-2 pr-3">{planBadge(u)} {u.autopay && <Badge tone="blue">Autopay {u.autopay}</Badge>}</td>
                  <td className="py-2">
                    {u.blocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="green">Active</Badge>} {u.adminRole && <Badge tone="purple">{ROLE_LABELS[u.adminRole]}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.total > PAGE && (
          <div className="flex items-center justify-between mt-3 text-sm text-slate-600">
            <span>{offset + 1}–{Math.min(offset + PAGE, data.total)} of {data.total}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={offset === 0} onClick={() => setOffset(offset - PAGE)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={offset + PAGE >= data.total} onClick={() => setOffset(offset + PAGE)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
      <div className="xl:col-span-2">
        {selected ? (
          <UserDetail key={selected} userId={selected} role={role} me={me} onChanged={load} onClose={() => setSelected(null)} />
        ) : (
          <Card><p className="text-sm text-slate-500">Select a member to see their details{can(role, 'manageUsers') ? ' and actions' : ''}.</p></Card>
        )}
      </div>
    </div>
  );
};

export default Users;
