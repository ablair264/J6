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

export interface ParsedTokenImport {
  tokenSet: StudioTokenSet;
  format: 'css' | 'json';
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
  // Only use the hardcoded default if no version (including user-edited) exists
  if (!deduped.has(SYSTEM_TOKEN_SET.id)) {
    deduped.set(SYSTEM_TOKEN_SET.id, SYSTEM_TOKEN_SET);
  }
  const systemSet = deduped.get(SYSTEM_TOKEN_SET.id) ?? SYSTEM_TOKEN_SET;
  return [systemSet, ...Array.from(deduped.values()).filter((set) => set.id !== SYSTEM_TOKEN_SET.id)];
}

export function createTokenSetId(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'token-set';
  return `${slug}-${Date.now().toString(36)}`;
}

function normalizeRgbColor(value: string): string | null {
  const match = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (!match) {
    return null;
  }
  const channels = [match[1], match[2], match[3]].map((item) => Math.max(0, Math.min(255, Number(item))));
  if (channels.some((item) => !Number.isFinite(item))) {
    return null;
  }
  const toHex = (item: number) => item.toString(16).padStart(2, '0');
  return `#${toHex(channels[0])}${toHex(channels[1])}${toHex(channels[2])}`;
}

function normalizeHslColor(value: string): string | null {
  const match = value.match(/^hsla?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*([0-9.]+))?\s*\)$/i);
  if (!match) {
    return null;
  }
  const hue = ((Number(match[1]) % 360) + 360) % 360;
  const saturation = Math.max(0, Math.min(1, Number(match[2]) / 100));
  const lightness = Math.max(0, Math.min(1, Number(match[3]) / 100));
  if (!Number.isFinite(hue) || !Number.isFinite(saturation) || !Number.isFinite(lightness)) {
    return null;
  }

  const chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
  const sector = hue / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = lightness - (chroma / 2);

  let red = 0;
  let green = 0;
  let blue = 0;

  if (sector >= 0 && sector < 1) {
    red = chroma;
    green = x;
  } else if (sector >= 1 && sector < 2) {
    red = x;
    green = chroma;
  } else if (sector >= 2 && sector < 3) {
    green = chroma;
    blue = x;
  } else if (sector >= 3 && sector < 4) {
    green = x;
    blue = chroma;
  } else if (sector >= 4 && sector < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const toHex = (channel: number) =>
    Math.round((channel + offset) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function normalizeColorValue(value: string): string | null {
  const hex = normalizeHexColor(value);
  if (hex) return hex;
  const rgb = normalizeRgbColor(value.trim());
  if (rgb) return rgb;
  const hsl = normalizeHslColor(value.trim());
  if (hsl) return hsl;
  return null;
}

function createTokenLabel(id: string): string {
  return id
    .replace(/^--/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Token';
}

function createTokenId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/^--/, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'token';
}

function extractNameFromFilename(filename: string): string {
  const trimmed = filename.trim();
  const withoutExt = trimmed.replace(/\.[^.]+$/, '');
  const sanitized = withoutExt.replace(/[_-]+/g, ' ').trim();
  return sanitized ? sanitized.replace(/\b\w/g, (char) => char.toUpperCase()) : 'Imported Tokens';
}

function parseCssTokenSet(content: string, filename: string): StudioTokenSet | null {
  const variableEntries = Array.from(content.matchAll(/(--[a-z0-9-_]+)\s*:\s*([^;{}]+);/gi))
    .map((match) => ({ cssVar: match[1].trim(), rawValue: match[2].trim() }));
  if (!variableEntries.length) {
    return null;
  }

  const resolvedMap = new Map<string, string>();
  for (const entry of variableEntries) {
    const direct = normalizeColorValue(entry.rawValue);
    if (direct) {
      resolvedMap.set(entry.cssVar, direct);
      continue;
    }
    const aliasMatch = entry.rawValue.match(/^var\(\s*(--[a-z0-9-_]+)\s*(?:,\s*([^)]+))?\)$/i);
    if (aliasMatch) {
      const alias = aliasMatch[1];
      const fallback = aliasMatch[2] ? normalizeColorValue(aliasMatch[2].trim()) : null;
      const aliased = resolvedMap.get(alias);
      if (aliased) {
        resolvedMap.set(entry.cssVar, aliased);
      } else if (fallback) {
        resolvedMap.set(entry.cssVar, fallback);
      }
    }
  }

  const tokens: StudioColorToken[] = Array.from(resolvedMap.entries())
    .map(([cssVar, value]) => {
      const id = createTokenId(cssVar);
      return {
        id,
        label: createTokenLabel(id),
        value,
      };
    })
    .filter((token, index, all) => all.findIndex((other) => other.id === token.id) === index);

  if (!tokens.length) {
    return null;
  }

  const name = extractNameFromFilename(filename);
  return {
    id: createTokenSetId(name),
    name,
    source: 'user',
    tokens,
    sizeTokens: sanitizeSizeTokens(undefined),
    updatedAt: new Date().toISOString(),
  };
}

function readNestedColorMap(
  value: unknown,
  prefix: string[] = [],
): Array<{ id: string; value: string }> {
  if (!value || typeof value !== 'object') {
    return [];
  }
  const entries: Array<{ id: string; value: string }> = [];
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === 'string') {
      const normalized = normalizeColorValue(item);
      if (!normalized) {
        continue;
      }
      const id = createTokenId([...prefix, key].join('-'));
      entries.push({ id, value: normalized });
      continue;
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      entries.push(...readNestedColorMap(item, [...prefix, key]));
    }
  }
  return entries;
}

