import { neon } from '@neondatabase/serverless';

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

async function getUserIdFromSession(sql, event) {
  const authHeader = event?.headers?.['authorization'] ?? event?.headers?.['Authorization'] ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const token = match[1].trim();
  const rows = await sql`
    SELECT user_id FROM user_sessions
    WHERE token = ${token}
      AND expires_at > NOW()
    LIMIT 1
  `;
  return rows[0]?.user_id ?? null;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return response(500, { message: 'Database not configured' });
  }

  const sql = neon(databaseUrl);

  const userId = await getUserIdFromSession(sql, event);
  if (!userId) {
    return response(401, { message: 'Unauthorized' });
  }

  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, name, description, created_at, updated_at
        FROM projects
        WHERE user_id = ${userId}
        ORDER BY updated_at DESC
      `;
      return response(200, { projects: rows });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const description = typeof body.description === 'string' ? body.description.trim() || null : null;

      if (!name) {
        return response(400, { message: 'Project name is required' });
      }

      const rows = await sql`
        INSERT INTO projects (user_id, name, description)
        VALUES (${userId}, ${name}, ${description})
        RETURNING id, name, description, created_at, updated_at
      `;
      return response(201, rows[0]);
    }

    if (event.httpMethod === 'PUT') {
      const id = event.queryStringParameters?.id || '';
      if (!id) return response(400, { message: 'Missing project id' });

      const body = JSON.parse(event.body || '{}');
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const description = typeof body.description === 'string' ? body.description.trim() || null : null;

      if (!name) return response(400, { message: 'Project name is required' });

      const rows = await sql`
        UPDATE projects
        SET name = ${name}, description = ${description}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, name, description, created_at, updated_at
      `;
      if (rows.length === 0) return response(404, { message: 'Project not found' });
      return response(200, rows[0]);
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id || '';
      if (!id) return response(400, { message: 'Missing project id' });

      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId}`;
      return response(200, { ok: true });
    }

    return response(405, { message: 'Method not allowed' });
  } catch (err) {
    return response(500, { message: err instanceof Error ? err.message : 'Server error' });
  }
}
