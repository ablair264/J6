import { authService } from '@/services/authService';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function buildHeaders(): HeadersInit {
  const token = authService.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { headers: buildHeaders() });
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
  const data = await res.json() as { projects: Project[] };
  return data.projects;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message || `Failed to create project (${res.status})`);
  }
  return res.json() as Promise<Project>;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete project (${res.status})`);
}
