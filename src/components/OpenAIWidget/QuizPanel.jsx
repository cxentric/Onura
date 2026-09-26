import React, { useMemo, useState } from 'react';
import Icon from '../AppIcon';
import { TOPICS, filterItems, getQuizOptions, industryList, pickQuizQuestions } from '../../data/kb';
import { itemBadges, useKbStyles } from './LearnPanel';

const QUIZ_LENGTHS = [5, 10, 20];

const QuizPanel = () => {
  const s = useKbStyles();
  const [industry, setIndustry] = useState('all');
  const [topic, setTopic] = useState('all');
  const [length, setLength] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [answers, setAnswers] = useState([]); // { item, correct }

  const available = useMemo(() => filterItems({ industry, topic }).length, [industry, topic]);
  const phase = questions.length === 0 ? 'setup' : index >= questions.length ? 'done' : 'question';
  const score = answers.filter((a) => a.correct).length;

  const start = () => {
    setQuestions(pickQuizQuestions({ industry, topic }, length));
    setIndex(0);
    setChosen(null);
    setAnswers([]);
  };

  const reset = () => setQuestions([]);

  if (phase === 'setup') {
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
        <button
          onClick={start}
          disabled={available === 0}
          className="w-full py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          Start quiz
        </button>
        <p className={`text-[10px] text-center ${s.muted}`}>{available} questions available for this selection</p>
      </div>
    );
  }

  if (phase === 'done') {
    const mistakes = answers.filter((a) => !a.correct);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <div className={`${s.card} p-4 text-center`}>
          <Icon name={pct >= 70 ? 'Trophy' : 'Target'} size={28} className="mx-auto text-primary" />
          <p className={`text-2xl font-bold mt-2 ${s.text}`}>{score}/{questions.length}</p>
          <p className={`text-xs ${s.muted}`}>
            {pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great job!' : pct >= 40 ? 'Good effort — keep learning.' : 'Keep practising — try Learn mode first.'}
          </p>
        </div>
        {mistakes.length > 0 && (
          <div>
            <h4 className={`text-xs font-medium mb-1 ${s.muted}`}>Review</h4>
            <div className="space-y-2">
              {mistakes.map(({ item }) => (
                <div key={item.id} className={`${s.card} p-2`}>
                  <p className={`text-xs font-medium ${s.text}`}>{item.question}</p>
                  <p className="text-xs mt-1 text-success">{item.short}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={start} className="py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700">
            Play again
          </button>
          <button
            onClick={reset}
            className={`py-2 rounded-md border text-xs font-medium ${s.dark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'}`}
          >
            New settings
          </button>
        </div>
      </div>
    );
  }

  const item = questions[index];
  const { options, correctIndex } = getQuizOptions(item);
  const answered = chosen !== null;

  const choose = (i) => {
    if (answered) return;
    setChosen(i);
    setAnswers((prev) => [...prev, { item, correct: i === correctIndex }]);
  };

  const next = () => {
    setChosen(null);
    setIndex((i) => i + 1);
  };

  const optionClass = (i) => {
    const base = 'w-full text-left text-xs px-3 py-2 rounded-md border transition-colors flex items-start space-x-2';
    if (!answered) {
      return `${base} ${s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    }
    if (i === correctIndex) return `${base} border-2 border-success bg-success-50 text-success-600 font-medium`;
    if (i === chosen) return `${base} border-2 border-error bg-error-50 text-error-600`;
    return `${base} opacity-60 ${s.dark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-500'}`;
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium ${s.muted}`}>Question {index + 1} of {questions.length}</span>
        <span className={`text-[10px] font-medium ${s.muted}`}>Score {score}</span>
      </div>
      <div className={`h-1 rounded-full overflow-hidden ${s.dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div className="h-full bg-primary transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-1">
        {itemBadges(item).map((b) => (
          <span key={b} className={s.badge}>{b}</span>
        ))}
      </div>
      <h3 className={`text-sm font-semibold leading-snug ${s.text}`}>{item.question}</h3>

      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {options.map((option, i) => (
          <button key={option} onClick={() => choose(i)} className={optionClass(i)} role="radio" aria-checked={chosen === i} disabled={answered}>
            <span className="font-semibold flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
            <span className="flex-1">{option}</span>
            {answered && i === correctIndex && <Icon name="CheckCircle2" size={16} className="flex-shrink-0" />}
            {answered && i === chosen && i !== correctIndex && <Icon name="XCircle" size={16} className="flex-shrink-0" />}
          </button>
        ))}
      </div>

      {answered && (
        <div className="space-y-2">
          <div className={`${s.card} p-3`}>
            <p className={`text-xs font-semibold mb-1 ${chosen === correctIndex ? 'text-success' : 'text-error'}`}>
              {chosen === correctIndex ? 'Correct!' : 'Not quite.'}
            </p>
            <p className={`text-xs leading-relaxed ${s.text}`}>{item.answer}</p>
          </div>
          <button onClick={next} className="w-full py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700">
            {index + 1 === questions.length ? 'See results' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPanel;
