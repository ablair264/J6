import type { StudioTokenSet } from '@/components/ui/token-sets';

export interface TokenSetApiResponse {
  tokenSets: StudioTokenSet[];
}

function buildHeaders(userKey?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (userKey && userKey.trim()) {
    headers['x-ui-studio-user-id'] = userKey.trim();
  }
  return headers;
}

export async function fetchTokenSetsFromApi(userKey?: string): Promise<StudioTokenSet[]> {
  const response = await fetch('/api/token-sets', {
    method: 'GET',
    headers: buildHeaders(userKey),
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status})`);
  }

  const payload = (await response.json()) as TokenSetApiResponse;
  return Array.isArray(payload.tokenSets) ? payload.tokenSets : [];
}

export async function upsertTokenSetToApi(tokenSet: StudioTokenSet, userKey?: string): Promise<StudioTokenSet> {
  const response = await fetch('/api/token-sets', {
    method: 'POST',
    headers: buildHeaders(userKey),
    body: JSON.stringify(tokenSet),
  });

  if (!response.ok) {
    throw new Error(`Save failed (${response.status})`);
  }

  return (await response.json()) as StudioTokenSet;
}

export async function deleteTokenSetFromApi(setId: string, userKey?: string): Promise<void> {
  const response = await fetch(`/api/token-sets?setId=${encodeURIComponent(setId)}`, {
    method: 'DELETE',
    headers: buildHeaders(userKey),
  });

  if (!response.ok) {
    throw new Error(`Delete failed (${response.status})`);
  }
}
