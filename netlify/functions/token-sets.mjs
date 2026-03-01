import { neon } from '@neondatabase/serverless';

const PROJECT_ID = process.env.NEON_PROJECT_ID || 'misty-mountain-32290731';

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-ui-studio-user-id',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

async function getUserId(sql, event) {
  // Priority 1: Bearer session token
  const authHeader = event?.headers?.['authorization'] ?? event?.headers?.['Authorization'] ?? '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch) {
    const token = bearerMatch[1].trim();
    const rows = await sql`
      SELECT user_id FROM user_sessions
      WHERE token = ${token}
        AND expires_at > NOW()
      LIMIT 1
    `;
    if (rows[0]?.user_id) return rows[0].user_id;
  }

  // Priority 2: Netlify Identity
  const identityUserId = event?.clientContext?.user?.sub;
  if (typeof identityUserId === 'string' && identityUserId.trim()) {
    return identityUserId.trim();
  }

  // Priority 3: Legacy custom header (local dev fallback)
  const headerUserId = event?.headers?.['x-ui-studio-user-id'] ?? event?.headers?.['X-UI-STUDIO-USER-ID'];
  if (typeof headerUserId === 'string' && headerUserId.trim()) {
    return headerUserId.trim();
  }

  return null;
}

function sanitizeTokenSet(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const setId = typeof input.id === 'string' ? input.id.trim() : '';
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const source = input.source === 'system' ? 'system' : 'user';

  if (!setId || !name || source !== 'user') {
    return null;
  }

  if (!Array.isArray(input.tokens)) {
    return null;
  }

  const tokens = input.tokens
    .map((token) => {
      if (!token || typeof token !== 'object') {
        return null;
      }
      const id = typeof token.id === 'string' ? token.id.trim() : '';
      const label = typeof token.label === 'string' ? token.label.trim() : '';
      const cssVar = typeof token.cssVar === 'string' && token.cssVar.trim() ? token.cssVar.trim() : undefined;
      const value = typeof token.value === 'string' && token.value.trim() ? token.value.trim().toLowerCase() : undefined;
      if (!id || !label || (!cssVar && !value)) {
        return null;
      }
      return { id, label, cssVar, value };
    })
    .filter((token) => token !== null);

  if (!tokens.length) {
    return null;
  }

  const normalizeDimension = (value, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.max(0, Math.min(640, Math.round(parsed)));
  };

  const sizeSource = input.sizeTokens && typeof input.sizeTokens === 'object' ? input.sizeTokens : {};
  const sizeTokens = {
    sm: {
      height: normalizeDimension(sizeSource?.sm?.height, 34),
      ...(normalizeDimension(sizeSource?.sm?.width, 0) > 0
        ? { width: normalizeDimension(sizeSource?.sm?.width, 0) }
        : {}),
    },
    md: {
      height: normalizeDimension(sizeSource?.md?.height, 38),
      ...(normalizeDimension(sizeSource?.md?.width, 0) > 0
        ? { width: normalizeDimension(sizeSource?.md?.width, 0) }
        : {}),
    },
    lg: {
      height: normalizeDimension(sizeSource?.lg?.height, 44),
      ...(normalizeDimension(sizeSource?.lg?.width, 0) > 0
        ? { width: normalizeDimension(sizeSource?.lg?.width, 0) }
        : {}),
    },
  };

  return {
    id: setId,
    name,
    source,
    tokens,
    sizeTokens,
  };
}

async function listTokenSets(sql, userId) {
  const rows = await sql`
    SELECT
      set_id,
      name,
      tokens,
      size_tokens,
      updated_at
    FROM studio_user_token_sets
    WHERE project_id = ${PROJECT_ID} AND user_id = ${userId}
    ORDER BY updated_at DESC;
  `;

  return rows.map((row) => ({
    id: row.set_id,
    name: row.name,
    source: 'user',
    tokens: Array.isArray(row.tokens) ? row.tokens : [],
    sizeTokens: row.size_tokens && typeof row.size_tokens === 'object' ? row.size_tokens : {},
    updatedAt: row.updated_at,
  }));
}

async function upsertTokenSet(sql, userId, tokenSet) {
  const rows = await sql`
    INSERT INTO studio_user_token_sets (project_id, user_id, set_id, name, tokens, size_tokens)
    VALUES (
      ${PROJECT_ID},
      ${userId},
      ${tokenSet.id},
      ${tokenSet.name},
      ${JSON.stringify(tokenSet.tokens)}::jsonb,
      ${JSON.stringify(tokenSet.sizeTokens ?? {})}::jsonb
    )
    ON CONFLICT (project_id, user_id, set_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      tokens = EXCLUDED.tokens,
      size_tokens = EXCLUDED.size_tokens,
      updated_at = NOW()
    RETURNING set_id, name, tokens, size_tokens, updated_at;
  `;

  const row = rows[0];
  return {
    id: row.set_id,
    name: row.name,
    source: 'user',
    tokens: Array.isArray(row.tokens) ? row.tokens : [],
    sizeTokens: row.size_tokens && typeof row.size_tokens === 'object' ? row.size_tokens : {},
    updatedAt: row.updated_at,
  };
}

async function deleteTokenSet(sql, userId, setId) {
  await sql`
    DELETE FROM studio_user_token_sets
    WHERE project_id = ${PROJECT_ID}
      AND user_id = ${userId}
      AND set_id = ${setId};
  `;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return response(500, { error: 'NEON_DATABASE_URL is not configured' });
  }

  const sql = neon(databaseUrl);

  const userId = await getUserId(sql, event);
  if (!userId) {
    return response(401, { error: 'Missing user identity' });
  }

  try {
    if (event.httpMethod === 'GET') {
      const tokenSets = await listTokenSets(sql, userId);
      return response(200, { tokenSets });
    }

    if (event.httpMethod === 'POST') {
      const parsedBody = event.body ? JSON.parse(event.body) : null;
      const tokenSet = sanitizeTokenSet(parsedBody);
      if (!tokenSet) {
        return response(400, { error: 'Invalid token set payload' });
      }
      const saved = await upsertTokenSet(sql, userId, tokenSet);
      return response(200, saved);
    }

    if (event.httpMethod === 'DELETE') {
      const setId = (event.queryStringParameters?.setId || '').trim();
      if (!setId) {
        return response(400, { error: 'Missing setId' });
      }
      await deleteTokenSet(sql, userId, setId);
      return response(200, { ok: true });
    }

    return response(405, { error: 'Method not allowed' });
  } catch (error) {
    return response(500, {
      error: error instanceof Error ? error.message : 'Unhandled server error',
    });
  }
}
