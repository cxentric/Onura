import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import { DAILY_SIZE, industryById, industryList, itemById, roleById, roleList } from '../../data/kb';
import { FREE_RUNS_PER_DAY } from '../../config/plans';
import {
  activeStreak,
  countRun,
  dailyDone,
  ensureDailyChallenge,
  mistakeIds,
  readiness,
  recordAnswer,
  recordDailyAnswer,
  runsToday,
  setGoal,
  useProgress,
} from '../../services/progress';
import { usePro } from './ProGate';
import { useWidget } from '../../contexts/WidgetContext';
import { useKbStyles } from './kbUi';
import { shareReadinessBadge } from './shareBadge';
import QuizRunner from './QuizRunner';

const MILESTONES = [25, 50, 75, 100];

const ReadinessRing = ({ percent, dark }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`${percent}% ready`}>
      <circle cx="34" cy="34" r={radius} fill="none" strokeWidth="7" className={dark ? 'stroke-gray-600' : 'stroke-gray-200'} />
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        className="stroke-primary transition-all duration-700"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - percent / 100)}
        transform="rotate(-90 34 34)"
      />
      <text x="34" y="38" textAnchor="middle" className={`text-[13px] font-bold ${dark ? 'fill-white' : 'fill-gray-800'}`}>
        {percent}%
      </text>
    </svg>
  );
};

const GoalPicker = ({ goal, onDone, s }) => {
  const [industry, setIndustry] = useState(goal?.industry || 'it');
  const [role, setRole] = useState(goal?.role || 'dev');
  return (
    <div className={`${s.card} p-3 space-y-2`}>
      <div className="flex items-center space-x-2">
        <Icon name="Target" size={16} className="text-primary" />
        <h3 className={`text-sm font-semibold ${s.text}`}>{goal ? 'Change your goal' : 'Set your career goal'}</h3>
      </div>
      <p className={`text-xs ${s.muted}`}>Pick the role you’re preparing for. Daily questions and your Readiness Score follow it.</p>
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

  useEffect(() => {
    ensureDailyChallenge();
  }, [progress.goal]);

  const streak = activeStreak(progress);
  const done = dailyDone(progress);
  const ready = readiness(progress);
  const mistakes = mistakeIds(progress);
  const { daily, goal } = progress;
  const answeredToday = daily.ids.filter((id) => id in daily.answers).length;
  const nextMilestone = MILESTONES.find((m) => m > ready.percent);
  const toNextMilestone = nextMilestone ? Math.ceil((nextMilestone / 100) * ready.total) - ready.mastered : 0;

  const pro = usePro();
  const { setActiveTab } = useWidget();
  const canRevise = pro || runsToday(progress) < FREE_RUNS_PER_DAY;

  const shareBadge = async () => {
    if (!pro) {
      setActiveTab('account');
      return;
    }
    const result = await shareReadinessBadge({
      percent: ready.percent,
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

      {/* Goal and readiness */}
      {!goal || editingGoal ? (
        <GoalPicker goal={goal} onDone={() => setEditingGoal(false)} s={s} />
      ) : (
        <div className={`${s.card} p-3 flex items-center space-x-3`}>
          <ReadinessRing percent={ready.percent} dark={s.dark} />
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-wide font-medium ${s.muted}`}>Readiness</p>
            <p className={`text-sm font-semibold leading-snug ${s.text}`}>
              {roleById[goal.role].shortName} in {industryById[goal.industry].name}
            </p>
            <p className={`text-[11px] ${s.muted}`}>
              {ready.mastered} of {ready.total} mastered
              {nextMilestone ? ` · ${toNextMilestone} more to ${nextMilestone}%` : ' · Fully ready!'}
            </p>
            <div className="mt-1 flex items-center space-x-3">
              <button onClick={() => setEditingGoal(true)} className="flex items-center space-x-1 text-[11px] font-medium text-primary hover:underline">
                <Icon name="Pencil" size={11} />
                <span>Change goal</span>
              </button>
              <button onClick={shareBadge} className="flex items-center space-x-1 text-[11px] font-medium text-primary hover:underline">
                <Icon name={pro ? 'Share2' : 'Crown'} size={11} />
                <span>Share badge</span>
              </button>
            </div>
            {shareNote && <p className="text-[10px] mt-1 text-success-600">{shareNote}</p>}
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
              {canRevise ? 'Get them right to raise your Readiness Score.' : 'Free practice used today. Tap to see Pro.'}
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
