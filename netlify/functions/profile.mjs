import { neon } from '@neondatabase/serverless';

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

async function getUserId(sql, event) {
  const authHeader = event?.headers?.['authorization'] ?? event?.headers?.['Authorization'] ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  const rows = await sql`
    SELECT user_id FROM user_sessions
    WHERE token = ${token} AND expires_at > NOW()
    LIMIT 1
  `;
  return rows[0]?.user_id ?? null;
}

// Max avatar size: 512KB as base64 (~384KB raw) — enough for a 256x256 JPEG
const MAX_AVATAR_BYTES = 512 * 1024;

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) return response(500, { message: 'Database not configured' });

  const sql = neon(databaseUrl);
  const userId = await getUserId(sql, event);
  if (!userId) return response(401, { message: 'Unauthorized' });

  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, email, name, avatar_url FROM users WHERE id = ${userId} LIMIT 1
      `;
      if (!rows[0]) return response(404, { message: 'User not found' });
      return response(200, { user: rows[0] });
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');

      const name = typeof body.name === 'string' ? body.name.trim() || null : null;

      let avatarUrl = undefined; // undefined = don't update
      if ('avatar_url' in body) {
        const raw = body.avatar_url;
        if (raw === null || raw === '') {
          avatarUrl = null;
        } else if (typeof raw === 'string') {
          // Accept data URLs (base64) or https URLs
          const isDataUrl = raw.startsWith('data:image/');
          const isHttps = raw.startsWith('https://');
          if (!isDataUrl && !isHttps) {
            return response(400, { message: 'avatar_url must be a data URL or https URL' });
          }
          if (Buffer.byteLength(raw, 'utf8') > MAX_AVATAR_BYTES) {
            return response(400, { message: 'Avatar image is too large (max 512KB)' });
          }
          avatarUrl = raw;
        }
      }

      let rows;
      if (avatarUrl !== undefined) {
        rows = await sql`
          UPDATE users SET name = ${name}, avatar_url = ${avatarUrl}, updated_at = NOW()
          WHERE id = ${userId}
          RETURNING id, email, name, avatar_url
        `;
      } else {
        rows = await sql`
          UPDATE users SET name = ${name}
          WHERE id = ${userId}
          RETURNING id, email, name, avatar_url
        `;
      }

      if (!rows[0]) return response(404, { message: 'User not found' });
      return response(200, { user: rows[0] });
    }

    return response(405, { message: 'Method not allowed' });
  } catch (err) {
    return response(500, { message: err instanceof Error ? err.message : 'Server error' });
  }
}
