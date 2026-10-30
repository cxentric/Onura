import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TOPICS, applyOverrides, baseItems, getQuizOptions, industryList, roleList } from '../../../src/data/kb';
import { can, rpc, supabase } from '../lib';
import { Badge, Button, Card, ErrorText, Field, inputClass, useReason } from '../ui';

const PAGE = 50;
const baseById = Object.fromEntries(baseItems.map((item) => [item.id, item]));
const newId = () => `c${Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')}`;

const statusOf = (id, overridesById) => overridesById[id]?.kind || 'original';
const STATUS_BADGE = {
  original: null,
  edit: <Badge tone="blue">Edited</Badge>,
  hide: <Badge tone="red">Hidden</Badge>,
  add: <Badge tone="green">Custom</Badge>,
};

const Editor = ({ item, override, editable, onSaved, onClose }) => {
  const askReason = useReason();
  const isCustom = item.id.startsWith('c');
  const hidden = override?.kind === 'hide';
  const [form, setForm] = useState({ question: item.question, answer: item.answer, short: item.short });
  const [error, setError] = useState(null);

  const save = async (kind, data, title, options = {}) => {
    const reason = await askReason({ title, ...options });
    if (!reason) return;
    setError(null);
    try {
      if (kind === 'reset') await rpc('admin_reset_question', { p_id: item.id, p_reason: reason });
      else await rpc('admin_save_question', { p_id: item.id, p_kind: kind, p_data: data, p_reason: reason });
      onSaved();
    } catch (e) {
      setError(e.message);
    }
  };

  const original = baseById[item.id];
  const { options, correctIndex } = getQuizOptions(item);

  return (
    <Card title={`${item.id} ${isCustom ? '(custom)' : ''}`} actions={<Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}>
      <div className="space-y-4">
        <Field label="Question">
          <textarea rows={2} disabled={!editable || isCustom} className={inputClass} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        </Field>
        <Field label="Full answer (shown in Learn and after answering)">
          <textarea rows={4} disabled={!editable || isCustom} className={inputClass} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
        </Field>
        <Field label="Correct option (short)" hint={isCustom ? null : 'Wrong options are picked from other questions of the same kind.'}>
          <input disabled={!editable || isCustom} className={inputClass} value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
        </Field>
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Options as members see them</p>
          <ol className="text-sm space-y-1 list-[upper-alpha] pl-5">
            {options.map((o, i) => (
              <li key={o} className={i === correctIndex ? 'text-green-700 font-medium' : 'text-slate-700'}>{o}</li>
            ))}
          </ol>
        </div>

        {editable && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {!isCustom && (
              <Button onClick={() => save('edit', form, 'Save changes to this question?', { confirmLabel: 'Save' })}>Save changes</Button>
            )}
            {!isCustom && override?.kind === 'edit' && (
              <Button variant="secondary" onClick={() => save('reset', null, 'Restore the original question?', { detail: original?.question, confirmLabel: 'Restore' })}>
                Restore original
              </Button>
            )}
            {hidden ? (
              <Button variant="secondary" onClick={() => save('reset', null, 'Show this question to members again?', { confirmLabel: 'Unhide' })}>Unhide</Button>
            ) : (
              <Button
                variant="danger"
                onClick={() =>
                  isCustom
                    ? save('reset', null, 'Delete this custom question?', { danger: true, confirmLabel: 'Delete' })
                    : save('hide', {}, 'Hide this question from members?', { danger: true, confirmLabel: 'Hide' })
                }
              >
                {isCustom ? 'Delete' : 'Hide'}
              </Button>
            )}
          </div>
        )}
        <ErrorText error={error} />
      </div>
    </Card>
  );
};

