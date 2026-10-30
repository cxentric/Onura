import React, { useMemo, useState } from 'react';
import Icon from '../AppIcon';
import {
  DISCLAIMER,
  TOPICS,
  filterItems,
  industryList,
  relatedItems,
  roleList,
} from '../../data/kb';
import { itemBadges, useKbStyles } from './kbUi';

const PAGE_SIZE = 30;

const LearnPanel = () => {
  const s = useKbStyles();
  const [industry, setIndustry] = useState('all');
  const [topic, setTopic] = useState('roles');
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState(null);

  const showRole = topic === 'roles' || topic === 'careers';
  const results = useMemo(
    () => filterItems({ industry, topic, role: showRole ? role : 'all', search }),
    [industry, topic, role, search, showRole]
  );

  const resetPaging = (setter) => (e) => {
    setter(e.target.value);
    setVisible(PAGE_SIZE);
  };

  if (selected) {
    const related = relatedItems(selected);
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <button
          onClick={() => setSelected(null)}
          className={`flex items-center space-x-1 text-xs font-medium text-primary hover:underline`}
        >
          <Icon name="ArrowLeft" size={14} />
          <span>All questions</span>
        </button>

        <div className="flex flex-wrap gap-1">
          {itemBadges(selected).map((b) => (
            <span key={b} className={s.badge}>{b}</span>
          ))}
        </div>

        <h3 className={`text-sm font-semibold leading-snug ${s.text}`}>{selected.question}</h3>
        <div className={`${s.card} p-3`}>
          <p className={`text-sm leading-relaxed ${s.text}`}>{selected.answer}</p>
        </div>
        {selected.topic === 'companies' && <p className={`text-[10px] ${s.muted}`}>{DISCLAIMER}</p>}

        {related.length > 0 && (
          <div>
            <h4 className={`text-xs font-medium mb-1 ${s.muted}`}>Related questions</h4>
            <div className="space-y-1">
              {related.map((item) => (
                <button key={item.id} onClick={() => setSelected(item)} className={`${s.rowButton} flex items-start space-x-2`}>
                  <Icon name="HelpCircle" size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{item.question}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`p-3 space-y-2 border-b ${s.dark ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="Industry" value={industry} onChange={resetPaging(setIndustry)} className={s.select}>
            <option value="all">All industries</option>
            {industryList.map((ind) => (
              <option key={ind.id} value={ind.id}>{ind.name}</option>
            ))}
          </select>
          <select aria-label="Topic" value={topic} onChange={resetPaging(setTopic)} className={s.select}>
            <option value="all">All topics</option>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        {showRole && (
          <select aria-label="Role" value={role} onChange={resetPaging(setRole)} className={s.select}>
            <option value="all">All roles</option>
            {roleList.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
        <div className="relative">
          <Icon name="Search" size={14} className={`absolute left-2 top-1/2 -translate-y-1/2 ${s.muted}`} />
          <input
            type="search"
            value={search}
            onChange={resetPaging(setSearch)}
            placeholder="Find a question…"
            aria-label="Find a question"
            className={`${s.select} pl-7`}
          />
        </div>
        <p className={`text-[10px] ${s.muted}`}>{results.length} questions — tap one to see the answer</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-0.5">
        {results.length === 0 && (
          <p className={`text-xs text-center py-6 ${s.muted}`}>No questions match. Try another filter.</p>
        )}
        {results.slice(0, visible).map((item) => (
          <button key={item.id} onClick={() => setSelected(item)} className={`${s.rowButton} flex items-start space-x-2`}>
            <Icon name="ChevronRight" size={14} className="mt-0.5 flex-shrink-0 text-primary" />
            <span>{item.question}</span>
          </button>
        ))}
        {visible < results.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full text-xs font-medium text-primary py-2 hover:underline"
          >
            Show more ({results.length - visible} left)
          </button>
        )}
      </div>
    </div>
  );
};

export default LearnPanel;
