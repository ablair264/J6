import { neon } from '@neondatabase/serverless';
import { pbkdf2Sync, randomUUID } from 'crypto';

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

function verifyPassword(password, storedHash) {
  // Format: salt:hash
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const derived = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return derived === hash;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { message: 'Method not allowed' });
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return response(500, { message: 'Database not configured' });
  }

  let email, password;
  try {
    const body = JSON.parse(event.body || '{}');
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return response(400, { message: 'Invalid request body' });
  }

  if (!email || !password) {
    return response(400, { message: 'Email and password are required' });
  }

  const sql = neon(databaseUrl);

  try {
    const rows = await sql`
      SELECT id, email, name, avatar_url, password_hash
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return response(401, { message: 'Invalid credentials. Please try again.' });
    }

    const user = rows[0];

    if (!verifyPassword(password, user.password_hash)) {
      return response(401, { message: 'Invalid credentials. Please try again.' });
    }

    const token = randomUUID();
    await sql`
      INSERT INTO user_sessions (token, user_id)
      VALUES (${token}, ${user.id})
    `;

    return response(200, {
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url ?? null },
      token,
    });
  } catch (err) {
    return response(500, { message: err instanceof Error ? err.message : 'Server error' });
  }
}
