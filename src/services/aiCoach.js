/**
 * Talks to the AI provider the user connected (see aiKeys.js), straight from the browser.
 * Loaded only with the AI Coach tab.
 */

export const PROVIDERS = {
  anthropic: {
    label: 'Claude',
    company: 'Anthropic',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-…',
    defaultModel: 'claude-opus-5-5',
  },
  openai: {
    label: 'ChatGPT',
    company: 'OpenAI',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-…',
  },
  gemini: {
    label: 'Gemini',
    company: 'Google',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyPlaceholder: 'AIza…',
  },
  openrouter: {
    label: 'OpenRouter',
    company: 'any model',
    keyUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-…',
    defaultModel: 'openrouter/auto',
  },
};

const CLAUDE_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];
// Models that accept server-side refusal fallbacks (re-run on another model if a request is declined).
const CLAUDE_FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5']);

const NOT_CHAT = /(audio|realtime|tts|transcribe|image|search|embedding|moderation|instruct|vision-preview)/i;

/** The models the user's key can use, newest first where the provider says so. */
export async function listModels(provider, key) {
  if (provider === 'anthropic') return CLAUDE_MODELS;
  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(res.status === 401 ? 'That OpenAI key was not accepted.' : 'Could not reach OpenAI.');
    const { data } = await res.json();
    return data
      .filter((m) => /^(gpt|o\d|chatgpt)/.test(m.id) && !NOT_CHAT.test(m.id))
      .sort((a, b) => b.created - a.created)
      .map((m) => m.id);
  }
  if (provider === 'gemini') {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', { headers: { 'x-goog-api-key': key } });
    if (!res.ok) throw new Error(res.status === 400 || res.status === 403 ? 'That Gemini key was not accepted.' : 'Could not reach Gemini.');
    const { models = [] } = await res.json();
    return models
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent') && /^models\/gemini/.test(m.name) && !NOT_CHAT.test(m.name))
      .map((m) => m.name.replace(/^models\//, ''))
      .reverse();
  }
  const res = await fetch('https://openrouter.ai/api/v1/models');
  if (!res.ok) throw new Error('Could not reach OpenRouter.');
  const { data } = await res.json();
  return ['openrouter/auto', ...data.map((m) => m.id)];
}

/**
 * Sends the conversation and returns the reply text.
 * @param {{ provider: string, model: string, key: string }} connection
 * @param {string} system instructions and the learner's profile
 * @param {{ role: 'user' | 'assistant', content: string }[]} messages
 */
export async function ask(connection, system, messages) {
  const { provider, model, key } = connection;
  if (provider === 'anthropic') return askClaude(model, key, system, messages);
  if (provider === 'gemini') return askGemini(model, key, system, messages);

  const url = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'CXentric';
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(providerError(res.status, body?.error?.message));
  return body.choices?.[0]?.message?.content?.trim() || 'No answer came back. Please try again.';
}

async function askClaude(model, key, system, messages) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  // The key is the user's own, typed into their own browser, so calling from the browser is intended here.
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 16000,
      system,
      messages,
      ...(CLAUDE_FALLBACK_MODELS.has(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
    });
    if (response.stop_reason === 'refusal') {
      return 'Claude declined to answer that one. Try asking in a different way.';
    }
    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
    return text || 'No answer came back. Please try again.';
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error(providerError(401));
    if (err instanceof Anthropic.PermissionDeniedError) throw new Error(providerError(403, err.message));
    if (err instanceof Anthropic.NotFoundError) throw new Error(providerError(404));
    if (err instanceof Anthropic.RateLimitError) throw new Error(providerError(429));
    if (err instanceof Anthropic.APIError) throw new Error(providerError(err.status, err.message));
    throw new Error('Could not reach Claude. Check your connection.');
  }
}

async function askGemini(model, key, system, messages) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(providerError(res.status, body?.error?.message));
  const parts = body.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('').trim() || 'No answer came back. Please try again.';
}

function providerError(status, detail) {
  if (status === 401 || status === 403) return 'Your AI key was not accepted. Check it, or connect again.';
  if (status === 404) return 'That model is not available on your account. Pick another one.';
  if (status === 429) return 'Your AI account hit its rate or credit limit. Wait a moment, or check your billing with the provider.';
  if (status === 402) return 'Your AI account is out of credit. Top up with the provider to keep using the coach.';
  return detail ? `The AI provider said: ${detail}` : 'The AI provider returned an error. Please try again.';
}
