const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {});
  }
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }
  if (!OPENAI_API_KEY) {
    return response(500, { error: 'OpenAI API key not configured' });
  }

  let primaryColor;
  try {
    const body = JSON.parse(event.body ?? '{}');
    primaryColor = body.primaryColor;
  } catch {
    return response(400, { error: 'Invalid JSON body' });
  }

  if (!primaryColor || !/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
    return response(400, { error: 'primaryColor must be a 6-digit hex colour (e.g. #22d3ee)' });
  }

  const systemPrompt = `You are a UI design expert. Given a primary brand colour, generate a complete, harmonious design token palette.
Return ONLY valid JSON with no extra text. The JSON must be an object where keys are token IDs and values are 6-digit lowercase hex colours (e.g. "#22d3ee").

Required token IDs:
- primary (use the provided colour)
- secondary (a complementary or analogous hue)
- accent (a vibrant highlight colour)
- muted (a desaturated version for subtle backgrounds)
- foreground (text colour — high contrast against background)
- background (page/surface base colour — near white or near black depending on palette)
- border (a soft separator colour)
- input (a slightly elevated surface colour for inputs)
- ring (a focus ring colour, usually matching primary with some opacity — pick a solid colour)
- success (a green-family colour)
- warning (an amber/yellow-family colour)
- info (a blue-family colour)
- destructive (a red-family danger colour)
- chart-1 (a data viz colour)
- chart-2 (a data viz colour, distinct from chart-1)
- chart-3 (a data viz colour, distinct from chart-1 and chart-2)

Make the palette cohesive. If the primary is a cool blue, lean cool; if warm orange, lean warm. Ensure foreground is legible over background.`;

  const userPrompt = `Primary colour: ${primaryColor}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('OpenAI error:', errText);
      return response(502, { error: 'OpenAI request failed' });
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? '{}';
    let palette;
    try {
      palette = JSON.parse(content);
    } catch {
      return response(502, { error: 'OpenAI returned invalid JSON' });
    }

    // Sanitize: only keep valid hex values
    const validTokenIds = [
      'primary', 'secondary', 'accent', 'muted', 'foreground', 'background',
      'border', 'input', 'ring', 'success', 'warning', 'info', 'destructive',
      'chart-1', 'chart-2', 'chart-3',
    ];
    const sanitized = {};
    for (const id of validTokenIds) {
      const val = palette[id];
      if (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val)) {
        sanitized[id] = val.toLowerCase();
      }
    }

    if (Object.keys(sanitized).length < 5) {
      return response(502, { error: 'OpenAI returned too few valid colour tokens' });
    }

    return response(200, { palette: sanitized });
  } catch (err) {
    console.error('suggest-palette error:', err);
    return response(500, { error: 'Internal server error' });
  }
};
