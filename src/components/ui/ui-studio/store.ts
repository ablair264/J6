import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import {
    SYSTEM_TOKEN_SET,
    SYSTEM_TOKEN_SET_ID,
    createTokenSetId,
    ensureTokenSetsWithSystem,
    normalizeHexColor,
    sanitizeTokenSet,
} from '@/components/ui/token-sets';
import type { StudioColorToken, StudioSizeTokenKey, StudioTokenSet } from '@/components/ui/token-sets';
import {
    deleteTokenSetFromApi,
    fetchTokenSetsFromApi,
    upsertTokenSetToApi,
} from '@/lib/token-set-api';
import type {
    ButtonPreviewState,
    ComponentInstance,
    ComponentStyleConfig,
    FillMode,
    FontPosition,
    IconOptionId,
    SizeOption,
    StyleableState,
    StateOverrides,
    StylePreset,
    UIComponentKind,
} from '@/components/ui/ui-studio.types';
import {
    COMPONENTS,
    DEFAULT_STYLE,
    normalizeStyleConfig,
} from './constants';
import {
    getComponentVisualPreset,
    getComponentVisualPresets,
    isUIComponentKind,
    resolveTokenToHex,
    supportsStateStyles,
    supportsEntryMotion,
} from './utilities';
import { getMotionComponentPresets } from './motion';
import {
    fetchProjectComponentKind,
    saveProjectComponentKind,
} from '@/lib/project-data-api';

// ─── Debounced Neon sync ─────────────────────────────────────────────────

let neonSyncTimer: ReturnType<typeof setTimeout> | null = null;
const NEON_SYNC_DELAY_MS = 2500;

function scheduleNeonSync(projectId: string, kind: UIComponentKind, payload: PersistedComponentState) {
    if (neonSyncTimer) clearTimeout(neonSyncTimer);
    neonSyncTimer = setTimeout(() => {
        neonSyncTimer = null;
        saveProjectComponentKind(projectId, kind, payload).catch((err) => {
            console.warn('[ui-studio] Neon sync failed:', err);
        });
    }, NEON_SYNC_DELAY_MS);
}

// ─── Project settings persistence (constants defined after STUDIO_STORAGE_PREFIX below) ──

const PROJECT_SETTINGS_KIND = '_settings';

interface ProjectSettings {
    canvasBackground: string;
}

// ─── Types ────────────────────────────────────────────────────────────────

export type InspectorTab = 'style' | 'interaction' | 'behavior';
export type CodePanelTab = 'snippet' | 'named' | 'exports' | 'theme';
export type ExportStyleMode = 'inline' | 'tailwind';

export interface PersistedComponentState {
    instances: ComponentInstance[];
    selectedInstanceId: string | null;
    nextInstanceIndex: number;
}

// ─── Storage ──────────────────────────────────────────────────────────────

