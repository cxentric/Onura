import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import { DAILY_SIZE, industryById, industryList, itemById, roleById, roleList } from '../../data/kb';
import { useSettings } from '../../services/appSettings';
import {
  activeStreak,
  countRun,
  dailyDone,
  ensureDailyChallenge,
  mistakeIds,
  dismissInterviewPrompt,
  markInterviewPromptShown,
  readiness,
  recordAnswer,
  recordDailyAnswer,
  runsToday,
  setGoal,
  shouldPromptInterview,
  useProgress,
} from '../../services/progress';
import { LEVELS, SCOPE_NOTE, levelAtLeast, prepScore } from '../../services/prepScore';
import { askCoach } from '../../services/aiKeys';
import { usePro } from './ProGate';
import { useWidget } from '../../contexts/WidgetContext';
import { useKbStyles } from './kbUi';
import { sharePrepBadge } from './shareBadge';
import QuizRunner from './QuizRunner';
import InterviewCheckIn from './InterviewCheckIn';

/** Progress bar with a tick at each level (25 / 50 / 75 / 100). */
const PrepBar = ({ score, dark }) => (
  <div className="flex items-center space-x-2">
    <div
      className={`relative flex-1 h-2 rounded-full ${dark ? 'bg-gray-600' : 'bg-gray-200'}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={score.total}
      aria-valuenow={score.correct}
      aria-valuetext={`${score.correct} of ${score.total} topics mastered`}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700" style={{ width: `${score.pct}%` }} />
      {LEVELS.filter((l) => l.min > 0).map((l) => (
        <span
          key={l.key}
          className="absolute -top-0.5 w-px h-3 bg-gray-400"
          style={{ left: `calc(${l.min}% - ${l.min === 100 ? 1 : 0}px)` }}
          title={l.label}
        />
      ))}
    </div>
    <span className={`text-[10px] tabular-nums ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{score.pct}%</span>
  </div>
);

const GoalPicker = ({ goal, onDone, s }) => {
  const [industry, setIndustry] = useState(goal?.industry || 'it');
  const [role, setRole] = useState(goal?.role || 'dev');
  return (
    <div className={`${s.card} p-3 space-y-2`}>
      <div className="flex items-center space-x-2">
        <Icon name="Target" size={16} className="text-primary" />
        <h3 className={`text-sm font-semibold ${s.text}`}>{goal ? 'Change your goal' : 'Set your career goal'}</h3>
      </div>
      <p className={`text-xs ${s.muted}`}>Pick the role you’re preparing for. Daily questions and your Prep Score follow it.</p>
      <div className="grid grid-cols-2 gap-2">
        <select aria-label="Goal role" value={role} onChange={(e) => setRole(e.target.value)} className={s.select}>
          {roleList.map((r) => (
            <option key={r.id} value={r.id}>{r.shortName}</option>
          ))}
        </select>
        <select aria-label="Goal industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={s.select}>
          {industryList.map((ind) => (
            <option key={ind.id} value={ind.id}>{ind.name}</option>
          ))}
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setGoal({ industry, role });
            onDone();
          }}
          className="flex-1 py-1.5 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700"
        >
          Save goal
        </button>
        {goal && (
          <button onClick={onDone} className={`px-3 py-1.5 rounded-md border text-xs ${s.dark ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'}`}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const TodayPanel = () => {
  const s = useKbStyles();
  const progress = useProgress();
  const [editingGoal, setEditingGoal] = useState(false);
  const [run, setRun] = useState(null); // 'daily' | 'review'
  const [runKey, setRunKey] = useState(0);
  const [shareNote, setShareNote] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    ensureDailyChallenge();
  }, [progress.goal]);

  const streak = activeStreak(progress);
  const done = dailyDone(progress);
  const ready = readiness(progress);
  const mistakes = mistakeIds(progress);
  const { daily, goal } = progress;
  const answeredToday = daily.ids.filter((id) => id in daily.answers).length;
  const score = prepScore(ready.mastered, ready.total);
  const goalName = goal && `${roleById[goal.role].shortName} · ${industryById[goal.industry].name}`;
  const showInterviewPrompt = !editingGoal && shouldPromptInterview(progress, levelAtLeast(score, 'foundation'));

  const pro = usePro();
  const { setActiveTab } = useWidget();
  const settings = useSettings();
  const canRevise = pro || runsToday(progress) < Number(settings.free_runs_per_day);

  useEffect(() => {
    if (showInterviewPrompt) markInterviewPromptShown();
  }, [showInterviewPrompt]);

  // The Coach tab decides what a Free user sees (the key steps, or the upgrade card when it's Pro-only).
  const practiseMockInterview = () => {
    askCoach(`Run a mock interview with me for a ${roleById[goal.role].name} role in ${industryById[goal.industry].name}. Ask one question at a time and give me feedback on each answer.`);
    setActiveTab('coach');
  };

  const shareBadge = async () => {
    if (!pro) {
      setActiveTab('account');
      return;
    }
    const result = await sharePrepBadge({
      score,
      role: roleById[goal.role].name,
      industry: industryById[goal.industry].name,
      streak,
    });
    if (result === 'downloaded') setShareNote('Badge downloaded, and a caption copied. Post it on LinkedIn!');
  };

  const startRun = (type) => {
    // The daily challenge is always free; revision counts as a practice run.
    if (type === 'review') {
      if (!canRevise) {
        setActiveTab('account');
        return;
      }
      countRun();
    }
    setRun(type);
    setRunKey((k) => k + 1);
  };

  if (checkingIn) return <InterviewCheckIn onClose={() => setCheckingIn(false)} />;

  if (run === 'daily') {
    const questions = daily.ids.map((id) => itemById[id]).filter(Boolean);
    const initialAnswers = questions.filter((q) => q.id in daily.answers).map((item) => ({ item, correct: daily.answers[item.id] }));
    return (
      <QuizRunner
        key={runKey}
        questions={questions}
        initialAnswers={initialAnswers}
        resultTitle="Daily challenge complete"
        onAnswer={(item, correct) => recordDailyAnswer(item.id, correct)}
        renderResultActions={() => (
          <div className="space-y-2">
            <div className={`${s.card} p-3 flex items-center space-x-3`}>
              <Icon name="Flame" size={24} className="text-orange-500" />
              <div>
                <p className={`text-sm font-semibold ${s.text}`}>{activeStreak(progress)}-day streak</p>
                <p className={`text-xs ${s.muted}`}>New questions unlock tomorrow. Don’t break the chain!</p>
              </div>
            </div>
            <button onClick={() => setRun(null)} className="w-full py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700">
              Back to Today
            </button>
          </div>
        )}
      />
    );
  }

  if (run === 'review') {
    return (
      <QuizRunner
        key={runKey}
        questions={mistakes.slice(0, 10).map((id) => itemById[id]).filter(Boolean)}
        resultTitle="Revision complete"
        onAnswer={(item, correct) => recordAnswer(item.id, correct)}
        renderResultActions={() => (
          <button onClick={() => setRun(null)} className="w-full py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-700">
            Back to Today
          </button>
        )}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* Streak and XP */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`${s.card} p-2.5 flex items-center space-x-2`}>
          <Icon name="Flame" size={22} className={streak > 0 ? 'text-orange-500' : s.muted} />
          <div>
            <p className={`text-sm font-bold leading-none ${s.text}`}>{streak} day{streak === 1 ? '' : 's'}</p>
            <p className={`text-[10px] mt-0.5 ${s.muted}`}>Streak · best {progress.streak.best}</p>
          </div>
        </div>
        <div className={`${s.card} p-2.5 flex items-center space-x-2`}>
          <Icon name="Zap" size={22} className="text-yellow-500" />
          <div>
            <p className={`text-sm font-bold leading-none ${s.text}`}>{progress.xp} XP</p>
            <p className={`text-[10px] mt-0.5 ${s.muted}`}>Earned so far</p>
          </div>
        </div>
      </div>

      {/* Goal and Prep Score: knowledge coverage of the goal's questions, never a prediction */}
      {!goal || editingGoal ? (
        <GoalPicker goal={goal} onDone={() => setEditingGoal(false)} s={s} />
      ) : (
        <div className={`${s.card} p-3 space-y-2`}>
          <div>
            <p className={`text-[10px] uppercase tracking-wide font-medium ${s.muted}`}>Prep Score · {goalName}</p>
            <p className={`text-lg font-bold leading-tight ${s.text}`}>{score.level.label}</p>
          </div>
          <PrepBar score={score} dark={s.dark} />
          <div>
            <p className={`text-xs ${s.text}`}>
              {score.correct} of {score.total} {goalName} topics mastered
            </p>
            {score.next && (
              <p className={`text-[11px] ${s.muted}`}>
                {score.toNext} more to reach <span className="italic">{score.next.label}</span>
              </p>
            )}
          </div>
          <p className={`text-[10px] leading-snug ${s.muted}`}>{SCOPE_NOTE}</p>
          {settings.feature_ai_coach && levelAtLeast(score, 'practice') && (
            <button
              onClick={practiseMockInterview}
              className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-700"
            >
              <Icon name="Bot" size={14} />
              <span>Practise a mock interview with AI Coach</span>
            </button>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button onClick={() => setEditingGoal(true)} className="flex items-center space-x-1 text-[11px] font-medium text-primary hover:underline">
              <Icon name="Pencil" size={11} />
              <span>Change goal</span>
            </button>
            {settings.feature_share_badge && (
              <button onClick={shareBadge} className="flex items-center space-x-1 text-[11px] font-medium text-primary hover:underline">
                <Icon name={pro ? 'Share2' : 'Crown'} size={11} />
                <span>Share badge</span>
              </button>
            )}
            <button onClick={() => setCheckingIn(true)} className="flex items-center space-x-1 text-[11px] font-medium text-primary hover:underline">
              <Icon name="MessageSquare" size={11} />
              <span>Had an interview? Tell us how it went</span>
            </button>
          </div>
          {shareNote && <p className="text-[10px] text-success-600">{shareNote}</p>}
        </div>
      )}

      {showInterviewPrompt && (
        <div className={`${s.card} p-3`}>
          <div className="flex items-start justify-between space-x-2">
            <div>
              <p className={`text-xs font-semibold ${s.text}`}>Had an interview lately?</p>
              <p className={`text-[11px] mt-0.5 ${s.muted}`}>Tell us how it went. It takes a minute and stays with your progress.</p>
            </div>
            <button onClick={() => dismissInterviewPrompt(false)} aria-label="Not now" className={s.muted}>
              <Icon name="X" size={14} />
            </button>
          </div>
          <div className="mt-2 flex items-center space-x-3">
            <button onClick={() => setCheckingIn(true)} className="px-3 py-1.5 rounded-md bg-primary text-white text-[11px] font-medium hover:bg-primary-700">
              Tell us how it went
            </button>
            <button onClick={() => dismissInterviewPrompt(true)} className={`text-[11px] ${s.muted} hover:underline`}>
              Don’t ask again
            </button>
          </div>
        </div>
      )}

      {/* Daily challenge */}
      <div className={`rounded-lg p-3 ${done ? `${s.card}` : 'bg-gradient-to-br from-primary to-blue-700 text-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name={done ? 'CalendarCheck' : 'Sparkles'} size={16} className={done ? 'text-success' : 'text-white'} />
            <h3 className={`text-sm font-semibold ${done ? s.text : 'text-white'}`}>Daily challenge</h3>
          </div>
          <span className={`text-[10px] font-medium ${done ? s.muted : 'text-blue-100'}`}>
            {answeredToday}/{daily.ids.length || DAILY_SIZE}
          </span>
        </div>
        {done ? (
          <p className={`text-xs mt-1 ${s.muted}`}>Done for today! Come back tomorrow for {DAILY_SIZE} new questions.</p>
        ) : (
          <>
            <p className="text-xs mt-1 text-blue-100">
              {streak > 0
                ? `Keep your ${streak}-day streak alive — ${DAILY_SIZE} quick questions.`
                : progress.streak.best > 0
                  ? 'Start a new streak today — 5 quick questions.'
                  : `${DAILY_SIZE} quick questions picked for your goal. Takes about 2 minutes.`}
            </p>
            <button
              onClick={() => startRun('daily')}
              disabled={!daily.ids.length}
              className="mt-2 w-full py-2 rounded-md bg-white text-primary text-xs font-semibold hover:bg-blue-50 disabled:opacity-60"
            >
              {answeredToday > 0 ? 'Continue' : 'Start today’s challenge'}
            </button>
          </>
        )}
      </div>

      {/* Revision */}
      {mistakes.length > 0 && (
        <button
          onClick={() => startRun('review')}
          className={`w-full ${s.card} p-3 flex items-center space-x-3 text-left hover:border-primary transition-colors`}
        >
          <Icon name="RotateCcw" size={18} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className={`text-xs font-semibold ${s.text}`}>Revise {Math.min(mistakes.length, 10)} missed question{mistakes.length === 1 ? '' : 's'}</p>
            <p className={`text-[10px] ${s.muted}`}>
              {canRevise ? 'Get them right to raise your Prep Score.' : 'Free practice used today. Tap to see Pro.'}
            </p>
          </div>
          <Icon name={canRevise ? 'ChevronRight' : 'Crown'} size={16} className={canRevise ? s.muted : 'text-amber-500'} />
        </button>
      )}

      <p className={`text-[10px] text-center ${s.muted}`}>Progress is saved on this device.</p>
    </div>
  );
};

export default TodayPanel;
