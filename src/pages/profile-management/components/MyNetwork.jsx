import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useWidget } from '../../../contexts/WidgetContext';
import { useAuth } from '../../../services/auth';
import {
  getMyCard,
  myNetwork,
  removeConnection,
  requestConnection,
  respondToRequest,
  saveMyCard,
  searchMembers,
} from '../../../services/network';

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const Avatar = ({ person }) =>
  person.avatar ? (
    <img src={person.avatar} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center font-semibold flex-shrink-0">
      {initials(person.name)}
    </div>
  );

const PersonCard = ({ person, children }) => (
  <div className="bg-surface border border-border rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <Avatar person={person} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-text-primary truncate">{person.name || 'CXentric member'}</h3>
          {person.isFounder && (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <Icon name="Crown" size={12} />
              <span>Founder</span>
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary truncate">{person.headline || 'No headline yet'}</p>
      </div>
    </div>
    {children && <div className="flex items-center space-x-2 mt-4">{children}</div>}
  </div>
);

/** Your name and headline: what other members see when they search for you. */
const MyCard = ({ userId }) => {
  const [card, setCard] = useState(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(null);

  useEffect(() => {
    getMyCard(userId).then(setCard, () => setCard({ display_name: '', headline: '' }));
  }, [userId]);

  if (!card) return null;
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNote(null);
    try {
      await saveMyCard(userId, card);
      setNote('Saved.');
    } catch (err) {
      setNote(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-surface border border-border rounded-lg p-4 space-y-3">
      <div>
        <h3 className="font-medium text-text-primary">How others see you</h3>
        <p className="text-sm text-text-muted">Members find you by your name and headline.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-text-secondary space-y-1">
          <span>Name</span>
          <Input value={card.display_name} maxLength={80} required onChange={(e) => setCard({ ...card, display_name: e.target.value })} />
        </label>
        <label className="block text-sm font-medium text-text-secondary space-y-1">
          <span>Headline</span>
          <Input
            value={card.headline}
            maxLength={140}
            placeholder="e.g. QA Engineer preparing for SDET roles"
            onChange={(e) => setCard({ ...card, headline: e.target.value })}
          />
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        {note && <span className="text-sm text-text-muted">{note}</span>}
      </div>
    </form>
  );
};

const MyNetwork = () => {
  const auth = useAuth();
  const { updateWidgetSettings } = useWidget();
  const [view, setView] = useState('connections');
  const [network, setNetwork] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => myNetwork().then(setNetwork, (err) => setError(err.message)), []);

  useEffect(() => {
    if (auth.status === 'signed-in') refresh();
  }, [auth.status, refresh]);

  useEffect(() => {
    if (view !== 'find' || query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    const timer = setTimeout(() => searchMembers(query).then(setResults, (err) => setError(err.message)), 300);
    return () => clearTimeout(timer);
  }, [query, view]);

  if (auth.status === 'loading') {
    return <p className="text-center py-12 text-text-muted">Loading your network…</p>;
  }
  if (auth.status !== 'signed-in') {
    return (
      <div className="text-center py-12">
        <Icon name="Users" size={48} className="text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Sign in to build your network</h3>
        <p className="text-text-muted mb-4">Connect with other CXentric members preparing for their next role.</p>
        <Button
          iconName="LogIn"
          iconPosition="left"
          onClick={() => updateWidgetSettings({ isVisible: true, isMinimized: false, activeTab: 'account' })}
        >
          Sign in
        </Button>
      </div>
    );
  }

  const act = async (id, fn) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await refresh();
      if (view === 'find' && query.trim().length >= 2) setResults(await searchMembers(query));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const tabs = [
    { id: 'connections', label: 'Connections', count: network?.connections.length },
    { id: 'requests', label: 'Requests', count: network ? network.incoming.length + network.outgoing.length : undefined },
    { id: 'find', label: 'Find people' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 bg-secondary-50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === tab.id ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${view === tab.id ? 'bg-primary-100 text-primary' : 'bg-secondary-200 text-text-muted'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {!network && !error && <p className="text-center py-8 text-text-muted">Loading…</p>}

      {network && view === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {network.connections.map((person) => (
            <PersonCard key={person.id} person={person}>
              {person.isFounder ? (
                <p className="text-xs text-text-muted">Connected to every member</p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="UserMinus"
                  disabled={busyId === person.id}
                  onClick={() => window.confirm(`Remove ${person.name} from your connections?`) && act(person.id, () => removeConnection(person.id))}
                >
                  Remove
                </Button>
              )}
            </PersonCard>
          ))}
          {network.connections.length === 0 && <p className="text-text-muted">No connections yet. Try “Find people”.</p>}
        </div>
      )}

      {network && view === 'requests' && (
        <div className="space-y-6">
          <section>
            <h3 className="font-medium text-text-primary mb-3">Received</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {network.incoming.map((person) => (
                <PersonCard key={person.id} person={person}>
                  <Button size="sm" iconName="Check" disabled={busyId === person.id} onClick={() => act(person.id, () => respondToRequest(person.id, true))} className="flex-1">
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" disabled={busyId === person.id} onClick={() => act(person.id, () => respondToRequest(person.id, false))}>
                    Decline
                  </Button>
                </PersonCard>
              ))}
              {network.incoming.length === 0 && <p className="text-sm text-text-muted">No requests waiting.</p>}
            </div>
          </section>
          <section>
            <h3 className="font-medium text-text-primary mb-3">Sent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {network.outgoing.map((person) => (
                <PersonCard key={person.id} person={person}>
                  <Button variant="ghost" size="sm" disabled={busyId === person.id} onClick={() => act(person.id, () => removeConnection(person.id))}>
                    Withdraw
                  </Button>
                </PersonCard>
              ))}
              {network.outgoing.length === 0 && <p className="text-sm text-text-muted">No pending requests.</p>}
            </div>
          </section>
        </div>
      )}

      {view === 'find' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input type="search" placeholder="Search members by name or headline" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((person) => (
              <PersonCard key={person.id} person={person}>
                {person.status === 'accepted' ? (
                  <span className="text-sm text-success flex items-center space-x-1"><Icon name="Check" size={14} /><span>Connected</span></span>
                ) : person.status === 'pending' ? (
                  <span className="text-sm text-text-muted">Request pending</span>
                ) : (
                  <Button size="sm" iconName="UserPlus" disabled={busyId === person.id} onClick={() => act(person.id, () => requestConnection(person.id))} className="flex-1">
                    Connect
                  </Button>
                )}
              </PersonCard>
            ))}
          </div>
          {query.trim().length >= 2 && results.length === 0 && <p className="text-sm text-text-muted">No members match “{query}”.</p>}
        </div>
      )}

      <MyCard userId={auth.user.id} />
    </div>
  );
};

export default MyNetwork;
