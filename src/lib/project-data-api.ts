import { authService } from '@/services/authService';

function buildHeaders(): HeadersInit {
  const token = authService.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export interface ProjectComponentRow {
  component_kind: string;
  data: unknown;
  updated_at: string;
}

/** Fetch all component data for a project */
export async function fetchProjectComponents(projectId: string): Promise<ProjectComponentRow[]> {
  const res = await fetch(
    `/api/project-data?projectId=${encodeURIComponent(projectId)}`,
    { headers: buildHeaders() },
  );
  if (!res.ok) throw new Error(`Failed to load project data (${res.status})`);
  const body = await res.json() as { components: ProjectComponentRow[] };
  return body.components;
}

/** Fetch one component kind's data for a project */
export async function fetchProjectComponentKind(
  projectId: string,
  kind: string,
): Promise<unknown | null> {
  const res = await fetch(
    `/api/project-data?projectId=${encodeURIComponent(projectId)}&kind=${encodeURIComponent(kind)}`,
    { headers: buildHeaders() },
  );
  if (!res.ok) throw new Error(`Failed to load component data (${res.status})`);
  const body = await res.json() as { data: unknown | null };
  return body.data;
}

/** Save one component kind's data for a project (upsert) */
export async function saveProjectComponentKind(
  projectId: string,
  kind: string,
  data: unknown,
): Promise<void> {
  const res = await fetch(
    `/api/project-data?projectId=${encodeURIComponent(projectId)}&kind=${encodeURIComponent(kind)}`,
    {
      method: 'PUT',
      headers: buildHeaders(),
      body: JSON.stringify({ data }),
    },
  );
  if (!res.ok) throw new Error(`Failed to save component data (${res.status})`);
}
