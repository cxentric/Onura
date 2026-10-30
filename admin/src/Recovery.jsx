import React, { useEffect, useState } from 'react';
import { dateTime, rpc, supabase } from './lib';
import { Button, Card, ErrorText, Field, inputClass, useReason } from './ui';

/**
 * Backup recovery. The backup email can ask to take over as super admin; it happens only 72 hours
 * later, and the super admin can cancel it in the meantime. The database enforces all of this.
 */
export const useRecoveryStatus = (sessionUserId) => {
  const [status, setStatus] = useState(undefined);
  const reload = () => rpc('recovery_status').then(setStatus, () => setStatus(null));
  useEffect(() => {
    if (!sessionUserId) return;
    reload();
  }, [sessionUserId]); // eslint-disable-line react-hooks/exhaustive-deps
  return [status, reload];
};

/** What the backup email sees: ask to take over, wait 72 hours, then complete. */
export const BackupScreen = ({ session, status, onChange }) => {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await onChange();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h1 className="text-lg font-semibold">Backup access</h1>
        <p className="text-sm text-slate-600">
          {session.user.email} is the backup for the CXentric super admin. If the super admin can’t sign in any more, you can take over.
        </p>
        {!status.requestedAt ? (
          <>
            <p className="text-sm text-slate-600">
              Asking starts a 72-hour wait. The super admin sees a warning in this console and can cancel it. After 72 hours you become the
              super admin, and the old super admin account loses admin access.
            </p>
            <Button variant="danger" disabled={busy} onClick={() => run(() => rpc('recovery_request'))}>Ask to take over</Button>
          </>
        ) : status.canComplete ? (
          <>
            <p className="text-sm text-slate-700">The 72 hours have passed and nobody cancelled.</p>
            <Button variant="danger" disabled={busy} onClick={() => run(() => rpc('recovery_complete'))}>Become the super admin now</Button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-700">
              Requested {dateTime(status.requestedAt)}. You can take over from <strong>{dateTime(status.effectiveAt)}</strong> unless the super admin cancels.
            </p>
            <Button variant="secondary" disabled={busy} onClick={() => run(() => rpc('recovery_cancel', { p_reason: 'Cancelled by the backup' }))}>
              Cancel my request
            </Button>
          </>
        )}
        <ErrorText error={error} />
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    </div>
  );
};

/** Warning for the super admin while the backup's request is pending. */
export const RecoveryBanner = ({ status, onChange }) => {
  const askReason = useReason();
  const [error, setError] = useState(null);
  if (!status?.requestedAt || status.as !== 'super_admin') return null;

  return (
    <div className="bg-red-600 text-white px-6 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2">
      <p className="flex-1">
        <strong>{status.backupEmail}</strong> asked to take over as super admin on {dateTime(status.requestedAt)}. It happens on{' '}
        <strong>{dateTime(status.effectiveAt)}</strong> unless you cancel. If you didn’t expect this, cancel and change the backup email.
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          const reason = await askReason({ title: 'Cancel the takeover?', confirmLabel: 'Cancel takeover' });
          if (!reason) return;
          try {
            await rpc('recovery_cancel', { p_reason: reason });
            onChange();
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        Cancel takeover
      </Button>
      {error && <span className="text-red-100">{error}</span>}
    </div>
  );
};

/** Super admin: set or change the backup email (Admin team page). */
export const BackupEmailCard = () => {
  const askReason = useReason();
  const [status, setStatus] = useState(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const load = () => rpc('recovery_status').then(setStatus, (e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  return (
    <Card title="Backup email">
      <p className="text-sm text-slate-600 mb-3">
        If you lose access, this email can sign in here and ask to take over. It becomes the super admin 72 hours later unless you cancel.
      </p>
      <p className="text-sm mb-4">
        Current backup: <strong>{status?.backupEmail || 'none set'}</strong>
        {status?.requestedAt && <span className="text-red-600"> · takeover requested, see the warning at the top</span>}
      </p>
      <form
        className="flex flex-col md:flex-row md:items-end gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const reason = await askReason({ title: `Make ${email} the backup?`, detail: 'Any pending takeover request is cancelled.', confirmLabel: 'Save' });
          if (!reason) return;
          setError(null);
          try {
            await rpc('admin_set_backup_email', { p_email: email, p_reason: reason });
            setEmail('');
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <div className="flex-1">
          <Field label="New backup email" hint="Use an inbox only you can open. It doesn't need a CXentric account until it's needed.">
            <input type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Button type="submit">Save backup</Button>
      </form>
      <ErrorText error={error} />
    </Card>
  );
};
