import { neon } from '@neondatabase/serverless';
import { pbkdf2Sync, randomBytes, randomUUID } from 'crypto';

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

function hashPassword(password) {
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  let email, password, name;
  try {
    const body = JSON.parse(event.body || '{}');
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    password = typeof body.password === 'string' ? body.password : '';
    name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null;
  } catch {
    return response(400, { message: 'Invalid request body' });
  }

  if (!email || !isValidEmail(email)) {
    return response(400, { message: 'A valid email address is required' });
  }

  if (!password || password.length < 8) {
    return response(400, { message: 'Password must be at least 8 characters' });
  }

  const sql = neon(databaseUrl);

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return response(409, { message: 'An account with this email already exists' });
    }

    const passwordHash = hashPassword(password);

    const inserted = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name})
      RETURNING id, email, name, avatar_url
    `;

    const user = inserted[0];
    const token = randomUUID();

    await sql`
      INSERT INTO user_sessions (token, user_id)
      VALUES (${token}, ${user.id})
    `;

    return response(201, {
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url ?? null },
      token,
    });
  } catch (err) {
    return response(500, { message: err instanceof Error ? err.message : 'Server error' });
  }
}
