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

async function verifyProjectOwnership(sql, projectId, userId) {
  const rows = await sql`
    SELECT id FROM projects
    WHERE id = ${projectId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows.length > 0;
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

  const projectId = event.queryStringParameters?.projectId || '';
  if (!projectId) {
    return response(400, { message: 'Missing projectId' });
  }

  const owns = await verifyProjectOwnership(sql, projectId, userId);
  if (!owns) {
    return response(404, { message: 'Project not found' });
  }

  try {
    // GET /api/project-data?projectId=xxx — returns all component data for a project
    // GET /api/project-data?projectId=xxx&kind=button — returns one kind
    if (event.httpMethod === 'GET') {
      const kind = event.queryStringParameters?.kind || '';

      if (kind) {
        const rows = await sql`
          SELECT data FROM project_components
          WHERE project_id = ${projectId} AND component_kind = ${kind}
          LIMIT 1
        `;
        return response(200, { data: rows[0]?.data ?? null });
      }

      const rows = await sql`
        SELECT component_kind, data, updated_at FROM project_components
        WHERE project_id = ${projectId}
        ORDER BY component_kind
      `;
      return response(200, { components: rows });
    }

    // PUT /api/project-data?projectId=xxx&kind=button — upsert one kind's data
    if (event.httpMethod === 'PUT') {
      const kind = event.queryStringParameters?.kind || '';
      if (!kind) {
        return response(400, { message: 'Missing kind' });
      }

      const body = JSON.parse(event.body || '{}');
      const data = body.data;
      if (data === undefined || data === null) {
        return response(400, { message: 'Missing data' });
      }

      await sql`
        INSERT INTO project_components (project_id, component_kind, data, updated_at)
        VALUES (${projectId}, ${kind}, ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (project_id, component_kind)
        DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
      `;

      // Also touch the project's updated_at
      await sql`
        UPDATE projects SET updated_at = NOW() WHERE id = ${projectId}
      `;

      return response(200, { ok: true });
    }

    return response(405, { message: 'Method not allowed' });
  } catch (err) {
    return response(500, { message: err instanceof Error ? err.message : 'Server error' });
  }
}
