import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../AppIcon';
import { useSettings } from '../../services/appSettings';
import { industryById, itemById, roleById } from '../../data/kb';
import { PROVIDERS, ask, listModels, providerOfKey } from '../../services/aiCoach';
import { useWidget } from '../../contexts/WidgetContext';
import {
  forgetConnection,
  saveConnection,
  startOpenRouterConnect,
  takePendingQuestion,
  useAiConnection,
} from '../../services/aiKeys';
import { INTERVIEW_RESULTS, mistakeIds, readiness, useProgress } from '../../services/progress';
import { prepScore } from '../../services/prepScore';
import { activeStreak } from '../../services/progressStore';
import { UpgradeCard, usePro } from './ProGate';
import { useKbStyles } from './kbUi';

const HISTORY_TURNS = 12;

/** The coach's instructions plus what CXentric knows about the learner, so answers are personal. */
function buildSystemPrompt(progress) {
  const { goal } = progress;
  const ready = readiness(progress);
  const score = prepScore(ready.mastered, ready.total);
  const missed = mistakeIds(progress)
    .slice(0, 8)
    .map((id) => itemById[id])
    .filter(Boolean)
    .map((item) => `- ${item.question} (correct answer: ${item.short})`)
    .join('\n');

  const interviews = progress.interviews
    .slice(0, 3)
    .map((i) => {
      const result = INTERVIEW_RESULTS.find((r) => r.id === i.result)?.label || i.result;
      return `- ${result}${i.date ? ` (${i.date})` : ''}${i.asked ? `. They were asked: ${i.asked.slice(0, 400)}` : ''}`;
    })
    .join('\n');

  const profile = [
    goal
      ? `Goal: ${roleById[goal.role].name} in ${industryById[goal.industry].name}.
Prep Score: ${score.level.label} (${score.correct}/${score.total} goal questions answered correctly).
This measures knowledge coverage only, not interview performance.
Never tell the learner they will pass or be hired.`
      : 'Goal: not set yet.',
    `Daily streak: ${activeStreak(progress)} days. XP: ${progress.xp}.`,
    missed ? `Questions they recently got wrong:\n${missed}` : 'No wrong answers recorded yet.',
    interviews ? `Interviews they logged in the app (newest first):\n${interviews}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `You are the AI Career Coach inside CXentric, a career-preparation app for professionals in India.
Help the learner prepare for their goal: explain concepts, plan their preparation, run mock interviews, and give feedback.
Never promise or predict that they will pass an interview or be hired.
Be warm, specific and practical. Keep answers short enough to read in a small chat panel (about 150-250 words) unless they ask for more.
Write plain text: short paragraphs and "-" bullet lists. Do not use markdown headings, bold, tables or code blocks.
When you mention companies, salaries or hiring trends, say they are general guidance and may have changed.

About the learner (from their CXentric progress):
${profile}`;
}

/** Where the coach's answers come from: the user's own AI account and model, not CXentric. */
const OwnAiNotice = ({ s, label, company, model }) => (
  <div className={`rounded-md p-2.5 text-[11px] leading-relaxed ${s.dark ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-gray-700'}`}>
    <p className="flex items-center space-x-1 font-semibold">
      <Icon name="Info" size={12} className="flex-shrink-0 text-primary" />
      <span>Answers come from your own AI</span>
    </p>
    <p className="mt-1">
      Everything the coach says is written by {label ? `your ${label} account` : 'the AI account you connect'}
      {model ? `, using the model you picked (${model})` : ', using the model you pick'}. CXentric does not write, check or store
      these answers, and any usage is billed to you by {company || 'your AI provider'}.
    </p>
  </div>
);

const STEP_NUMBER = 'flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center';

const Connect = ({ s, error, connecting, openRouterLocked }) => {
  const { setActiveTab } = useWidget();
  const [provider, setProvider] = useState('anthropic');
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const info = PROVIDERS[provider];

  // A pasted key that clearly belongs to another of the three AIs switches the choice to match.
  const takeKey = (value) => {
    setKey(value);
    setProblem(null);
    const detected = providerOfKey(value.trim());
    if (detected && detected !== 'openrouter') setProvider(detected);
  };

  const pasteFromClipboard = async () => {
    try {
      takeKey((await navigator.clipboard.readText()).trim());
    } catch {
      setProblem('Your browser blocked pasting. Click in the box and press Ctrl+V (or long-press and Paste).');
    }
  };

  const connect = async (e) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (providerOfKey(trimmed) === 'openrouter') {
      setProblem('That is an OpenRouter key. Use "Connect with OpenRouter" below instead.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const models = await listModels(provider, trimmed);
      if (!models.length) throw new Error('No chat models are available on that key.');
      saveConnection({ provider, model: info.defaultModel && models.includes(info.defaultModel) ? info.defaultModel : models[0], key: trimmed });
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

      <OwnAiNotice s={s} />

      <div className="flex items-start space-x-2">
        <span className={STEP_NUMBER}>1</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${s.text}`}>Choose your AI</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5" role="group" aria-label="AI provider">
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
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <span className={STEP_NUMBER}>2</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${s.text}`}>Get your {info.label} key</p>
          <a
            href={info.keyUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-1.5 w-full flex items-center justify-center space-x-1.5 py-2 rounded-md border text-xs font-medium ${
              s.dark ? 'border-gray-600 text-gray-100 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span>Open {info.company} key page</span>
            <Icon name="ExternalLink" size={12} />
          </a>
          <p className={`text-[11px] mt-1 ${s.muted}`}>{info.keySteps} Then come back to this tab.</p>
        </div>
      </div>

      <form onSubmit={connect} className="flex items-start space-x-2">
        <span className={STEP_NUMBER}>3</span>
        <div className="flex-1 min-w-0 space-y-2">
          <p className={`text-xs font-medium ${s.text}`}>Paste your key here</p>
          <div className="flex space-x-1.5">
            <input
              type="password"
              required
              autoComplete="off"
              value={key}
              onChange={(e) => takeKey(e.target.value)}
              placeholder={`${info.label} API key (${info.keyPlaceholder})`}
              aria-label={`${info.label} API key`}
              className={s.select}
            />
            {navigator.clipboard?.readText && (
              <button
                type="button"
                onClick={pasteFromClipboard}
                className={`flex-shrink-0 px-2.5 rounded-md border text-xs font-medium ${
                  s.dark ? 'border-gray-600 text-gray-100 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
                }`}
              >
                Paste
              </button>
            )}
          </div>
          <button type="submit" disabled={busy} className="w-full py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-60">
            {busy ? 'Checking key…' : `Connect ${info.label}`}
          </button>
        </div>
      </form>

      {(problem || error) && <p className="text-xs text-error">{problem || error}</p>}

      <p className={`text-[11px] ${s.muted}`}>
        An API key is billed by {info.company} for what you use, separately from a ChatGPT Plus, Claude Pro or Gemini subscription.
        A short coaching chat usually costs about a rupee or less.
      </p>
      <p className={`text-[10px] flex items-start space-x-1 ${s.muted}`}>
        <Icon name="Lock" size={11} className="flex-shrink-0 mt-px" />
        <span>Your key is stored only in this browser and sent only to {info.company}. CXentric never sees it.</span>
      </p>

      <div className={`flex items-center space-x-2 text-[10px] ${s.muted}`}>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
        <span>no key? one sign-in for every model</span>
        <span className={`flex-1 h-px ${s.dark ? 'bg-gray-600' : 'bg-gray-200'}`} />
      </div>
      <button
        onClick={openRouterLocked ? () => setActiveTab('account') : startOpenRouterConnect}
        disabled={connecting}
        className={`w-full flex items-center justify-center space-x-2 py-2 rounded-md border text-xs font-medium disabled:opacity-60 ${
          s.dark ? 'border-gray-600 text-gray-100 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <Icon name={openRouterLocked ? 'Crown' : 'Link'} size={14} className={openRouterLocked ? 'text-amber-500' : ''} />
        <span>{connecting ? 'Connecting OpenRouter…' : openRouterLocked ? 'Connect with OpenRouter · Pro' : 'Connect with OpenRouter'}</span>
      </button>
    </div>
  );
};

const CoachPanel = () => {
  const s = useKbStyles();
  const pro = usePro();
  const settings = useSettings();
  const proOnly = settings.ai_coach_pro_only;
  const openRouterLocked = settings.openrouter_pro_only && !pro;
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
      'Make me a 30-day prep plan for my goal',
    ],
    [goal]
  );

  const send = async (text) => {
    const question = text.trim();
    if (!question || thinking || !usable) return;
    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setThinking(true);
    setProblem(null);
    try {
      const reply = await ask(usable, buildSystemPrompt(progress), next.slice(-HISTORY_TURNS));
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setProblem(err.message);
    } finally {
      setThinking(false);
    }
  };

  // An OpenRouter connection only counts while the user may use OpenRouter (it is Pro-only).
  const usable = connection && !(connection.provider === 'openrouter' && openRouterLocked) ? connection : null;

  // A question handed over from another tab (e.g. "Ask AI Coach" on a Learn answer).
  useEffect(() => {
    if (!usable || (proOnly && !pro)) return;
    const pending = takePendingQuestion();
    if (pending) send(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usable, pro, proOnly]);

  useEffect(() => {
    if (!connection) return;
    listModels(connection.provider, connection.key).then(setModels, () => setModels([]));
  }, [connection?.provider, connection?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Not on an empty chat, so the "answers come from your own AI" notice stays in view.
    if (messages.length || thinking) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  if (proOnly && !pro) {
    return (
      <div className="h-full overflow-y-auto p-3 space-y-3">
        <UpgradeCard
          title="AI Coach is a Pro feature"
          text="Bring your own ChatGPT, Claude or Gemini and get coaching that knows your goal, Prep Score and the questions you missed."
        />
      </div>
    );
  }

  if (!usable) {
    return (
      <Connect
        s={s}
        error={error || (connection ? 'OpenRouter is a Pro feature. Upgrade, or connect your own Claude, ChatGPT or Gemini key.' : null)}
        connecting={connecting}
        openRouterLocked={openRouterLocked}
      />
    );
  }

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
            <OwnAiNotice s={s} label={provider.label} company={provider.company === 'any model' ? 'OpenRouter' : provider.company} model={connection.model} />
            <p className={`text-xs ${s.muted}`}>Ask anything about your career prep. Try:</p>
            {suggestions.map((text) => (
              <button key={text} onClick={() => send(text)} className={`${s.rowButton} flex items-start space-x-2`}>
                <Icon name="Sparkles" size={14} className="mt-0.5 flex-shrink-0 text-primary" />
                <span>{text}</span>
              </button>
            ))}
          </div>
        )}
        {messages.length > 0 && (
          <p className={`text-[10px] text-center ${s.muted}`}>
            Answers by your {provider.label} account · {connection.model}
          </p>
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
