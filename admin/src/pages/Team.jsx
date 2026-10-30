import React, { useCallback, useEffect, useState } from 'react';
import { ROLE_HELP, ROLE_LABELS, can, date, rpc } from '../lib';
import { Badge, Button, Card, ErrorText, Field, inputClass, useReason } from '../ui';

const ASSIGNABLE = ['app_admin', 'user_admin', 'member'];

const Team = ({ role }) => {
  const askReason = useReason();
  const manage = can(role, 'manageTeam');
  const [team, setTeam] = useState(null);
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [error, setError] = useState(null);

  const load = useCallback(() => rpc('admin_team').then(setTeam, (e) => setError(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  const run = async (title, fn, options) => {
    const reason = await askReason({ title, ...options });
    if (!reason) return;
    setError(null);
    try {
      await fn(reason);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Roles">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.keys(ROLE_LABELS).map((r) => (
            <div key={r}>
              <dt className="font-medium text-slate-800">{ROLE_LABELS[r]}</dt>
              <dd className="text-slate-600">{ROLE_HELP[r]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title={team ? `Admin team (${team.length})` : 'Admin team'}>
        <ErrorText error={error} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2 pr-3">Person</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Since</th>{manage && <th className="py-2" />}</tr>
            </thead>
            <tbody>
              {team?.map((a) => (
                <tr key={a.userId} className="border-t border-slate-100">
                  <td className="py-2 pr-3">
                    <p className="font-medium text-slate-800">{a.name || '—'}</p>
                    <p className="text-slate-500 break-all">{a.email}</p>
                  </td>
                  <td className="py-2 pr-3">
                    {manage && a.role !== 'super_admin' ? (
                      <select
                        className={`${inputClass} w-44`}
                        value={a.role}
                        onChange={(e) => {
                          const next = e.target.value;
                          run(`Make ${a.email} ${ROLE_LABELS[next]}?`, (reason) => rpc('admin_set_role', { p_email: a.email, p_role: next, p_reason: reason }), { confirmLabel: 'Change role' });
                        }}
                      >
                        {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    ) : (
                      <Badge tone={a.role === 'super_admin' ? 'purple' : 'blue'}>{ROLE_LABELS[a.role]}</Badge>
                    )}
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{date(a.since)}</td>
                  {manage && (
                    <td className="py-2 text-right">
                      {a.role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => run(`Remove ${a.email} from the admin team?`, (reason) => rpc('admin_remove', { p_user_id: a.userId, p_reason: reason }), { danger: true, confirmLabel: 'Remove' })}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {manage && (
        <Card title="Add someone">
          <form
            className="flex flex-col md:flex-row md:items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(`Add ${email} as ${ROLE_LABELS[newRole]}?`, async (reason) => {
                await rpc('admin_set_role', { p_email: email, p_role: newRole, p_reason: reason });
                setEmail('');
              }, { confirmLabel: 'Add' });
            }}
          >
            <div className="flex-1">
              <Field label="Email" hint="They must have signed in to CXentric once with this email.">
                <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>
            <Field label="Role">
              <select className={inputClass} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {ASSIGNABLE.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </Field>
            <Button type="submit">Add to team</Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Team;
