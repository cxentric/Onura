import React, { useCallback, useEffect, useState } from 'react';
import { can, dateTime, rpc, rupees, supabase } from '../lib';
import { Badge, Button, Card, ErrorText, Field, inputClass, useReason } from '../ui';

const CATEGORY_ORDER = ['features', 'limits', 'announcements', 'billing', 'general'];
const CATEGORY_LABELS = {
  features: 'Feature switches',
  limits: 'Free plan limits',
  announcements: 'Announcements and maintenance',
  billing: 'Prices and billing (super admin only)',
  general: 'Other settings',
};

// Text settings with a fixed set of values get a dropdown instead of a text box.
const CHOICES = {
  signup_plan: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ],
};

const toText = (type, value) => (type === 'json' ? JSON.stringify(value, null, 2) : type === 'boolean' ? value : String(value ?? ''));
function parse(type, text) {
  if (type === 'boolean') return Boolean(text);
  if (type === 'number') {
    const n = Number(text);
    if (text === '' || !Number.isFinite(n)) throw new Error('Enter a number.');
    return n;
  }
  if (type === 'json') return JSON.parse(text);
  return text;
}

const ValueInput = ({ type, value, onChange, disabled, choices }) => {
  if (choices) {
    return (
      <select disabled={disabled} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {!choices.some((c) => c.value === value) && <option value={value}>{value || '(not set)'}</option>}
        {choices.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
    );
  }
  if (type === 'boolean') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    );
  }
  if (type === 'json') {
    return <textarea rows={4} disabled={disabled} className={`${inputClass} font-mono text-xs`} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <input
      type={type === 'number' ? 'number' : 'text'}
      disabled={disabled}
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const SettingRow = ({ setting, editable, onSaved }) => {
  const askReason = useReason();
  const [draft, setDraft] = useState(() => toText(setting.type, setting.value));
  const [error, setError] = useState(null);
  const original = toText(setting.type, setting.value);
  const changed = draft !== original;

  const save = async () => {
    setError(null);
    let value;
    try {
      value = parse(setting.type, draft);
    } catch (e) {
      setError(e.message || 'That isn’t valid.');
      return;
    }
    const reason = await askReason({ title: `Change ${setting.key}?`, detail: 'Members see the new value the next time they open CXentric.', confirmLabel: 'Save' });
    if (!reason) return;
    try {
      await rpc('admin_set_setting', { p_key: setting.key, p_value: value, p_reason: reason });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="py-4 border-t border-slate-100 first:border-t-0 grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="md:col-span-2">
        <p className="font-mono text-sm text-slate-900">{setting.key}</p>
        <p className="text-sm text-slate-600">{setting.description}</p>
        <div className="mt-1 flex gap-1">
          <Badge>{setting.type}</Badge>
          {setting.is_public ? <Badge tone="blue">sent to app</Badge> : <Badge tone="amber">server only</Badge>}
        </div>
      </div>
      <div className="md:col-span-3 space-y-1">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <ValueInput type={setting.type} value={draft} onChange={setDraft} disabled={!editable} choices={CHOICES[setting.key]} />
          </div>
          {editable && changed && (
            <>
              <Button size="sm" onClick={save}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft(original)}>Undo</Button>
            </>
          )}
        </div>
        {setting.key.endsWith('_paise') && <p className="text-xs text-slate-500">= {rupees(setting.type === 'number' ? Number(draft) : 0)}</p>}
        {setting.key === 'signup_pro_days' && (
          <p className="text-xs text-slate-500">{Number(draft) > 0 ? `New members on Pro get ${Number(draft)} days.` : 'New members on Pro keep it with no end date.'} Only used when signup_plan is Pro.</p>
        )}
        <p className="text-xs text-slate-400">Updated {dateTime(setting.updated_at)}</p>
        <ErrorText error={error} />
      </div>
    </div>
  );
};

const NewSetting = ({ role, onCreated }) => {
  const askReason = useReason();
  const [form, setForm] = useState({ key: '', type: 'boolean', value: false, category: 'features', description: '', isPublic: true });
  const [error, setError] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    let value;
    try {
      value = parse(form.type, form.value);
    } catch (err) {
      setError(err.message || 'The value isn’t valid.');
      return;
    }
    const reason = await askReason({ title: `Add setting ${form.key}?`, confirmLabel: 'Add setting' });
    if (!reason) return;
    try {
      await rpc('admin_create_setting', {
        p_key: form.key,
        p_type: form.type,
        p_value: value,
        p_category: form.category,
        p_description: form.description,
        p_is_public: form.isPublic,
        p_reason: reason,
      });
      setForm({ key: '', type: 'boolean', value: false, category: 'features', description: '', isPublic: true });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card title="Add a setting">
      <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Key" hint="Lowercase letters, numbers and underscores, e.g. feature_mock_interviews">
          <input required pattern="[a-z][a-z0-9_]{1,63}" className={`${inputClass} font-mono`} value={form.key} onChange={(e) => set({ key: e.target.value })} />
        </Field>
        <Field label="Type">
          <select className={inputClass} value={form.type} onChange={(e) => set({ type: e.target.value, value: e.target.value === 'boolean' ? false : '' })}>
            <option value="boolean">On/off</option>
            <option value="number">Number</option>
            <option value="text">Text</option>
            <option value="json">JSON</option>
          </select>
        </Field>
        <Field label="Value">
          <ValueInput type={form.type} value={form.value} onChange={(value) => set({ value })} />
        </Field>
        <Field label="Group">
          <select className={inputClass} value={form.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORY_ORDER.filter((c) => c !== 'billing' || role === 'super_admin').map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <input required className={inputClass} value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Who can read it" hint="Settings sent to the app are visible to anyone; keep secrets out of them.">
          <select className={inputClass} value={form.isPublic ? 'public' : 'private'} onChange={(e) => set({ isPublic: e.target.value === 'public' })}>
            <option value="public">Sent to the app</option>
            <option value="private">Server only</option>
          </select>
        </Field>
        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">A new setting is stored straight away. It changes how CXentric behaves once the app’s code reads it.</p>
          <Button type="submit">Add setting</Button>
        </div>
        <ErrorText error={error} />
      </form>
    </Card>
  );
};

const Settings = ({ role }) => {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('app_settings').select('*').order('key');
    if (err) setError(err.message);
    else {
      setSettings(data);
      setVersion((v) => v + 1);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorText error={error} />;
  if (!settings) return <p className="text-slate-500">Loading…</p>;

  const groups = [...new Set([...CATEGORY_ORDER, ...settings.map((s) => s.category)])].filter((c) => settings.some((s) => s.category === c));
  const editable = (setting) => can(role, setting.category === 'billing' ? 'editBilling' : 'editSettings');

  return (
    <div className="space-y-4">
      {!can(role, 'editSettings') && <p className="text-sm text-slate-600">You can view settings. Only app admins and the super admin can change them.</p>}
      {groups.map((group) => (
        <Card key={group} title={CATEGORY_LABELS[group] || group}>
          {settings
            .filter((s) => s.category === group)
            .map((s) => (
              <SettingRow key={`${s.key}:${version}`} setting={s} editable={editable(s)} onSaved={load} />
            ))}
        </Card>
      ))}
      {can(role, 'editSettings') && <NewSetting role={role} onCreated={load} />}
    </div>
  );
};

export default Settings;