const NewQuestion = ({ onSaved, onClose }) => {
  const askReason = useReason();
  const [form, setForm] = useState({ topic: 'careers', industry: '', role: '', question: '', answer: '', short: '', wrong: ['', '', ''] });
  const [error, setError] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    const reason = await askReason({ title: 'Add this question to the bank?', confirmLabel: 'Add question' });
    if (!reason) return;
    setError(null);
    try {
      await rpc('admin_save_question', {
        p_id: newId(),
        p_kind: 'add',
        p_data: { ...form, industry: form.industry || null, role: form.role || null, wrong: form.wrong.map((w) => w.trim()) },
        p_reason: reason,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card title="New question" actions={<Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Topic">
            <select className={inputClass} value={form.topic} onChange={(e) => set({ topic: e.target.value })}>
              {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Industry">
            <select className={inputClass} value={form.industry} onChange={(e) => set({ industry: e.target.value })}>
              <option value="">Any</option>
              {industryList.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Role">
            <select className={inputClass} value={form.role} onChange={(e) => set({ role: e.target.value })}>
              <option value="">Any</option>
              {roleList.map((r) => <option key={r.id} value={r.id}>{r.shortName}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Question"><textarea required rows={2} className={inputClass} value={form.question} onChange={(e) => set({ question: e.target.value })} /></Field>
        <Field label="Full answer"><textarea required rows={3} className={inputClass} value={form.answer} onChange={(e) => set({ answer: e.target.value })} /></Field>
        <Field label="Correct option"><input required className={inputClass} value={form.short} onChange={(e) => set({ short: e.target.value })} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {form.wrong.map((w, i) => (
            <Field key={i} label={`Wrong option ${i + 1}`}>
              <input required className={inputClass} value={w} onChange={(e) => set({ wrong: form.wrong.map((x, j) => (j === i ? e.target.value : x)) })} />
            </Field>
          ))}
        </div>
        <div className="flex justify-end"><Button type="submit">Add question</Button></div>
        <ErrorText error={error} />
      </form>
    </Card>
  );
};

const Questions = ({ role }) => {
  const editable = can(role, 'editQuestions');
  const [overrides, setOverrides] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ topic: 'all', industry: 'all', status: 'all', search: '' });
  const [visible, setVisible] = useState(PAGE);
  const [selected, setSelected] = useState(null); // item id, or 'new'

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('kb_overrides').select('id, kind, data');
    if (err) setError(err.message);
    else setOverrides(data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const overridesById = useMemo(() => Object.fromEntries((overrides || []).map((o) => [o.id, o])), [overrides]);
  // Everything, including hidden questions, with edits applied, so admins can find and restore them.
  const all = useMemo(() => {
    if (!overrides) return [];
    return applyOverrides(baseItems, overrides.filter((o) => o.kind !== 'hide'));
  }, [overrides]);

  const needle = filters.search.trim().toLowerCase();
  const results = all.filter(
    (item) =>
      (filters.topic === 'all' || item.topic === filters.topic) &&
      (filters.industry === 'all' || item.industry === filters.industry) &&
      (filters.status === 'all' || statusOf(item.id, overridesById) === filters.status) &&
      (!needle || item.question.toLowerCase().includes(needle) || item.id === needle)
  );
  const counts = (overrides || []).reduce((acc, o) => ({ ...acc, [o.kind]: (acc[o.kind] || 0) + 1 }), {});
  const setFilter = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setVisible(PAGE);
  };
  const selectedItem = selected && selected !== 'new' ? all.find((item) => item.id === selected) : null;
  const afterSave = async () => {
    await load();
    if (selected === 'new') setSelected(null);
  };

  if (error) return <ErrorText error={error} />;
  if (!overrides) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      <Card
        className="xl:col-span-3"
        title={`${all.length - (counts.hide || 0)} questions live`}
        actions={editable && <Button size="sm" onClick={() => setSelected('new')}>New question</Button>}
      >
        <p className="text-sm text-slate-600 mb-3">
          {counts.edit || 0} edited · {counts.hide || 0} hidden · {counts.add || 0} custom. Members get changes the next time they open the app.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <select className={inputClass} value={filters.topic} onChange={(e) => setFilter({ topic: e.target.value })}>
            <option value="all">All topics</option>
            {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select className={inputClass} value={filters.industry} onChange={(e) => setFilter({ industry: e.target.value })}>
            <option value="all">All industries</option>
            {industryList.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <select className={inputClass} value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
            <option value="all">Any status</option>
            <option value="original">Original</option>
            <option value="edit">Edited</option>
            <option value="hide">Hidden</option>
            <option value="add">Custom</option>
          </select>
          <input type="search" placeholder="Search or id" className={inputClass} value={filters.search} onChange={(e) => setFilter({ search: e.target.value })} />
        </div>
        <ul className="divide-y divide-slate-100">
          {results.slice(0, visible).map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setSelected(item.id)}
                className={`w-full text-left py-2 px-2 rounded flex items-start gap-3 hover:bg-slate-50 ${selected === item.id ? 'bg-blue-50' : ''}`}
              >
                <span className="font-mono text-xs text-slate-400 pt-0.5 w-20 flex-shrink-0">{item.id}</span>
                <span className={`flex-1 text-sm ${statusOf(item.id, overridesById) === 'hide' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.question}</span>
                {STATUS_BADGE[statusOf(item.id, overridesById)]}
              </button>
            </li>
          ))}
        </ul>
        {visible < results.length && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setVisible((v) => v + PAGE)}>Show more ({results.length - visible} left)</Button>
        )}
        {results.length === 0 && <p className="text-sm text-slate-500">No questions match.</p>}
      </Card>
      <div className="xl:col-span-2">
        {selected === 'new' && <NewQuestion onSaved={afterSave} onClose={() => setSelected(null)} />}
        {selectedItem && (
          <Editor key={`${selectedItem.id}:${overridesById[selectedItem.id]?.kind}`} item={selectedItem} override={overridesById[selectedItem.id]} editable={editable} onSaved={afterSave} onClose={() => setSelected(null)} />
        )}
        {!selected && <Card><p className="text-sm text-slate-500">Select a question to {editable ? 'edit, hide or restore it' : 'see it'}.</p></Card>}
      </div>
    </div>
  );
};

export default Questions;
