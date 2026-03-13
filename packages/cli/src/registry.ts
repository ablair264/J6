import chalk from 'chalk';

const REGISTRY_URL = 'https://raw.githubusercontent.com/blairmichaelg/ui-studio-oss/main/public/registry.json';

export interface RegistryEntry {
  name: string;
  label: string;
  description: string;
  files: { path: string; target: string; content: string }[];
  registryDependencies?: string[];
  npmDependencies?: Record<string, string>;
}

let cachedRegistry: RegistryEntry[] | null = null;

export async function fetchRegistry(): Promise<RegistryEntry[]> {
  if (cachedRegistry) return cachedRegistry;

  try {
    const res = await fetch(REGISTRY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedRegistry = await res.json() as RegistryEntry[];
    return cachedRegistry;
  } catch (e) {
    console.error(chalk.red(`Failed to fetch registry: ${e}`));
    process.exit(1);
  }
}

export async function resolveComponent(name: string): Promise<RegistryEntry | undefined> {
  const registry = await fetchRegistry();
  return registry.find((c) => c.name === name);
}

export async function resolveDependencies(name: string): Promise<string[]> {
  const component = await resolveComponent(name);
  if (!component) return [];
  const deps = component.registryDependencies ?? [];
  const allDeps: string[] = [];
  for (const dep of deps) {
    allDeps.push(dep, ...(await resolveDependencies(dep)));
  }
  return [...new Set(allDeps)];
}
