export interface StudioColorToken {
  id: string;
  label: string;
  cssVar?: string;
  value?: string;
}

export type StudioSizeTokenKey = 'sm' | 'md' | 'lg';

export interface StudioSizeTokenValue {
  height: number;
  width?: number;
}

export type StudioSizeTokenMap = Record<StudioSizeTokenKey, StudioSizeTokenValue>;

export interface StudioTokenSet {
  id: string;
  name: string;
  source: 'system' | 'user';
  tokens: StudioColorToken[];
  sizeTokens: StudioSizeTokenMap;
  updatedAt?: string;
}

export const SYSTEM_TOKEN_SET_ID = 'tailwind-system';

export const SYSTEM_TOKEN_SET: StudioTokenSet = {
  id: SYSTEM_TOKEN_SET_ID,
  name: 'Tailwind System',
  source: 'system',
  tokens: [
    { id: 'primary', label: 'Primary', cssVar: '--primary' },
    { id: 'secondary', label: 'Secondary', cssVar: '--secondary' },
    { id: 'accent', label: 'Accent', cssVar: '--accent' },
    { id: 'muted', label: 'Muted', cssVar: '--muted' },
    { id: 'foreground', label: 'Foreground', cssVar: '--foreground' },
    { id: 'background', label: 'Background', cssVar: '--background' },
    { id: 'border', label: 'Border', cssVar: '--border' },
    { id: 'input', label: 'Input', cssVar: '--input' },
    { id: 'ring', label: 'Ring', cssVar: '--ring' },
    { id: 'success', label: 'Success', cssVar: '--success' },
    { id: 'warning', label: 'Warning', cssVar: '--warning' },
    { id: 'info', label: 'Info', cssVar: '--info' },
    { id: 'destructive', label: 'Destructive', cssVar: '--destructive' },
    { id: 'chart-1', label: 'Chart 1', cssVar: '--chart-1' },
    { id: 'chart-2', label: 'Chart 2', cssVar: '--chart-2' },
    { id: 'chart-3', label: 'Chart 3', cssVar: '--chart-3' },
  ],
  sizeTokens: {
    sm: { height: 34 },
    md: { height: 38 },
    lg: { height: 44 },
  },
};

function clampDimension(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.min(640, Math.round(parsed)));
}

function sanitizeSizeTokens(input: unknown): StudioSizeTokenMap {
  const source = input && typeof input === 'object' ? (input as Partial<StudioSizeTokenMap>) : {};
  const base = SYSTEM_TOKEN_SET.sizeTokens;
  const sizes: StudioSizeTokenKey[] = ['sm', 'md', 'lg'];

  return sizes.reduce((acc, key) => {
    const candidate = source[key];
    const fallback = base[key];
    const normalized = candidate && typeof candidate === 'object' ? candidate : {};
    const height = clampDimension((normalized as Partial<StudioSizeTokenValue>).height, fallback.height);
    const widthRaw = clampDimension((normalized as Partial<StudioSizeTokenValue>).width, 0);
    acc[key] = widthRaw > 0 ? { height, width: widthRaw } : { height };
    return acc;
  }, {} as StudioSizeTokenMap);
}

export function normalizeHexColor(value: string): string | null {
  const cleaned = value.trim();
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleaned)) {
    return null;
  }
  if (cleaned.length === 4) {
    const [hash, r, g, b] = cleaned;
    return `${hash}${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return cleaned.toLowerCase();
}

export function sanitizeTokenSet(input: unknown): StudioTokenSet | null {
  if (!input || typeof input !== 'object') {
    return null;
  }
  const candidate = input as Partial<StudioTokenSet>;
  if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || !Array.isArray(candidate.tokens)) {
    return null;
  }
  const tokens: StudioColorToken[] = [];
  for (const token of candidate.tokens) {
    if (!token || typeof token !== 'object') {
      continue;
    }
    const partial = token as Partial<StudioColorToken>;
    if (typeof partial.id !== 'string' || typeof partial.label !== 'string') {
      continue;
    }
    const value = typeof partial.value === 'string' ? normalizeHexColor(partial.value) ?? undefined : undefined;
    const cssVar = typeof partial.cssVar === 'string' ? partial.cssVar : undefined;
    if (!value && !cssVar) {
      continue;
    }
    tokens.push({
      id: partial.id,
      label: partial.label,
      value,
      cssVar,
    });
  }

  if (!tokens.length) {
    return null;
  }

  return {
    id: candidate.id,
    name: candidate.name,
    source: candidate.source === 'system' ? 'system' : 'user',
    tokens,
    sizeTokens: sanitizeSizeTokens(candidate.sizeTokens),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : undefined,
  };
}

export function ensureTokenSetsWithSystem(sets: StudioTokenSet[]): StudioTokenSet[] {
  const deduped = new Map<string, StudioTokenSet>();
  for (const set of sets) {
    deduped.set(set.id, set);
  }
  deduped.set(SYSTEM_TOKEN_SET.id, SYSTEM_TOKEN_SET);
  return [SYSTEM_TOKEN_SET, ...Array.from(deduped.values()).filter((set) => set.id !== SYSTEM_TOKEN_SET.id)];
}

export function createTokenSetId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'token-set';
  return `${slug}-${Date.now().toString(36)}`;
}
