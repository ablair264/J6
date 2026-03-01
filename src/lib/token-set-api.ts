import type { StudioTokenSet } from '@/components/ui/token-sets';
import { authService } from '@/services/authService';

export interface TokenSetApiResponse {
  tokenSets: StudioTokenSet[];
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = authService.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchTokenSetsFromApi(): Promise<StudioTokenSet[]> {
  const response = await fetch('/api/token-sets', {
    method: 'GET',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status})`);
  }

  const payload = (await response.json()) as TokenSetApiResponse;
  return Array.isArray(payload.tokenSets) ? payload.tokenSets : [];
}

export async function upsertTokenSetToApi(tokenSet: StudioTokenSet): Promise<StudioTokenSet> {
  const response = await fetch('/api/token-sets', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(tokenSet),
  });

  if (!response.ok) {
    throw new Error(`Save failed (${response.status})`);
  }

  return (await response.json()) as StudioTokenSet;
}

export async function deleteTokenSetFromApi(setId: string): Promise<void> {
  const response = await fetch(`/api/token-sets?setId=${encodeURIComponent(setId)}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Delete failed (${response.status})`);
  }
}
