import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../AppIcon';
import { useSettings } from '../../services/appSettings';
import { industryById, itemById, roleById } from '../../data/kb';
import { PROVIDERS, ask, listModels } from '../../services/aiCoach';
import {
  forgetConnection,
  saveConnection,
  startOpenRouterConnect,
  takePendingQuestion,
  useAiConnection,
} from '../../services/aiKeys';
import { mistakeIds, readiness, useProgress } from '../../services/progress';
import { activeStreak } from '../../services/progressStore';
import { UpgradeCard, usePro } from './ProGate';
import { useKbStyles } from './kbUi';

const HISTORY_TURNS = 12;

/** The coach's instructions plus what CXentric knows about the learner, so answers are personal. */
function buildSystemPrompt(progress) {
  const { goal } = progress;
  const ready = readiness(progress);
  const missed = mistakeIds(progress)
    .slice(0, 8)
    .map((id) => itemById[id])
    .filter(Boolean)
    .map((item) => `- ${item.question} (correct answer: ${item.short})`)
    .join('\n');

  const profile = [
    goal
      ? `Goal: ${roleById[goal.role].name} in ${industryById[goal.industry].name}. Readiness score: ${ready.percent}% (${ready.mastered} of ${ready.total} key questions mastered).`
      : 'Goal: not set yet.',
    `Daily streak: ${activeStreak(progress)} days. XP: ${progress.xp}.`,
    missed ? `Questions they recently got wrong:\n${missed}` : 'No wrong answers recorded yet.',
  ].join('\n');

  return `You are the AI Career Coach inside CXentric, a career-preparation app for professionals in India.
Help the learner get job-ready for their goal: explain concepts, plan their preparation, run mock interviews, and give feedback.
Be warm, specific and practical. Keep answers short enough to read in a small chat panel (about 150-250 words) unless they ask for more.
Write plain text: short paragraphs and "-" bullet lists. Do not use markdown headings, bold, tables or code blocks.
When you mention companies, salaries or hiring trends, say they are general guidance and may have changed.

About the learner (from their CXentric progress):
${profile}`;
}

