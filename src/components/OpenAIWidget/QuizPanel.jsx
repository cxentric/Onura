import React, { useMemo, useState } from 'react';
import Icon from '../AppIcon';
import { TOPICS, filterItems, industryList, itemById, pickQuizQuestions } from '../../data/kb';
import { useSettings } from '../../services/appSettings';
import { countRun, mistakeIds, recordAnswer, runsToday, useProgress } from '../../services/progress';
import { UpgradeCard, usePro } from './ProGate';
import { useKbStyles } from './kbUi';
import QuizRunner from './QuizRunner';

const QUIZ_LENGTHS = [5, 10, 20];

const QuizPanel = () => {
  const s = useKbStyles();
  const progress = useProgress();
  const [industry, setIndustry] = useState('all');
  const [topic, setTopic] = useState('all');
  const [length, setLength] = useState(10);
  const [run, setRun] = useState(null); // { key, questions, title }

  const available = useMemo(() => filterItems({ industry, topic }).length, [industry, topic]);
  const mistakes = mistakeIds(progress);
  const pro = usePro();
  const { free_runs_per_day: freeRuns } = useSettings();
  const runsLeft = pro ? Infinity : Math.max(0, Number(freeRuns) - runsToday(progress));

  // Free users get a few practice runs a day; past that, go back to the setup screen, which offers Pro.
  const begin = (nextRun) => {
    if (runsLeft <= 0) {
      setRun(null);
      return;
    }
    countRun();
    setRun(nextRun);
  };

  const start = () =>
    begin({ key: Date.now(), questions: pickQuizQuestions({ industry, topic }, length), title: 'Quiz complete' });

  const startReview = () =>
    begin({
      key: Date.now(),
      questions: mistakes.slice(0, 20).map((id) => itemById[id]).filter(Boolean),
      title: 'Revision complete',
    });

  if (run) {
    const isReview = run.title === 'Revision complete';
    return (
      <QuizRunner
        key={run.key}
        questions={run.questions}
        resultTitle={run.title}
        onAnswer={(item, correct) => recordAnswer(item.id, correct)}
        renderResultActions={() => (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={isReview ? startReview : start}
              disabled={isReview && mistakes.length === 0}
              className="py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {isReview ? 'Revise again' : 'Play again'}
            </button>
            <button
              onClick={() => setRun(null)}
              className={`py-2 rounded-md border text-xs font-medium ${s.dark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'}`}
            >
              New settings
            </button>
          </div>
        )}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div>
        <h3 className={`text-sm font-semibold ${s.text}`}>Test your knowledge</h3>
        <p className={`text-xs mt-1 ${s.muted}`}>
          Multiple-choice questions on top companies, roles and skills across industries.
        </p>
      </div>
      <label className={`block text-xs font-medium ${s.muted}`}>
        Industry
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={`${s.select} mt-1`}>
          <option value="all">All industries</option>
          {industryList.map((ind) => (
            <option key={ind.id} value={ind.id}>{ind.name}</option>
          ))}
        </select>
      </label>
      <label className={`block text-xs font-medium ${s.muted}`}>
        Topic
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`${s.select} mt-1`}>
          <option value="all">All topics</option>
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </label>
      <div>
        <span className={`block text-xs font-medium mb-1 ${s.muted}`}>Questions</span>
        <div className="grid grid-cols-3 gap-2">
          {QUIZ_LENGTHS.map((n) => (
            <button
              key={n}
              onClick={() => setLength(n)}
              aria-pressed={length === n}
              className={`text-xs py-1.5 rounded-md border transition-colors ${
                length === n
                  ? 'border-primary bg-primary text-white'
                  : s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {runsLeft > 0 ? (
        <>
          <button
            onClick={start}
            disabled={available === 0}
            className="w-full py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            Start quiz
          </button>
          <p className={`text-[10px] text-center ${s.muted}`}>
            {available} questions available for this selection
            {runsLeft !== Infinity && ` · ${runsLeft} free run${runsLeft === 1 ? '' : 's'} left today`}
          </p>
        </>
      ) : (
        <UpgradeCard
          title="You’ve used today’s free quiz"
          text="Today’s challenge is still free, and a new quiz unlocks tomorrow. Go Pro for unlimited quizzes and revision."
        />
      )}

      {mistakes.length > 0 && runsLeft > 0 && (
        <button
          onClick={startReview}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md border text-xs font-medium ${
            s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Icon name="RotateCcw" size={14} />
          <span>Review my mistakes ({mistakes.length})</span>
        </button>
      )}
    </div>
  );
};

export default QuizPanel;
