export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

const AUTH_KEY = 'j6_auth';

function getStoredAuth(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeAuth(data: { user: AuthUser; token: string }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch('/.netlify/functions/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message || 'Invalid credentials. Please try again.');
    }

    const data: AuthResponse = await res.json();
    storeAuth(data);
    return data.user;
  },

  async register(email: string, password: string, name?: string): Promise<AuthUser> {
    const res = await fetch('/.netlify/functions/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message || 'Registration failed. Please try again.');
    }

    const data: AuthResponse = await res.json();
    storeAuth(data);
    return data.user;
  },

  async updateProfile(name: string | null, avatarUrl: string | null | undefined): Promise<AuthUser> {
    const token = authService.getToken();
    const body: Record<string, unknown> = { name };
    if (avatarUrl !== undefined) body.avatar_url = avatarUrl;

    const res = await fetch('/.netlify/functions/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || 'Failed to save profile');
    }

    const data = await res.json() as { user: AuthUser };
    const stored = getStoredAuth();
    if (stored) storeAuth({ ...stored, user: data.user });
    return data.user;
  },

  logout() {
    clearAuth();
  },

  getUser(): AuthUser | null {
    return getStoredAuth()?.user ?? null;
  },

  getToken(): string | null {
    return getStoredAuth()?.token ?? null;
  },

  isAuthenticated(): boolean {
    return getStoredAuth() !== null;
  },
};
