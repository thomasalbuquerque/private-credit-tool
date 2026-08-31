export type LlmProvider = 'openai' | 'anthropic' | 'gemini';

export class LlmConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LlmConfigError';
  }
}

export class LlmRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'LlmRequestError';
    this.status = status;
  }
}

interface GenerateTextParams {
  system: string;
  prompt: string;
}

interface GenerateTextResult {
  text: string;
  provider: LlmProvider;
  model: string;
}

function resolveProvider(): LlmProvider {
  const raw = (process.env.LLM_PROVIDER ?? 'openai').trim().toLowerCase();

  if (raw !== 'openai' && raw !== 'anthropic' && raw !== 'gemini') {
    throw new LlmConfigError(`Unknown LLM_PROVIDER "${raw}". Set it to one of: openai, anthropic, gemini in .env.`);
  }

  return raw;
}

function getSharedSettings() {
  const maxOutputTokens = Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? '2000');
  const temperature = Number(process.env.LLM_TEMPERATURE ?? '0.3');

  return {
    maxOutputTokens: Number.isFinite(maxOutputTokens) ? maxOutputTokens : 2000,
    temperature: Number.isFinite(temperature) ? temperature : 0.3,
  };
}

async function callOpenAi({ system, prompt }: GenerateTextParams): Promise<GenerateTextResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new LlmConfigError('OPENAI_API_KEY is not set. Add it to .env (see .env.example) and restart the dev server.');
  }
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const { maxOutputTokens, temperature } = getSharedSettings();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxOutputTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new LlmRequestError(`OpenAI request failed: ${errorBody}`, response.status);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    throw new LlmRequestError('OpenAI response did not include message content.', response.status);
  }

  return { text, provider: 'openai', model };
}

async function callAnthropic({ system, prompt }: GenerateTextParams): Promise<GenerateTextResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new LlmConfigError('ANTHROPIC_API_KEY is not set. Add it to .env (see .env.example) and restart the dev server.');
  }
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';
  const { maxOutputTokens, temperature } = getSharedSettings();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxOutputTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new LlmRequestError(`Anthropic request failed: ${errorBody}`, response.status);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new LlmRequestError('Anthropic response did not include text content.', response.status);
  }

  return { text, provider: 'anthropic', model };
}

async function callGemini({ system, prompt }: GenerateTextParams): Promise<GenerateTextResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new LlmConfigError('GEMINI_API_KEY is not set. Add it to .env (see .env.example) and restart the dev server.');
  }
  const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
  const { maxOutputTokens, temperature } = getSharedSettings();

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new LlmRequestError(`Gemini request failed: ${errorBody}`, response.status);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') {
    throw new LlmRequestError('Gemini response did not include text content.', response.status);
  }

  return { text, provider: 'gemini', model };
}

export async function generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
  const provider = resolveProvider();

  switch (provider) {
    case 'openai':
      return callOpenAi(params);
    case 'anthropic':
      return callAnthropic(params);
    case 'gemini':
      return callGemini(params);
  }
}
