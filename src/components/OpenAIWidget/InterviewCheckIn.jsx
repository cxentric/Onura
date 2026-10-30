import React, { useState } from 'react';
import Icon from '../AppIcon';
import { industryById, roleById } from '../../data/kb';
import { INTERVIEW_RESULTS, MAX_ASKED_LENGTH, addInterview, useProgress } from '../../services/progress';
import { useKbStyles } from './kbUi';

// Never says the Prep Score was right or wrong, and never blames the learner.
const RESPONSES = {
  offer: 'Congratulations! Want to keep your streak going for the next step?',
  rejected: 'Sorry it didn’t go your way. Your prep still counts for the next one. Note down what they asked, so you can practise it.',
  waiting: 'Fingers crossed. Keep your streak going while you wait.',
  no_reply: 'Fingers crossed. Keep your streak going while you wait.',
};

const resultLabel = (id) => INTERVIEW_RESULTS.find((r) => r.id === id)?.label || id;

/** "How did your interview go?": saved with the learner's progress (on this device; synced for Pro). */
const InterviewCheckIn = ({ onClose }) => {
  const s = useKbStyles();
  const { goal, interviews } = useProgress();
  const [result, setResult] = useState(null);
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const [asked, setAsked] = useState('');
  const [saved, setSaved] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (!result) return;
    setSaved(addInterview({ result, company, date, asked }));
  };

  if (saved) {
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <div className={`${s.card} p-3`}>
          <div className="flex items-center space-x-2">
            <Icon name={saved.result === 'offer' ? 'Sparkles' : 'Heart'} size={18} className="text-primary" />
            <h3 className={`text-sm font-semibold ${s.text}`}>Thanks for telling us</h3>
          </div>
          <p className={`text-xs mt-1.5 ${s.text}`}>{RESPONSES[saved.result]}</p>
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700">
          Back to Today
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${s.text}`}>How did your interview go?</h3>
        <button onClick={onClose} aria-label="Close" className={s.muted}>
          <Icon name="X" size={16} />
        </button>
      </div>

      <form onSubmit={save} className="space-y-3">
        <fieldset>
          <legend className={`text-xs font-medium ${s.text}`}>Result</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            {INTERVIEW_RESULTS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setResult(r.id)}
                aria-pressed={result === r.id}
                className={`py-1.5 rounded-md border text-xs font-medium ${
                  result === r.id
                    ? 'border-primary bg-primary text-white'
                    : s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className={`text-xs font-medium ${s.text}`}>Company <span className={s.muted}>(optional)</span></span>
          <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={120} className={`${s.select} mt-1`} />
        </label>

        <label className="block">
          <span className={`text-xs font-medium ${s.text}`}>Interview date <span className={s.muted}>(optional)</span></span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${s.select} mt-1`} />
        </label>

        <label className="block">
          <span className={`text-xs font-medium ${s.text}`}>What did they ask? <span className={s.muted}>(optional)</span></span>
          <textarea
            value={asked}
            onChange={(e) => setAsked(e.target.value)}
            maxLength={MAX_ASKED_LENGTH}
            rows={4}
            className={`${s.select} mt-1 resize-y`}
          />
          <span className={`block text-right text-[10px] ${s.muted}`}>{asked.length}/{MAX_ASKED_LENGTH}</span>
        </label>

        <button type="submit" disabled={!result} className="w-full py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-50">
          Save
        </button>
        <p className={`text-[10px] ${s.muted}`}>Saved with your progress. CXentric doesn’t receive it.</p>
      </form>

      {interviews.length > 0 && (
        <div className="space-y-1.5">
          <p className={`text-[10px] uppercase tracking-wide font-medium ${s.muted}`}>Your interviews</p>
          {interviews.slice(0, 10).map((entry) => (
            <div key={entry.id} className={`${s.card} p-2`}>
              <p className={`text-xs font-medium ${s.text}`}>
                {resultLabel(entry.result)}
                {entry.company && ` · ${entry.company}`}
                {entry.date && <span className={`font-normal ${s.muted}`}> · {entry.date}</span>}
              </p>
              {entry.goal && roleById[entry.goal.role] && (
                <p className={`text-[10px] ${s.muted}`}>
                  {roleById[entry.goal.role].shortName} · {industryById[entry.goal.industry]?.name}
                </p>
              )}
              {entry.asked && <p className={`text-[11px] mt-1 whitespace-pre-wrap ${s.text}`}>{entry.asked}</p>}
            </div>
          ))}
        </div>
      )}
      {!goal && <p className={`text-[10px] ${s.muted}`}>Tip: set a goal on the Today tab so entries are filed under it.</p>}
    </div>
  );
};

export default InterviewCheckIn;
