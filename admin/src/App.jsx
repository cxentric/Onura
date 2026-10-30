import React, { useEffect, useState } from 'react';
import { ROLE_LABELS, can, configured, rpc, supabase } from './lib';
import { Badge, Button, ErrorText, ReasonProvider, inputClass } from './ui';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Questions from './pages/Questions';
import Team from './pages/Team';
import AuditLog from './pages/AuditLog';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'users', label: 'Users', component: Users },
  { id: 'billing', label: 'Subscriptions & payments', component: Billing },
  { id: 'settings', label: 'App settings', component: Settings },
  { id: 'questions', label: 'Question bank', component: Questions },
  { id: 'team', label: 'Admin team', component: Team },
  { id: 'audit', label: 'Audit log', component: AuditLog, permission: 'viewAudit' },
];

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const redirectTo = `${window.location.origin}/`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="" className="w-8 h-8" />
          <h1 className="text-lg font-semibold">CXentric Admin</h1>
        </div>
        <p className="text-sm text-slate-600">Sign in with the account you use on CXentric. Only the admin team can continue.</p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }).catch((e) => setError(e.message))}
        >
          Continue with Google
        </Button>
        {sent ? (
          <p className="text-sm text-slate-700">Check <strong>{email}</strong> for a sign-in link.</p>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: false } });
              if (err) setError(err.message);
              else setSent(true);
            }}
          >
            <input type="email" required placeholder="you@example.com" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit">Send link</Button>
          </form>
        )}
        <ErrorText error={error} />
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const [page, setPage] = useState(() => window.location.hash.slice(1) || 'dashboard');

  useEffect(() => {
    if (!configured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setRole(undefined);
    rpc('admin_role').then(setRole, () => setRole(null));
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onHash = () => setPage(window.location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!configured) {
    return <p className="p-8 text-slate-700">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use the admin console.</p>;
  }
  if (session === undefined || (session && role === undefined)) {
    return <p className="p-8 text-slate-500">Loading…</p>;
  }
  if (!session) return <SignIn />;
  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4 text-center">
        <h1 className="text-lg font-semibold">No admin access</h1>
        <p className="text-sm text-slate-600">{session.user.email} isn’t on the admin team. Ask the super admin to add you.</p>
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  }

  const pages = PAGES.filter((p) => !p.permission || can(role, p.permission));
  const current = pages.find((p) => p.id === page) || pages[0];
  const Page = current.component;

  return (
    <ReasonProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <aside className="md:w-60 bg-slate-900 text-slate-200 md:min-h-screen flex md:flex-col">
          <div className="hidden md:flex items-center gap-2 px-5 py-4 border-b border-slate-800">
            <img src="/favicon.png" alt="" className="w-7 h-7" />
            <span className="font-semibold text-white">CXentric Admin</span>
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible p-2 gap-1 flex-1">
            {pages.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${current.id === p.id ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`}
              >
                {p.label}
              </a>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="flex items-center justify-between gap-3 px-6 py-3 bg-white border-b border-slate-200">
            <h1 className="font-semibold text-slate-900">{current.label}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:inline text-slate-600">{session.user.email}</span>
              <Badge tone={role === 'super_admin' ? 'purple' : role === 'member' ? 'slate' : 'blue'}>{ROLE_LABELS[role]}</Badge>
              <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
            </div>
          </header>
          <main className="p-4 md:p-6 max-w-7xl">
            <Page role={role} me={session.user} />
          </main>
        </div>
      </div>
    </ReasonProvider>
  );
};

export default App;