const Connect = ({ s, error, connecting }) => {
  const [provider, setProvider] = useState('anthropic');
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const info = PROVIDERS[provider];

  const connect = async (e) => {
    e.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      const models = await listModels(provider, key.trim());
      if (!models.length) throw new Error('No chat models are available on that key.');
      saveConnection({ provider, model: info.defaultModel && models.includes(info.defaultModel) ? info.defaultModel : models[0], key: key.trim() });
    } catch (err) {
      setProblem(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div>
        <h3 className={`text-sm font-semibold ${s.text}`}>Connect your AI</h3>
        <p className={`text-xs mt-1 ${s.muted}`}>
          Use your own Claude, ChatGPT or Gemini as a personal coach that knows your goal, score and weak spots.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="AI provider">
        {['anthropic', 'openai', 'gemini'].map((id) => (
          <button
            key={id}
            onClick={() => setProvider(id)}
            aria-pressed={provider === id}
            className={`py-1.5 rounded-md border text-xs font-medium ${
              provider === id
                ? 'border-primary bg-primary text-white'
                : s.dark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {PROVIDERS[id].label}
          </button>
        ))}
      </div>

      <form onSubmit={connect} className="space-y-2">
        <input
          type="password"
          required
          autoComplete="off"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={`${info.label} API key (${info.keyPlaceholder})`}
          aria-label={`${info.label} API key`}
          className={s.select}
        />
        <button type="submit" disabled={busy} className="w-full py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-60">
          {busy ? 'Checking key…' : `Connect ${info.label}`}
        </button>
      </form>
      <p className={`text-[11px] ${s.muted}`}>
        Get a key from{' '}
        <a href={info.keyUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {info.company}
        </a>
        . An API key is billed by the provider, separately from a ChatGPT Plus, Claude Pro or Gemini subscription; a short coaching chat usually costs about a rupee or less.
      </p>

      <div className={`flex items-center space-x-2 text-[10px] ${s.muted}`}>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
        <span>no key? one sign-in for every model</span>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
      </div>
      <button
        onClick={startOpenRouterConnect}
        disabled={connecting}
        className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md border text-xs font-medium disabled:opacity-60 ${
          s.dark ? 'border-gray-600 text-gray-100 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <Icon name="Link" size={14} />
        <span>{connecting ? 'Connecting OpenRouter…' : 'Connect with OpenRouter'}</span>
      </button>

      {(problem || error) && <p className="text-xs text-error">{problem || error}</p>}
      <p className={`text-[10px] flex items-start space-x-1 ${s.muted}`}>
        <Icon name="Lock" size={11} className="flex-shrink-0 mt-px" />
        <span>Your key is stored only in this browser and sent only to {info.company === 'any model' ? 'OpenRouter' : info.company}. CXentric never sees it.</span>
      </p>
    </div>
  );
};

const CoachPanel = () => {
  const s = useKbStyles();
  const pro = usePro();
  const proOnly = useSettings().ai_coach_pro_only;
  const progress = useProgress();
  const { connection, connecting, error } = useAiConnection();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [problem, setProblem] = useState(null);
  const [models, setModels] = useState([]);
  const endRef = useRef(null);

  const goal = progress.goal;
  const suggestions = useMemo(
    () => [
      'What should I focus on this week?',
      'Explain the questions I got wrong',
      goal ? `Ask me a mock interview question for ${roleById[goal.role].shortName}` : 'Help me choose a career goal',
      'Make me a 30-day plan to be job-ready',
    ],
    [goal]
  );

  const send = async (text) => {
    const question = text.trim();
    if (!question || thinking || !connection) return;
    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setThinking(true);
    setProblem(null);
    try {
      const reply = await ask(connection, buildSystemPrompt(progress), next.slice(-HISTORY_TURNS));
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setProblem(err.message);
    } finally {
      setThinking(false);
    }
  };

  // A question handed over from another tab (e.g. "Ask AI Coach" on a Learn answer).
  useEffect(() => {
    if (!connection || (proOnly && !pro)) return;
    const pending = takePendingQuestion();
    if (pending) send(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, pro, proOnly]);

  useEffect(() => {
    if (!connection) return;
    listModels(connection.provider, connection.key).then(setModels, () => setModels([]));
  }, [connection?.provider, connection?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  if (proOnly && !pro) {
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <UpgradeCard
          title="AI Coach is a Pro feature"
          text="Bring your own ChatGPT, Claude or Gemini and get coaching that knows your goal, Readiness Score and the questions you missed."
        />
      </div>
    );
  }

  if (!connection) return <Connect s={s} error={error} connecting={connecting} />;

  const provider = PROVIDERS[connection.provider];
  const modelOptions = models.includes(connection.model) ? models : [connection.model, ...models];

  return (
    <div className="h-full flex flex-col">
      <div className={`px-3 py-2 border-b flex items-center space-x-2 ${s.dark ? 'border-gray-600' : 'border-gray-200'}`}>
        <Icon name="Bot" size={14} className="text-primary flex-shrink-0" />
        <select
          aria-label="Model"
          value={connection.model}
          onChange={(e) => saveConnection({ ...connection, model: e.target.value })}
          className={`${s.select} py-1 text-[11px]`}
        >
          {modelOptions.map((m) => (
            <option key={m} value={m}>{provider.label} · {m}</option>
          ))}
        </select>
        <button
          onClick={() => {
            forgetConnection();
            setMessages([]);
          }}
          title="Disconnect and forget the key on this device"
          className={`flex-shrink-0 text-[11px] ${s.muted} hover:underline`}
        >
          Disconnect
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className={`text-xs ${s.muted}`}>Ask anything about your career prep. Try:</p>
            {suggestions.map((text) => (
              <button key={text} onClick={() => send(text)} className={`${s.rowButton} flex items-start space-x-2`}>
                <Icon name="Sparkles" size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{text}</span>
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-primary text-white' : `${s.card} ${s.text}`
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className={`flex items-center space-x-2 text-xs ${s.muted}`}>
            <Icon name="Loader2" size={14} className="animate-spin" />
            <span>Coach is thinking…</span>
          </div>
        )}
        {problem && <p className="text-xs text-error">{problem}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={`p-2 border-t flex space-x-2 ${s.dark ? 'border-gray-600' : 'border-gray-200'}`}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          aria-label="Ask your coach"
          className={s.select}
        />
        <button type="submit" disabled={thinking || !input.trim()} aria-label="Send" className="px-3 rounded-md bg-primary text-white hover:bg-primary-700 disabled:opacity-50">
          <Icon name="Send" size={14} />
        </button>
      </form>
    </div>
  );
};

export default CoachPanel;
