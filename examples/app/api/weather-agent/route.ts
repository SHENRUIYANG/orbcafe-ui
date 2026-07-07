import { NextRequest, NextResponse } from 'next/server';

const buildChatEndpoint = (baseUrl: string) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  if (normalizedBaseUrl.endsWith('/chat/completions')) {
    return normalizedBaseUrl;
  }

  return `${normalizedBaseUrl}/chat/completions`;
};

const readAssistantContent = (payload: unknown) => {
  const data = payload as {
    choices?: Array<{ message?: { content?: string }; text?: string }>;
    output_text?: string;
  };

  return data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? data.output_text ?? '';
};

export async function POST(request: NextRequest) {
  const { query } = (await request.json()) as { query?: string };
  const userQuery = query?.trim();

  if (!userQuery) {
    return NextResponse.json({ error: 'Missing weather query.' }, { status: 400 });
  }

  const baseUrl = process.env.LLM_BASEURL;
  const apiKey = process.env.LLM_APIKEY;
  const model = process.env.LLM_MODEL;

  if (!baseUrl || !apiKey || !model) {
    return NextResponse.json(
      { error: 'Missing LLM_BASEURL, LLM_APIKEY, or LLM_MODEL in examples/.env.' },
      { status: 500 },
    );
  }

  const response = await fetch(buildChatEndpoint(baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'You are the ORBCAFE AI Panel weather demo agent.',
            'Answer in concise Chinese.',
            'Extract the city or region from the user request.',
            'This demo has no live weather tool, so do not claim that you queried a real-time weather API.',
            'Return a useful, realistic demo weather brief with temperature, condition, wind, and action advice.',
            'If the user did not provide a location, ask for the location.'
          ].join(' '),
        },
        {
          role: 'user',
          content: userQuery,
        },
      ],
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          payload && typeof payload === 'object' && 'error' in payload
            ? 'Weather agent request failed.'
            : `Weather agent request failed with status ${response.status}.`,
      },
      { status: response.status },
    );
  }

  const answer = readAssistantContent(payload).trim();

  return NextResponse.json({
    answer: answer || '天气查询已完成，但模型没有返回可展示的内容。',
  });
}
