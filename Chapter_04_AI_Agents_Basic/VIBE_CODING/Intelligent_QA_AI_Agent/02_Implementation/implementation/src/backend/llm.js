import { AppError } from './errors.js';

const GROQ_URL = 'https://api.groq.com/openai/v1';
const OLLAMA_URL = 'http://127.0.0.1:11434';

function providerUrl(provider, endpoint) {
  if (provider === 'groq') return `${GROQ_URL}${endpoint}`;
  if (provider === 'ollama') return `${OLLAMA_URL}${endpoint}`;
  throw new AppError(400, 'Choose Groq or Ollama as the LLM provider.');
}

function checkProviderConfig(provider, config) {
  if (provider === 'groq' && !config.groqApiKey) {
    throw new AppError(503, 'Groq is not configured. Add GROQ_API_KEY to cred.env.');
  }
}

export function validateModelSelection(provider, model, config) {
  if (!['groq', 'ollama'].includes(provider)) {
    throw new AppError(400, 'Choose Groq or Ollama as the LLM provider.');
  }
  checkProviderConfig(provider, config);
  if (typeof model !== 'string' || !model.trim() || model.length > 200) {
    throw new AppError(400, 'Select an available model in Settings.');
  }
}

async function providerFetch(url, options, provider, fetchImpl) {
  try {
    const response = await fetchImpl(url, {
      ...options,
      signal: AbortSignal.timeout(45000),
    });
    return response;
  } catch {
    const message = provider === 'ollama'
      ? 'Could not reach Ollama at 127.0.0.1:11434. Start the local service and try again.'
      : 'Could not reach Groq. Check the network connection and try again.';
    throw new AppError(502, message);
  }
}

async function readJson(response, provider) {
  if (response.status === 429) {
    let providerError = {};
    try {
      const payload = await response.json();
      providerError = payload?.error ?? {};
    } catch {
      providerError = {};
    }
    const providerMessage = [providerError.type, providerError.code, providerError.message]
      .filter(Boolean)
      .join(' ');
    const isRateLimit = /rate.?limit|too many requests|tokens? per minute|requests? per minute|\b(?:tpm|rpm)\b|try again in/i
      .test(providerMessage);
    const isQuotaExhausted = /insufficient_quota|quota.{0,20}(?:exhausted|depleted)|exceeded.{0,40}quota|no (?:remaining|available) credits|billing.{0,30}(?:limit|issue)/i
      .test(providerMessage);
    const retryAfter = response.headers?.get('retry-after');
    const bodyDelay = providerError.message?.match(/try again in\s+([\d.]+)\s*(ms|s|sec|seconds|m|min)/i);
    let retrySeconds = retryAfter && /^\d+(\.\d+)?$/.test(retryAfter) ? Number(retryAfter) : 0;
    if (!retrySeconds && bodyDelay) {
      retrySeconds = Number(bodyDelay[1]) * (/^m|min$/i.test(bodyDelay[2]) ? 60 : /^ms$/i.test(bodyDelay[2]) ? 0.001 : 1);
    }
    const delay = retrySeconds > 0
      ? ` Retry in about ${Math.max(1, Math.ceil(retrySeconds))} seconds.`
      : '';
    const label = provider === 'groq' ? 'Groq' : 'Ollama';
    const message = provider === 'groq' && isQuotaExhausted && !isRateLimit
      ? 'Groq quota is exhausted. Check the provider account limits or select a local Ollama model.'
      : `${label} rate limit reached.${delay} Wait for the limit to reset or select a local Ollama model.`;
    throw new AppError(429, message);
  }
  if (!response.ok) {
    if (response.status === 413) {
      const providerName = provider === 'groq' ? 'Groq' : 'Ollama';
      throw new AppError(413, `${providerName} rejected the request because it is too large for the selected model. The Jira text has been shortened where possible; try a smaller Jira issue or select a model with a larger context window.`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new AppError(502, 'The LLM provider rejected its configured credentials.');
    }
    if (response.status === 404) {
      throw new AppError(400, 'The selected model is not available from this provider.');
    }
    throw new AppError(502, `${provider === 'groq' ? 'Groq' : 'Ollama'} request failed (${response.status}).`);
  }
  try {
    return await response.json();
  } catch {
    throw new AppError(502, 'The LLM provider returned an unreadable response.');
  }
}

export async function listModels(provider, config, fetchImpl = fetch) {
  checkProviderConfig(provider, config);
  const url = providerUrl(provider, provider === 'groq' ? '/models' : '/api/tags');
  const headers = provider === 'groq' ? { Authorization: `Bearer ${config.groqApiKey}` } : {};
  const response = await providerFetch(url, { headers }, provider, fetchImpl);
  const payload = await readJson(response, provider);
  const entries = provider === 'groq' ? payload.data : payload.models;
  if (!Array.isArray(entries)) throw new AppError(502, 'The provider returned an invalid model list.');
  return entries
    .map((entry) => provider === 'groq' ? entry.id : entry.name)
    .filter((name) => typeof name === 'string' && name.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

export async function completeChat(provider, model, messages, config, fetchImpl = fetch) {
  validateModelSelection(provider, model, config);

  const url = providerUrl(provider, provider === 'groq' ? '/chat/completions' : '/api/chat');
  const headers = { 'Content-Type': 'application/json' };
  let body;
  if (provider === 'groq') {
    headers.Authorization = `Bearer ${config.groqApiKey}`;
    body = { model, messages, temperature: 0 };
  } else {
    body = { model, messages, stream: false, options: { temperature: 0 } };
  }

  const response = await providerFetch(url, { method: 'POST', headers, body: JSON.stringify(body) }, provider, fetchImpl);
  const payload = await readJson(response, provider);
  const content = provider === 'groq'
    ? payload.choices?.[0]?.message?.content
    : payload.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new AppError(502, 'The LLM provider returned an empty response.');
  }
  return content.trim();
}

export async function testModel(provider, model, config, fetchImpl = fetch) {
  const content = await completeChat(provider, model, [{ role: 'user', content: 'Reply with OK only.' }], config, fetchImpl);
  if (!/\bOK\b/i.test(content)) throw new AppError(502, 'The model responded, but the connection check was not conclusive.');
}