function parseJsonTokenSet(content: string, filename: string): StudioTokenSet | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return null;
  }

  const asTokenSet = sanitizeTokenSet(parsed);
  if (asTokenSet) {
    const name = asTokenSet.name.trim() || extractNameFromFilename(filename);
    return {
      ...asTokenSet,
      id: createTokenSetId(name),
      name,
      source: 'user',
      updatedAt: new Date().toISOString(),
    };
  }

  const candidate = parsed && typeof parsed === 'object'
    ? (parsed as {
      name?: unknown;
      tokens?: unknown;
      colors?: unknown;
      palette?: unknown;
      sizeTokens?: unknown;
    })
    : null;
  if (!candidate) {
    return null;
  }

  const collected: StudioColorToken[] = [];

  if (Array.isArray(candidate.tokens)) {
    for (const token of candidate.tokens) {
      if (!token || typeof token !== 'object') continue;
      const partial = token as { id?: unknown; label?: unknown; value?: unknown; hex?: unknown; color?: unknown };
      const id = createTokenId(String(partial.id ?? partial.label ?? 'token'));
      const rawValue = String(partial.value ?? partial.hex ?? partial.color ?? '');
      const value = normalizeColorValue(rawValue);
      if (!value) continue;
      collected.push({
        id,
        label: typeof partial.label === 'string' ? partial.label : createTokenLabel(id),
        value,
      });
    }
  } else if (candidate.tokens && typeof candidate.tokens === 'object') {
    for (const [rawId, rawValue] of Object.entries(candidate.tokens as Record<string, unknown>)) {
      if (typeof rawValue !== 'string') continue;
      const value = normalizeColorValue(rawValue);
      if (!value) continue;
      const id = createTokenId(rawId);
      collected.push({ id, label: createTokenLabel(id), value });
    }
  }

  const nestedColorSources = [candidate.colors, candidate.palette, parsed];
  for (const source of nestedColorSources) {
    const nestedTokens = readNestedColorMap(source);
    for (const token of nestedTokens) {
      if (collected.some((current) => current.id === token.id)) continue;
      collected.push({ id: token.id, label: createTokenLabel(token.id), value: token.value });
    }
  }

  const tokens = collected.filter((token, index, all) => all.findIndex((other) => other.id === token.id) === index);
  if (!tokens.length) {
    return null;
  }

  const nameFromJson = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const name = nameFromJson || extractNameFromFilename(filename);
  return {
    id: createTokenSetId(name),
    name,
    source: 'user',
    tokens,
    sizeTokens: sanitizeSizeTokens(candidate.sizeTokens),
    updatedAt: new Date().toISOString(),
  };
}

export function parseImportedTokenSet(content: string, filename: string): ParsedTokenImport | null {
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }
  const lowerName = filename.toLowerCase();
  const tryJsonFirst = lowerName.endsWith('.json') || trimmed.startsWith('{') || trimmed.startsWith('[');
  const tryCssFirst = lowerName.endsWith('.css');

  if (tryJsonFirst) {
    const tokenSet = parseJsonTokenSet(trimmed, filename);
    if (tokenSet) {
      return { tokenSet, format: 'json' };
    }
    const cssFallback = parseCssTokenSet(trimmed, filename);
    return cssFallback ? { tokenSet: cssFallback, format: 'css' } : null;
  }

  if (tryCssFirst) {
    const tokenSet = parseCssTokenSet(trimmed, filename);
    if (tokenSet) {
      return { tokenSet, format: 'css' };
    }
    const jsonFallback = parseJsonTokenSet(trimmed, filename);
    return jsonFallback ? { tokenSet: jsonFallback, format: 'json' } : null;
  }

  const cssTokenSet = parseCssTokenSet(trimmed, filename);
  if (cssTokenSet) {
    return { tokenSet: cssTokenSet, format: 'css' };
  }
  const jsonTokenSet = parseJsonTokenSet(trimmed, filename);
  return jsonTokenSet ? { tokenSet: jsonTokenSet, format: 'json' } : null;
}
