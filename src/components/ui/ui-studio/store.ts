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
    StylePreset,
    UIComponentKind,
} from '@/components/ui/ui-studio.types';
import {
    BUTTON_STATE_FIELD_KEYS,
    COMPONENTS,
    DEFAULT_STYLE,
    normalizeStyleConfig,
} from './constants';
import type { ButtonStateField } from './constants';
import {
    getComponentVisualPreset,
    getComponentVisualPresets,
    isUIComponentKind,
    resolveTokenToHex,
    supportsButtonStateStyle,
    supportsEntryMotion,
} from './utilities';
import { getMotionComponentPresets } from './motion';

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

export function getComponentStorageKey(kind: UIComponentKind): string {
    return `${STUDIO_STORAGE_PREFIX}${kind}`;
}

function getInspectorTabStorageKey(kind: UIComponentKind): string {
    return `${INSPECTOR_TAB_STORAGE_PREFIX}${kind}`;
}

function isInspectorTab(value: string | null): value is InspectorTab {
    return value === 'style' || value === 'interaction' || value === 'behavior';
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function createInstance(kind: UIComponentKind, index: number): ComponentInstance {
    const component = COMPONENTS.find((item) => item.kind === kind);
    return {
        id: `${kind}-${index}-${Date.now()}`,
        kind,
        name: `${component?.label ?? kind} ${index}`,
        style: { ...DEFAULT_STYLE },
    };
}

export function hydrateComponentState(kind: UIComponentKind): PersistedComponentState {
    const fallback: PersistedComponentState = {
        instances: [createInstance(kind, 1)],
        selectedInstanceId: null,
        nextInstanceIndex: 2,
    };

    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const raw = window.localStorage.getItem(getComponentStorageKey(kind));
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw) as Partial<PersistedComponentState>;
        if (!Array.isArray(parsed.instances) || parsed.instances.length === 0) {
            return fallback;
        }
        const normalizedInstances = parsed.instances.map((instance) => ({
            ...instance,
            style: normalizeStyleConfig(instance.style),
        }));
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
        return fallback;
    }
}

function syncBaseStateStyles(kind: UIComponentKind, style: ComponentStyleConfig): ComponentStyleConfig {
    if (!supportsButtonStateStyle(kind)) {
        return style;
    }
    return {
        ...style,
        buttonHoverFillMode: style.fillMode,
        buttonHoverFillColor: style.fillColor,
        buttonHoverFillColorTo: style.fillColorTo,
        buttonHoverFillWeight: style.fillWeight,
        buttonHoverFillOpacity: style.fillOpacity,
        buttonHoverFontColor: style.fontColor,
        buttonHoverFontOpacity: style.fontOpacity,
        buttonHoverFontSize: style.fontSize,
        buttonHoverFontWeight: style.fontWeight,
        buttonHoverFontPosition: style.fontPosition,
        buttonHoverStrokeColor: style.strokeColor,
        buttonHoverStrokeOpacity: style.strokeOpacity,
        buttonHoverStrokeWeight: style.strokeWeight,
        buttonActiveFillMode: style.fillMode,
        buttonActiveFillColor: style.fillColor,
        buttonActiveFillColorTo: style.fillColorTo,
        buttonActiveFillWeight: style.fillWeight,
        buttonActiveFillOpacity: style.fillOpacity,
        buttonActiveFontColor: style.fontColor,
        buttonActiveFontOpacity: style.fontOpacity,
        buttonActiveFontSize: style.fontSize,
        buttonActiveFontWeight: style.fontWeight,
        buttonActiveFontPosition: style.fontPosition,
        buttonActiveStrokeColor: style.strokeColor,
        buttonActiveStrokeOpacity: style.strokeOpacity,
        buttonActiveStrokeWeight: style.strokeWeight,
        buttonDisabledFillMode: style.fillMode,
        buttonDisabledFillColor: style.fillColor,
        buttonDisabledFillColorTo: style.fillColorTo,
        buttonDisabledFillWeight: style.fillWeight,
        buttonDisabledFillOpacity: style.fillOpacity,
        buttonDisabledFontColor: style.fontColor,
        buttonDisabledFontOpacity: style.fontOpacity,
        buttonDisabledFontSize: style.fontSize,
        buttonDisabledFontWeight: style.fontWeight,
        buttonDisabledFontPosition: style.fontPosition,
        buttonDisabledStrokeColor: style.strokeColor,
        buttonDisabledStrokeOpacity: style.strokeOpacity,
        buttonDisabledStrokeWeight: style.strokeWeight,
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

    // ─── Active component kind ────────────────────────────────────────
    activeKind: UIComponentKind;

    // ─── UI chrome state (NOT tracked by undo) ────────────────────────
    copiedCode: boolean;
    exportedCode: boolean;
    showCanvasGrid: boolean;
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
    persistComponentState: () => void;
    hydrateForKind: (kind: UIComponentKind) => void;
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

            // ─── UI chrome state ──────────────────────────────────
            copiedCode: false,
            exportedCode: false,
            showCanvasGrid: true,
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
                            ? { ...instance, style: { ...DEFAULT_STYLE } }
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
                                    style: syncBaseStateStyles(instance.kind, mergedStyle),
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
            persistComponentState: () => {
                if (typeof window === 'undefined') return;
                const { activeKind, instances, selectedInstanceId, nextInstanceIndex } = get();
                const payload: PersistedComponentState = {
                    instances,
                    selectedInstanceId: instances.some((i) => i.id === selectedInstanceId) ? selectedInstanceId : null,
                    nextInstanceIndex,
                };
                window.localStorage.setItem(getComponentStorageKey(activeKind), JSON.stringify(payload));
            },

            hydrateForKind: (kind) => {
                const persisted = hydrateComponentState(kind);
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
