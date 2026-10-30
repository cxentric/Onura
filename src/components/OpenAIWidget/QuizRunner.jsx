import React, { useState } from 'react';
import Icon from '../AppIcon';
import { getQuizOptions } from '../../data/kb';
import { itemBadges, useKbStyles } from './kbUi';

/**
 * Plays a list of questions one by one, then shows the score and the ones to review.
 * Used by the Quiz tab and the daily challenge.
 *
 * - onAnswer(item, correct) is called once per question.
 * - initialAnswers lets a partly finished run (e.g. today's challenge) resume where it left off.
 * - renderResultActions({ score, total }) adds buttons under the results.
 */
const QuizRunner = ({ questions, onAnswer, initialAnswers = [], renderResultActions, resultTitle }) => {
  const s = useKbStyles();
  const [answers, setAnswers] = useState(initialAnswers); // { item, correct }
  const [index, setIndex] = useState(initialAnswers.length);
  const [chosen, setChosen] = useState(null);

  const score = answers.filter((a) => a.correct).length;

  if (index >= questions.length) {
    const mistakes = answers.filter((a) => !a.correct);
    const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <div className={`${s.card} p-4 text-center`}>
          <Icon name={pct >= 70 ? 'Trophy' : 'Target'} size={28} className="mx-auto text-primary" />
          {resultTitle && <p className={`text-xs font-medium mt-2 ${s.muted}`}>{resultTitle}</p>}
          <p className={`text-2xl font-bold mt-1 ${s.text}`}>{score}/{questions.length}</p>
          <p className={`text-xs ${s.muted}`}>
            {pct >= 90 ? 'Outstanding!' : pct >= 70 ? 'Great job!' : pct >= 40 ? 'Good effort — keep learning.' : 'Keep practising — try Learn mode first.'}
          </p>
        </div>
        {mistakes.length > 0 && (
          <div>
            <h4 className={`text-xs font-medium mb-1 ${s.muted}`}>Review — these will come back for revision</h4>
            <div className="space-y-2">
              {mistakes.map(({ item }) => (
                <div key={item.id} className={`${s.card} p-2`}>
                  <p className={`text-xs font-medium ${s.text}`}>{item.question}</p>
                  <p className="text-xs mt-1 text-success-600">{item.short}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {renderResultActions?.({ score, total: questions.length })}
      </div>
    );
  }

  const item = questions[index];
  const { options, correctIndex } = getQuizOptions(item);
  const answered = chosen !== null;

  const choose = (i) => {
    if (answered) return;
    const correct = i === correctIndex;
    setChosen(i);
    setAnswers((prev) => [...prev, { item, correct }]);
    onAnswer?.(item, correct);
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
              {chosen === correctIndex ? 'Correct! +10 XP' : 'Not quite.'}
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

export default QuizRunner;