const STUDIO_STORAGE_PREFIX = 'ui-studio-oss:v1:';
const INSPECTOR_TAB_STORAGE_PREFIX = `${STUDIO_STORAGE_PREFIX}inspector-tab:`;
const TOKEN_SETS_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}token-sets`;
const ACTIVE_TOKEN_SET_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}active-token-set`;
const STUDIO_THEME_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}studio-theme`;

/** Project-scoped localStorage key: `ui-studio-oss:v1:proj:{projectId}:{kind}` */
function getProjectComponentStorageKey(projectId: string, kind: UIComponentKind): string {
    return `${STUDIO_STORAGE_PREFIX}proj:${projectId}:${kind}`;
}

/** Legacy un-scoped key (pre-project era) — kept for fallback reads */
export function getComponentStorageKey(kind: UIComponentKind): string {
    return `${STUDIO_STORAGE_PREFIX}${kind}`;
}

function getInspectorTabStorageKey(kind: UIComponentKind): string {
    return `${INSPECTOR_TAB_STORAGE_PREFIX}${kind}`;
}

function isInspectorTab(value: string | null): value is InspectorTab {
    return value === 'style' || value === 'interaction' || value === 'behavior';
}

// ─── Project settings helpers ─────────────────────────────────────────────

const PROJECT_SETTINGS_STORAGE_PREFIX = `${STUDIO_STORAGE_PREFIX}proj-settings:`;

let settingsSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSettingsSync(projectId: string, settings: ProjectSettings) {
    if (settingsSyncTimer) clearTimeout(settingsSyncTimer);
    settingsSyncTimer = setTimeout(() => {
        settingsSyncTimer = null;
        saveProjectComponentKind(projectId, PROJECT_SETTINGS_KIND, settings).catch((err) => {
            console.warn('[ui-studio] Settings sync failed:', err);
        });
    }, NEON_SYNC_DELAY_MS);
}

function persistProjectSettings(projectId: string | null, settings: ProjectSettings) {
    if (typeof window === 'undefined') return;
    if (projectId) {
        window.localStorage.setItem(`${PROJECT_SETTINGS_STORAGE_PREFIX}${projectId}`, JSON.stringify(settings));
        scheduleSettingsSync(projectId, settings);
    }
}

function hydrateProjectSettings(projectId?: string): ProjectSettings {
    const defaults: ProjectSettings = { canvasBackground: '' };
    if (typeof window === 'undefined' || !projectId) return defaults;
    try {
        const raw = window.localStorage.getItem(`${PROJECT_SETTINGS_STORAGE_PREFIX}${projectId}`);
        if (!raw) return defaults;
        const parsed = JSON.parse(raw) as Partial<ProjectSettings>;
        return { ...defaults, ...parsed };
    } catch { return defaults; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function createDefaultStyle(kind: UIComponentKind): ComponentStyleConfig {
    const defaultPreset = getComponentVisualPreset(kind, DEFAULT_STYLE.componentPreset);
    return normalizeStyleConfig({
        ...DEFAULT_STYLE,
        ...(defaultPreset?.values ?? {}),
    });
}

export function createInstance(kind: UIComponentKind, index: number): ComponentInstance {
    const component = COMPONENTS.find((item) => item.kind === kind);
    return {
        id: `${kind}-${index}-${Date.now()}`,
        kind,
        name: `${component?.label ?? kind} ${index}`,
        style: createDefaultStyle(kind),
    };
}

function parsePersistedData(kind: UIComponentKind, raw: unknown): PersistedComponentState | null {
    try {
        const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<PersistedComponentState>;
        if (!Array.isArray(parsed.instances) || parsed.instances.length === 0) return null;
        const normalizedInstances = parsed.instances
            .filter((instance) => isUIComponentKind(instance.kind))
            .map((instance) =>
                migrateLegacyStateFields({
                    ...instance,
                    style: normalizeStyleConfig(instance.style),
                }),
            );
        if (normalizedInstances.length === 0) return null;
        const selectedExists = normalizedInstances.some((instance) => instance.id === parsed.selectedInstanceId);
        return {
            instances: normalizedInstances,
            selectedInstanceId: selectedExists ? (parsed.selectedInstanceId ?? null) : null,
            nextInstanceIndex:
                typeof parsed.nextInstanceIndex === 'number' && Number.isFinite(parsed.nextInstanceIndex)
                    ? Math.max(2, parsed.nextInstanceIndex)
                    : normalizedInstances.length + 1,
        };
    } catch {
        return null;
    }
}

function buildFallback(kind: UIComponentKind): PersistedComponentState {
    return {
        instances: [createInstance(kind, 1)],
        selectedInstanceId: null,
        nextInstanceIndex: 2,
    };
}

export function hydrateComponentState(kind: UIComponentKind, projectId?: string): PersistedComponentState {
    const fallback = buildFallback(kind);
    if (typeof window === 'undefined') return fallback;

    if (projectId) {
        // Project-scoped — only read from project key, never fall back to legacy
        const projectRaw = window.localStorage.getItem(getProjectComponentStorageKey(projectId, kind));
        if (projectRaw) {
            const result = parsePersistedData(kind, projectRaw);
            if (result) return result;
        }
        return fallback;
    }

    // No project — legacy un-scoped key
    const legacyRaw = window.localStorage.getItem(getComponentStorageKey(kind));
    if (legacyRaw) {
        const result = parsePersistedData(kind, legacyRaw);
        if (result) return result;
    }

    return fallback;
}

export function resolveStateStyle(
    instance: ComponentInstance,
    state: ButtonPreviewState,
): ComponentStyleConfig {
    if (state === 'default' || !instance.stateOverrides?.[state]) {
        return instance.style;
    }
    return { ...instance.style, ...instance.stateOverrides[state] };
}

// ─── Migration: flat button* fields → stateOverrides ─────────────────────

const LEGACY_STATE_FIELD_MAP: Record<string, { state: 'hover' | 'active' | 'disabled'; key: keyof ComponentStyleConfig }> = {
    buttonHoverFillMode: { state: 'hover', key: 'fillMode' },
    buttonHoverFillColor: { state: 'hover', key: 'fillColor' },
    buttonHoverFillColorTo: { state: 'hover', key: 'fillColorTo' },
    buttonHoverFillWeight: { state: 'hover', key: 'fillWeight' },
    buttonHoverFillOpacity: { state: 'hover', key: 'fillOpacity' },
    buttonHoverFontColor: { state: 'hover', key: 'fontColor' },
    buttonHoverFontOpacity: { state: 'hover', key: 'fontOpacity' },
    buttonHoverFontSize: { state: 'hover', key: 'fontSize' },
    buttonHoverFontWeight: { state: 'hover', key: 'fontWeight' },
    buttonHoverFontPosition: { state: 'hover', key: 'fontPosition' },
    buttonHoverStrokeColor: { state: 'hover', key: 'strokeColor' },
    buttonHoverStrokeOpacity: { state: 'hover', key: 'strokeOpacity' },
    buttonHoverStrokeWeight: { state: 'hover', key: 'strokeWeight' },
    buttonActiveFillMode: { state: 'active', key: 'fillMode' },
    buttonActiveFillColor: { state: 'active', key: 'fillColor' },
    buttonActiveFillColorTo: { state: 'active', key: 'fillColorTo' },
    buttonActiveFillWeight: { state: 'active', key: 'fillWeight' },
    buttonActiveFillOpacity: { state: 'active', key: 'fillOpacity' },
    buttonActiveFontColor: { state: 'active', key: 'fontColor' },
    buttonActiveFontOpacity: { state: 'active', key: 'fontOpacity' },
    buttonActiveFontSize: { state: 'active', key: 'fontSize' },
    buttonActiveFontWeight: { state: 'active', key: 'fontWeight' },
    buttonActiveFontPosition: { state: 'active', key: 'fontPosition' },
    buttonActiveStrokeColor: { state: 'active', key: 'strokeColor' },
    buttonActiveStrokeOpacity: { state: 'active', key: 'strokeOpacity' },
    buttonActiveStrokeWeight: { state: 'active', key: 'strokeWeight' },
    buttonDisabledFillMode: { state: 'disabled', key: 'fillMode' },
    buttonDisabledFillColor: { state: 'disabled', key: 'fillColor' },
    buttonDisabledFillColorTo: { state: 'disabled', key: 'fillColorTo' },
    buttonDisabledFillWeight: { state: 'disabled', key: 'fillWeight' },
    buttonDisabledFillOpacity: { state: 'disabled', key: 'fillOpacity' },
    buttonDisabledFontColor: { state: 'disabled', key: 'fontColor' },
    buttonDisabledFontOpacity: { state: 'disabled', key: 'fontOpacity' },
    buttonDisabledFontSize: { state: 'disabled', key: 'fontSize' },
    buttonDisabledFontWeight: { state: 'disabled', key: 'fontWeight' },
    buttonDisabledFontPosition: { state: 'disabled', key: 'fontPosition' },
    buttonDisabledStrokeColor: { state: 'disabled', key: 'strokeColor' },
    buttonDisabledStrokeOpacity: { state: 'disabled', key: 'strokeOpacity' },
    buttonDisabledStrokeWeight: { state: 'disabled', key: 'strokeWeight' },
};

function migrateLegacyStateFields(instance: ComponentInstance): ComponentInstance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleAny = instance.style as any;
    let hasLegacy = false;
    for (const legacyKey of Object.keys(LEGACY_STATE_FIELD_MAP)) {
        if (legacyKey in styleAny) {
            hasLegacy = true;
            break;
        }
    }
    if (!hasLegacy) return instance;

    const overrides: StateOverrides = { ...instance.stateOverrides };
    const cleanedStyle = { ...styleAny };

    for (const [legacyKey, { state, key }] of Object.entries(LEGACY_STATE_FIELD_MAP)) {
        if (!(legacyKey in styleAny)) continue;
        const value = styleAny[legacyKey];
        // Only store as override if it differs from the base style
        if (value !== styleAny[key]) {
            if (!overrides[state]) overrides[state] = {};
            (overrides[state] as any)[key] = value;
        }
        delete cleanedStyle[legacyKey];
    }

    // Prune empty override objects
    for (const state of ['hover', 'active', 'disabled'] as const) {
        if (overrides[state] && Object.keys(overrides[state]!).length === 0) {
            delete overrides[state];
        }
    }

    return {
        ...instance,
        style: cleanedStyle as ComponentStyleConfig,
        stateOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    };
}

// ─── Store Interface ──────────────────────────────────────────────────────

interface DesignSlice {
    instances: ComponentInstance[];
    selectedInstanceId: string | null;
    nextInstanceIndex: number;
}

interface StudioState {
    // ─── Design state (tracked by undo/redo) ──────────────────────────
    instances: ComponentInstance[];
    selectedInstanceId: string | null;
    nextInstanceIndex: number;

    // ─── Active component kind + project ────────────────────────────────
    activeKind: UIComponentKind;
    activeProjectId: string | null;

    // ─── UI chrome state (NOT tracked by undo) ────────────────────────
    copiedCode: boolean;
    exportedCode: boolean;
    showCanvasGrid: boolean;
    canvasBackground: string;
    inspectorTab: InspectorTab;
    codePanelTab: CodePanelTab;
    exportStyleMode: ExportStyleMode;
    studioTheme: 'dark' | 'light';
    profileMenuOpen: boolean;
    componentPickerOpen: boolean;
    componentPickerQuery: string;
    rightSidebarTab: 'inspector' | 'motion' | 'export';
    pinOverlayPreviews: boolean;
    effectsBuilderOpen: boolean;
    pendingEffectId: string | null;
    editingVariantId: string | null;
    editingVariantName: string;
    hoverPreviewInstanceId: string | null;
    instanceContextMenu: { instanceId: string; x: number; y: number } | null;
    motionPreviewKey: number;

    // ─── Token state ──────────────────────────────────────────────────
    tokenSets: StudioTokenSet[];
    activeTokenSetId: string;
    tokenSyncMessage: string;
    tokensLoading: boolean;
    showTokenManager: boolean;
    newSetName: string;
    showNewSetInput: boolean;
    newTokenForm: { id: string; label: string; hex: string } | null;
    suggestPaletteColor: string;
    suggestingPalette: boolean;

    // ─── Profile state ────────────────────────────────────────────────
    showProfile: boolean;
    profileName: string;
    profileAvatarPreview: string | null;
    profileAvatarBase64: string | null | undefined;
    profileSaving: boolean;
    profileSaved: boolean;
    profileError: string | null;

    // ─── Actions ──────────────────────────────────────────────────────
    setActiveKind: (kind: UIComponentKind) => void;
    setInstances: (instances: ComponentInstance[] | ((current: ComponentInstance[]) => ComponentInstance[])) => void;
    setSelectedInstanceId: (id: string | null) => void;
    setCopiedCode: (v: boolean) => void;
    setExportedCode: (v: boolean) => void;
    setShowCanvasGrid: (v: boolean) => void;
    setCanvasBackground: (color: string) => void;
    setInspectorTab: (tab: InspectorTab) => void;
    setCodePanelTab: (tab: CodePanelTab) => void;
    setExportStyleMode: (mode: ExportStyleMode) => void;
    setStudioTheme: (theme: 'dark' | 'light') => void;
    setProfileMenuOpen: (v: boolean) => void;
    setComponentPickerOpen: (v: boolean | ((current: boolean) => boolean)) => void;
    setComponentPickerQuery: (v: string) => void;
    setRightSidebarTab: (tab: 'inspector' | 'motion' | 'export') => void;
    setPinOverlayPreviews: (v: boolean) => void;
    setEffectsBuilderOpen: (v: boolean) => void;
    setPendingEffectId: (id: string | null) => void;
    setEditingVariantId: (id: string | null) => void;
    setEditingVariantName: (name: string) => void;
    setHoverPreviewInstanceId: (id: string | null) => void;
    setInstanceContextMenu: (menu: { instanceId: string; x: number; y: number } | null) => void;
    setMotionPreviewKey: (v: number) => void;
    replayMotion: () => void;

    // Token actions
    setTokenSets: (sets: StudioTokenSet[] | ((current: StudioTokenSet[]) => StudioTokenSet[])) => void;
    setActiveTokenSetId: (id: string) => void;
    setTokenSyncMessage: (msg: string) => void;
    setTokensLoading: (v: boolean) => void;
    setShowTokenManager: (v: boolean) => void;
    setNewSetName: (v: string) => void;
    setShowNewSetInput: (v: boolean) => void;
    setNewTokenForm: (form: { id: string; label: string; hex: string } | null) => void;
    setSuggestPaletteColor: (color: string) => void;
    setSuggestingPalette: (v: boolean) => void;

    // Profile actions
    setShowProfile: (v: boolean) => void;
    setProfileName: (v: string) => void;
    setProfileAvatarPreview: (v: string | null) => void;
    setProfileAvatarBase64: (v: string | null | undefined) => void;
    setProfileSaving: (v: boolean) => void;
    setProfileSaved: (v: boolean) => void;
    setProfileError: (v: string | null) => void;

    // ─── Design Actions ───────────────────────────────────────────────
    updateSelectedStyle: <K extends keyof ComponentStyleConfig>(key: K, value: ComponentStyleConfig[K]) => void;
    updateSelectedStyles: (updates: Partial<ComponentStyleConfig>) => void;
    updateStateOverride: <K extends keyof ComponentStyleConfig>(state: StyleableState, key: K, value: ComponentStyleConfig[K]) => void;
    updateStateOverrides: (state: StyleableState, updates: Partial<ComponentStyleConfig>) => void;
    applySizeTokenToSelected: (size: SizeOption, sizeToken: { height: number; width?: number }) => void;
    addInstance: (kind?: UIComponentKind) => void;
    deleteInstance: (id: string) => void;
    duplicateInstance: (sourceId: string) => void;
    updateInstanceName: (id: string, name: string) => void;
    resetSelectedStyle: () => void;
    applyPresetToSelected: (preset: StylePreset) => void;
    applyComponentVisualPreset: (presetId: string) => void;
    applyMotionComponentPreset: (presetId: string) => void;
    clearVisualMotionPreset: () => void;

    // ─── Persistence ──────────────────────────────────────────────────
    setActiveProjectId: (projectId: string | null) => void;
    persistComponentState: () => void;
    hydrateForKind: (kind: UIComponentKind) => void;
    hydrateFromNeon: (kind: UIComponentKind) => Promise<void>;
    hydrateSettingsFromNeon: () => Promise<void>;
}

// ─── Hydrate helpers ──────────────────────────────────────────────────────

function hydrateTokenSets(): StudioTokenSet[] {
    if (typeof window === 'undefined') {
        return [SYSTEM_TOKEN_SET];
    }
    const raw = window.localStorage.getItem(TOKEN_SETS_STORAGE_KEY);
    if (!raw) {
        return [SYSTEM_TOKEN_SET];
    }
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
            return [SYSTEM_TOKEN_SET];
        }
        const sanitized = parsed
            .map((entry) => sanitizeTokenSet(entry))
            .filter((entry): entry is StudioTokenSet => entry !== null);
        return ensureTokenSetsWithSystem(sanitized);
    } catch {
        return [SYSTEM_TOKEN_SET];
    }
}

function hydrateActiveTokenSetId(): string {
    if (typeof window === 'undefined') {
        return SYSTEM_TOKEN_SET_ID;
    }
    return window.localStorage.getItem(ACTIVE_TOKEN_SET_STORAGE_KEY) ?? SYSTEM_TOKEN_SET_ID;
}

function hydrateStudioTheme(): 'dark' | 'light' {
    if (typeof window === 'undefined') return 'dark';
    const saved = (window.localStorage.getItem(STUDIO_THEME_STORAGE_KEY) as 'dark' | 'light') ?? 'dark';
    document.body.dataset.studioTheme = saved;
    return saved;
}

function hydrateInspectorTab(kind: UIComponentKind): InspectorTab {
    if (typeof window === 'undefined') {
        return 'style';
    }
    const raw = window.localStorage.getItem(getInspectorTabStorageKey(kind));
    return isInspectorTab(raw) ? raw : 'style';
}

// ─── Store Creation ───────────────────────────────────────────────────────

const initialKind: UIComponentKind = 'button';
const initialComponentState = hydrateComponentState(initialKind);

export const useStudioStore = create<StudioState>()(
    temporal(
        (set, get) => ({
            // ─── Design state ─────────────────────────────────────
            instances: initialComponentState.instances,
            selectedInstanceId: initialComponentState.selectedInstanceId,
            nextInstanceIndex: initialComponentState.nextInstanceIndex,
            activeKind: initialKind,
            activeProjectId: null,

            // ─── UI chrome state ──────────────────────────────────
            copiedCode: false,
            exportedCode: false,
            showCanvasGrid: true,
            canvasBackground: '',
            inspectorTab: hydrateInspectorTab(initialKind),
            codePanelTab: 'snippet' as CodePanelTab,
            exportStyleMode: 'inline' as ExportStyleMode,
            studioTheme: hydrateStudioTheme(),
            profileMenuOpen: false,
            componentPickerOpen: false,
            componentPickerQuery: '',
            rightSidebarTab: 'inspector' as const,
            pinOverlayPreviews: false,
            effectsBuilderOpen: false,
            pendingEffectId: null,
            editingVariantId: null,
            editingVariantName: '',
            hoverPreviewInstanceId: null,
            instanceContextMenu: null,
            motionPreviewKey: 0,

            // ─── Tokens ───────────────────────────────────────────
            tokenSets: hydrateTokenSets(),
            activeTokenSetId: hydrateActiveTokenSetId(),
            tokenSyncMessage: '',
            tokensLoading: false,
            showTokenManager: false,
            newSetName: '',
            showNewSetInput: false,
            newTokenForm: null,
            suggestPaletteColor: '#6366f1',
            suggestingPalette: false,

            // ─── Profile ──────────────────────────────────────────
            showProfile: false,
            profileName: '',
            profileAvatarPreview: null,
            profileAvatarBase64: undefined,
            profileSaving: false,
            profileSaved: false,
            profileError: null,

            // ─── Simple setters ───────────────────────────────────
            setActiveKind: (kind) => set({ activeKind: kind }),
            setInstances: (arg) => {
                if (typeof arg === 'function') {
                    set((state) => ({ instances: arg(state.instances) }));
                } else {
                    set({ instances: arg });
                }
            },
            setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),
            setCopiedCode: (v) => set({ copiedCode: v }),
            setExportedCode: (v) => set({ exportedCode: v }),
            setShowCanvasGrid: (v) => set({ showCanvasGrid: v }),
            setCanvasBackground: (color) => {
                set({ canvasBackground: color });
                const { activeProjectId } = get();
                persistProjectSettings(activeProjectId, { canvasBackground: color });
            },
            setInspectorTab: (tab) => {
                set({ inspectorTab: tab });
                const { activeKind } = get();
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(getInspectorTabStorageKey(activeKind), tab);
                }
            },
            setCodePanelTab: (tab) => set({ codePanelTab: tab }),
            setExportStyleMode: (mode) => set({ exportStyleMode: mode }),
            setStudioTheme: (theme) => {
                set({ studioTheme: theme });
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(STUDIO_THEME_STORAGE_KEY, theme);
                    document.body.dataset.studioTheme = theme;
                }
            },
            setProfileMenuOpen: (v) => set({ profileMenuOpen: v }),
            setComponentPickerOpen: (v) => {
                if (typeof v === 'function') {
                    set((state) => ({ componentPickerOpen: v(state.componentPickerOpen) }));
                } else {
                    set({ componentPickerOpen: v });
                }
            },
            setComponentPickerQuery: (v) => set({ componentPickerQuery: v }),
            setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
            setPinOverlayPreviews: (v) => set({ pinOverlayPreviews: v }),
            setEffectsBuilderOpen: (v) => set({ effectsBuilderOpen: v }),
            setPendingEffectId: (id) => set({ pendingEffectId: id }),
            setEditingVariantId: (id) => set({ editingVariantId: id }),
            setEditingVariantName: (name) => set({ editingVariantName: name }),
            setHoverPreviewInstanceId: (id) => set({ hoverPreviewInstanceId: id }),
            setInstanceContextMenu: (menu) => set({ instanceContextMenu: menu }),
            setMotionPreviewKey: (v) => set({ motionPreviewKey: v }),
            replayMotion: () => set((state) => ({ motionPreviewKey: state.motionPreviewKey + 1 })),

            // Token setters
            setTokenSets: (arg) => {
                if (typeof arg === 'function') {
                    set((state) => {
                        const next = arg(state.tokenSets);
                        if (typeof window !== 'undefined') {
                            window.localStorage.setItem(TOKEN_SETS_STORAGE_KEY, JSON.stringify(next));
                        }
                        return { tokenSets: next };
                    });
                } else {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem(TOKEN_SETS_STORAGE_KEY, JSON.stringify(arg));
                    }
                    set({ tokenSets: arg });
                }
            },
            setActiveTokenSetId: (id) => {
                set({ activeTokenSetId: id });
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(ACTIVE_TOKEN_SET_STORAGE_KEY, id);
                }
            },
            setTokenSyncMessage: (msg) => set({ tokenSyncMessage: msg }),
            setTokensLoading: (v) => set({ tokensLoading: v }),
            setShowTokenManager: (v) => set({ showTokenManager: v }),
            setNewSetName: (v) => set({ newSetName: v }),
            setShowNewSetInput: (v) => set({ showNewSetInput: v }),
            setNewTokenForm: (form) => set({ newTokenForm: form }),
            setSuggestPaletteColor: (color) => set({ suggestPaletteColor: color }),
            setSuggestingPalette: (v) => set({ suggestingPalette: v }),

            // Profile setters
            setShowProfile: (v) => set({ showProfile: v }),
            setProfileName: (v) => set({ profileName: v }),
            setProfileAvatarPreview: (v) => set({ profileAvatarPreview: v }),
            setProfileAvatarBase64: (v) => set({ profileAvatarBase64: v }),
            setProfileSaving: (v) => set({ profileSaving: v }),
            setProfileSaved: (v) => set({ profileSaved: v }),
            setProfileError: (v) => set({ profileError: v }),

            // ─── Design Actions ───────────────────────────────────
            updateSelectedStyle: (key, value) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? { ...instance, style: { ...instance.style, [key]: value } }
                            : instance,
                    ),
                }));
            },

            updateSelectedStyles: (updates) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? { ...instance, style: { ...instance.style, ...updates } }
                            : instance,
                    ),
                }));
            },

            updateStateOverride: (state, key, value) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((s) => ({
                    instances: s.instances.map((instance) => {
                        if (instance.id !== selectedInstanceId) return instance;
                        const overrides: StateOverrides = { ...instance.stateOverrides };
                        const stateObj = { ...overrides[state] };
                        // Prune if value matches base style
                        if (instance.style[key] === value) {
                            delete (stateObj as Record<string, unknown>)[key];
                        } else {
                            (stateObj as Record<string, unknown>)[key] = value;
                        }
                        if (Object.keys(stateObj).length === 0) {
                            delete overrides[state];
                        } else {
                            overrides[state] = stateObj;
                        }
                        return {
                            ...instance,
                            stateOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
                        };
                    }),
                }));
            },

            updateStateOverrides: (state, updates) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((s) => ({
                    instances: s.instances.map((instance) => {
                        if (instance.id !== selectedInstanceId) return instance;
                        const overrides: StateOverrides = { ...instance.stateOverrides };
                        const stateObj = { ...overrides[state], ...updates };
                        // Prune keys that match base style
                        for (const [k, v] of Object.entries(updates)) {
                            if ((instance.style as any)[k] === v) {
                                delete (stateObj as any)[k];
                            }
                        }
                        if (Object.keys(stateObj).length === 0) {
                            delete overrides[state];
                        } else {
                            overrides[state] = stateObj;
                        }
                        return {
                            ...instance,
                            stateOverrides: Object.keys(overrides).length > 0 ? overrides : undefined,
                        };
                    }),
                }));
            },

            applySizeTokenToSelected: (size, sizeToken) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? {
                                ...instance,
                                style: {
                                    ...instance.style,
                                    size,
                                    customHeight: sizeToken.height,
                                    customWidth: typeof sizeToken.width === 'number' ? sizeToken.width : 0,
                                },
                            }
                            : instance,
                    ),
                }));
            },

            addInstance: (kind) => {
                const { activeKind, nextInstanceIndex } = get();
                const targetKind = kind ?? activeKind;
                const newInstance = createInstance(targetKind, nextInstanceIndex);
                set((state) => ({
                    instances: [...state.instances, newInstance],
                    selectedInstanceId: newInstance.id,
                    nextInstanceIndex: state.nextInstanceIndex + 1,
                    componentPickerOpen: false,
                    componentPickerQuery: '',
                }));
            },

            deleteInstance: (id) => {
                set((state) => {
                    if (state.instances.length <= 1) return state;
                    const remaining = state.instances.filter((instance) => instance.id !== id);
                    const needsNewSelection = state.selectedInstanceId === id;
                    return {
                        instances: remaining,
                        ...(needsNewSelection && { selectedInstanceId: remaining[0]?.id ?? null }),
                    };
                });
            },

            duplicateInstance: (sourceId) => {
                const { instances, nextInstanceIndex } = get();
                const source = instances.find((instance) => instance.id === sourceId);
                if (!source) return;
                const duplicate = createInstance(source.kind, nextInstanceIndex);
                duplicate.name = `${source.name} Copy`;
                duplicate.style = { ...source.style };
                if (source.stateOverrides) {
                    duplicate.stateOverrides = JSON.parse(JSON.stringify(source.stateOverrides));
                }
                set((state) => ({
                    instances: [...state.instances, duplicate],
                    selectedInstanceId: duplicate.id,
                    nextInstanceIndex: state.nextInstanceIndex + 1,
                }));
            },

            updateInstanceName: (id, name) => {
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === id ? { ...instance, name } : instance,
                    ),
                }));
            },

            resetSelectedStyle: () => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? { ...instance, style: createDefaultStyle(instance.kind), stateOverrides: undefined }
                            : instance,
                    ),
                }));
            },

            applyPresetToSelected: (preset) => {
                const { selectedInstanceId } = get();
                if (!selectedInstanceId) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? (() => {
                                const mergedStyle: ComponentStyleConfig = {
                                    ...instance.style,
                                    ...preset.values,
                                };
                                return {
                                    ...instance,
                                    style: supportsEntryMotion(instance.kind)
                                        ? mergedStyle
                                        : { ...mergedStyle, motionEntryEnabled: false },
                                };
                            })()
                            : instance,
                    ),
                }));
            },

            applyComponentVisualPreset: (presetId) => {
                const { selectedInstanceId, instances } = get();
                if (!selectedInstanceId) return;
                const selectedInstance = instances.find((i) => i.id === selectedInstanceId);
                if (!selectedInstance) return;
                const preset = getComponentVisualPreset(selectedInstance.kind, presetId);
                if (!preset) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? (() => {
                                // Reset to defaults first so effects/motion from previous presets don't persist
                                const mergedStyle: ComponentStyleConfig = {
                                    ...DEFAULT_STYLE,
                                    ...preset.values,
                                    componentPreset: preset.id,
                                    motionPreset: preset.autoMotionPreset ?? (preset.id.startsWith('motion-') ? instance.style.motionPreset : 'none'),
                                };
                                return {
                                    ...instance,
                                    style: mergedStyle,
                                    stateOverrides: undefined,
                                };
                            })()
                            : instance,
                    ),
                }));
            },

            applyMotionComponentPreset: (presetId) => {
                const { selectedInstanceId, instances } = get();
                if (!selectedInstanceId) return;
                const selectedInstance = instances.find((i) => i.id === selectedInstanceId);
                if (!selectedInstance) return;
                const preset = getMotionComponentPresets(selectedInstance.kind).find((item) => item.id === presetId);
                if (!preset) return;
                set((state) => ({
                    instances: state.instances.map((instance) =>
                        instance.id === selectedInstanceId
                            ? {
                                ...instance,
                                style: supportsEntryMotion(instance.kind)
                                    ? { ...instance.style, ...preset.values }
                                    : { ...instance.style, ...preset.values, motionEntryEnabled: false },
                            }
                            : instance,
                    ),
                }));
            },

            clearVisualMotionPreset: () => {
                get().applyComponentVisualPreset('default');
            },

            // ─── Persistence ──────────────────────────────────────

            setActiveProjectId: (projectId) => {
                const settings = hydrateProjectSettings(projectId ?? undefined);
                set({ activeProjectId: projectId, canvasBackground: settings.canvasBackground });
            },

            persistComponentState: () => {
                if (typeof window === 'undefined') return;
                const { activeKind, activeProjectId, instances, selectedInstanceId, nextInstanceIndex } = get();
                const payload: PersistedComponentState = {
                    instances,
                    selectedInstanceId: instances.some((i) => i.id === selectedInstanceId) ? selectedInstanceId : null,
                    nextInstanceIndex,
                };
                const json = JSON.stringify(payload);

                if (activeProjectId) {
                    // Project-scoped: write only to project key + schedule Neon sync
                    window.localStorage.setItem(getProjectComponentStorageKey(activeProjectId, activeKind), json);
                    scheduleNeonSync(activeProjectId, activeKind, payload);
                } else {
                    // Legacy un-scoped (no project context)
                    window.localStorage.setItem(getComponentStorageKey(activeKind), json);
                }
            },

            hydrateForKind: (kind) => {
                const { activeProjectId } = get();
                const persisted = hydrateComponentState(kind, activeProjectId ?? undefined);
                set({
                    activeKind: kind,
                    instances: persisted.instances,
                    selectedInstanceId: persisted.selectedInstanceId,
                    nextInstanceIndex: persisted.nextInstanceIndex,
                    inspectorTab: hydrateInspectorTab(kind),
                    editingVariantId: null,
                    editingVariantName: '',
                    codePanelTab: 'snippet',
                    componentPickerOpen: false,
                    componentPickerQuery: '',
                });
            },

            hydrateFromNeon: async (kind) => {
                const { activeProjectId } = get();
                if (!activeProjectId) return;
                try {
                    const remote = await fetchProjectComponentKind(activeProjectId, kind);
                    if (!remote) return; // No remote data yet — keep localStorage data
                    const parsed = parsePersistedData(kind, remote);
                    if (!parsed) return;
                    // Write to localStorage cache
                    window.localStorage.setItem(
                        getProjectComponentStorageKey(activeProjectId, kind),
                        JSON.stringify(parsed),
                    );
                    // Update store if still on the same project + kind
                    const current = get();
                    if (current.activeProjectId === activeProjectId && current.activeKind === kind) {
                        set({
                            instances: parsed.instances,
                            selectedInstanceId: parsed.selectedInstanceId,
                            nextInstanceIndex: parsed.nextInstanceIndex,
                        });
                    }
                } catch (err) {
                    console.warn('[ui-studio] Neon hydration failed, using localStorage:', err);
                }
            },

            hydrateSettingsFromNeon: async () => {
                const { activeProjectId } = get();
                if (!activeProjectId) return;
                try {
                    const remote = await fetchProjectComponentKind(activeProjectId, PROJECT_SETTINGS_KIND);
                    if (!remote) return;
                    const settings = remote as Partial<ProjectSettings>;
                    const merged: ProjectSettings = { canvasBackground: settings.canvasBackground ?? '' };
                    // Cache in localStorage
                    window.localStorage.setItem(
                        `${PROJECT_SETTINGS_STORAGE_PREFIX}${activeProjectId}`,
                        JSON.stringify(merged),
                    );
                    // Update store if still on same project
                    if (get().activeProjectId === activeProjectId) {
                        set({ canvasBackground: merged.canvasBackground });
                    }
                } catch (err) {
                    console.warn('[ui-studio] Settings hydration failed, using localStorage:', err);
                }
            },
        }),
        {
            // Only track design-related state for undo/redo
            partialize: (state) => ({
                instances: state.instances,
                selectedInstanceId: state.selectedInstanceId,
                nextInstanceIndex: state.nextInstanceIndex,
            }),
            limit: 50,
        },
    ),
);

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectSelectedInstance = (state: StudioState) =>
    state.instances.find((instance) => instance.id === state.selectedInstanceId) ?? null;

export const selectActiveTokenSet = (state: StudioState) =>
    state.tokenSets.find((set) => set.id === state.activeTokenSetId) ?? SYSTEM_TOKEN_SET;

export const selectSelectedStyle = (state: StudioState) => {
    const instance = selectSelectedInstance(state);
    return instance?.style ?? null;
};
