import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, ChevronDown, Play, Pipette, RotateCcw } from 'lucide-react';
import { Grid, Moon, Sun } from '@mynaui/icons-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MotionInspectorSection } from '@/components/ui/motion/MotionInspectorSection';
import { cn } from '@/lib/utils';
import { SYSTEM_TOKEN_SET_ID, ensureTokenSetsWithSystem, sanitizeTokenSet } from '@/components/ui/token-sets';
import type { StudioTokenSet } from '@/components/ui/token-sets';
import { fetchTokenSetsFromApi } from '@/lib/token-set-api';
import type { ButtonPreviewState, ComponentInstance, UIComponentKind } from '@/components/ui/ui-studio.types';
import { COMPONENTS } from './ui-studio/constants';
import {
    buildKindTitle,
    buildPreviewPresentation,
    isUIComponentKind,
    supportsAdvancedHover,
    supportsStateStyles,
    getSupportedStates,
    supportsEntryMotion,
    supportsPanelStyle,
} from './ui-studio/utilities';
import { AdvancedHoverWrapper, getMotionComponentPresets, hasAdvancedHoverEnabled, renderWithMotionControls } from './ui-studio/motion';
import { renderPreview } from './ui-studio/preview';
import { getComponentVisualPresets } from './ui-studio/utilities';
import {
    useStudioStore,
    selectSelectedInstance,
    selectActiveTokenSet,
    selectSelectedStyle,
} from './ui-studio/store';

import { Sidebar } from './ui-studio/sidebar/Sidebar';
import { InspectorPanel } from './ui-studio/inspector/InspectorPanel';
import { ExportPanel } from './ui-studio/export/ExportPanel';
import { TokenManager } from './ui-studio/panels/TokenManager';
import { ProfileEditor } from './ui-studio/panels/ProfileEditor';

// ─── Index Page ───────────────────────────────────────────────────────────

export function UIStudioIndexPage() {
    const [openItem, setOpenItem] = useState<UIComponentKind | null>(COMPONENTS[0]?.kind ?? null);

    return (
        <div className="ui-studio-shell min-h-dvh px-4 py-8 sm:px-8">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <div>
                    <h1 className="ui-studio-heading text-3xl font-semibold tracking-tight text-[#ecf4ff]">UI Studio</h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#93aac9]">
                        Accordion index for all demo components. Open any item to launch its own focused playground page.
                    </p>
                </div>

                <div className="space-y-3">
                    {COMPONENTS.map((component) => {
                        const isOpen = openItem === component.kind;
                        return (
                            <Collapsible
                                key={component.kind}
                                open={isOpen}
                                onOpenChange={(open) => setOpenItem(open ? component.kind : null)}
                            >
                                <div className="overflow-hidden rounded-2xl bg-white/[0.03] shadow-[inset_0_0_0_1px_rgba(143,177,217,0.16)]">
                                    <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left">
                                        <div>
                                            <p className="font-medium text-[#eaf3ff]">{component.label}</p>
                                            <p className="text-xs text-[#8ea4c3]">{component.summary}</p>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                'size-4 text-[#8ea4c3] transition-transform duration-200',
                                                isOpen && 'rotate-180',
                                            )}
                                        />
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="px-4 pb-4">
                                        <div className="rounded-xl bg-white/[0.03] p-3 text-xs text-[#8ea4c3] shadow-[inset_0_0_0_1px_rgba(143,177,217,0.14)]">
                                            Source: {component.file}
                                        </div>
                                        <Link
                                            to={`/${component.kind}`}
                                            className="mt-3 inline-flex items-center rounded-lg bg-[#63e8da]/16 px-3 py-2 text-sm font-medium text-[#86fff1] shadow-[inset_0_0_0_1px_rgba(126,254,240,0.34)] transition hover:bg-[#63e8da]/24"
                                        >
                                            Open {component.label} playground
                                        </Link>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Component Page (thin shell) ──────────────────────────────────────────

const studioActionButtonClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-[#b7c8df] transition hover:bg-white/[0.1] hover:text-[#eef5ff]';

function parseCanvasColorToRgb(color: string): { r: number; g: number; b: number } | null {
    const value = color.trim();
    const hex = value.startsWith('#') ? value.slice(1) : value;
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        return {
            r: Number.parseInt(`${hex[0]}${hex[0]}`, 16),
            g: Number.parseInt(`${hex[1]}${hex[1]}`, 16),
            b: Number.parseInt(`${hex[2]}${hex[2]}`, 16),
        };
    }
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
        };
    }
    const rgbMatch = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (!rgbMatch) {
        return null;
    }
    return {
        r: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[1], 10))),
        g: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[2], 10))),
        b: Math.max(0, Math.min(255, Number.parseInt(rgbMatch[3], 10))),
    };
}

function isDarkCanvasColor(color: string): boolean {
    const rgb = parseCanvasColorToRgb(color);
    if (!rgb) {
        return true;
    }
    const luminance = ((0.2126 * rgb.r) + (0.7152 * rgb.g) + (0.0722 * rgb.b)) / 255;
    return luminance < 0.56;
}

export function UIStudioComponentPage() {
    const { id: projectId } = useParams<{ id: string }>();
    const activeKind: UIComponentKind = 'button'; // Default — sidebar switches kinds via addInstance

    // ─── Store state ──────────────────────────────────────────────
    const selectedInstance = useStudioStore(selectSelectedInstance);
    const selectedStyle = useStudioStore(selectSelectedStyle);
    const activeTokenSet = useStudioStore(selectActiveTokenSet);
    const instances = useStudioStore((s) => s.instances);
    const selectedInstanceId = useStudioStore((s) => s.selectedInstanceId);
    const nextInstanceIndex = useStudioStore((s) => s.nextInstanceIndex);
    const showCanvasGrid = useStudioStore((s) => s.showCanvasGrid);
    const setShowCanvasGrid = useStudioStore((s) => s.setShowCanvasGrid);
    const canvasBackground = useStudioStore((s) => s.canvasBackground);
    const setCanvasBackground = useStudioStore((s) => s.setCanvasBackground);
    const studioTheme = useStudioStore((s) => s.studioTheme);
    const setStudioTheme = useStudioStore((s) => s.setStudioTheme);
    const rightSidebarTab = useStudioStore((s) => s.rightSidebarTab);
    const setRightSidebarTab = useStudioStore((s) => s.setRightSidebarTab);
    const pinOverlayPreviews = useStudioStore((s) => s.pinOverlayPreviews);
    const setPinOverlayPreviews = useStudioStore((s) => s.setPinOverlayPreviews);
    const motionPreviewKey = useStudioStore((s) => s.motionPreviewKey);
    const showTokenManager = useStudioStore((s) => s.showTokenManager);
    const showProfile = useStudioStore((s) => s.showProfile);
    const inspectorTab = useStudioStore((s) => s.inspectorTab);
    const setInspectorTab = useStudioStore((s) => s.setInspectorTab);
    const codePanelTab = useStudioStore((s) => s.codePanelTab);
    const setCodePanelTab = useStudioStore((s) => s.setCodePanelTab);
    const exportStyleMode = useStudioStore((s) => s.exportStyleMode);

    const hydrateForKind = useStudioStore((s) => s.hydrateForKind);
    const hydrateFromNeon = useStudioStore((s) => s.hydrateFromNeon);
    const hydrateSettingsFromNeon = useStudioStore((s) => s.hydrateSettingsFromNeon);
    const setActiveProjectId = useStudioStore((s) => s.setActiveProjectId);
    const persistComponentState = useStudioStore((s) => s.persistComponentState);
    const updateSelectedStyle = useStudioStore((s) => s.updateSelectedStyle);
    const applyComponentVisualPreset = useStudioStore((s) => s.applyComponentVisualPreset);
    const applyMotionComponentPreset = useStudioStore((s) => s.applyMotionComponentPreset);
    const clearVisualMotionPreset = useStudioStore((s) => s.clearVisualMotionPreset);
    const setTokenSets = useStudioStore((s) => s.setTokenSets);
    const setTokenSyncMessage = useStudioStore((s) => s.setTokenSyncMessage);
    const setTokensLoading = useStudioStore((s) => s.setTokensLoading);
    const setSelectedInstanceId = useStudioStore((s) => s.setSelectedInstanceId);
    const replayMotion = useStudioStore((s) => s.replayMotion);

    // ─── Debounced preview ────────────────────────────────────────
    const [debouncedPreviewInstance, setDebouncedPreviewInstance] = useState<ComponentInstance | null>(null);

    // ─── Project + route-driven hydration ────────────────────────
    useEffect(() => {
        // Set project ID first so hydration reads the correct scoped key
        if (projectId) setActiveProjectId(projectId);
        hydrateForKind(activeKind);
        // After fast localStorage hydration, async-load from Neon (overwrites if newer)
        if (projectId) {
            hydrateFromNeon(activeKind);
            hydrateSettingsFromNeon();
        }
    }, [activeKind, projectId, setActiveProjectId, hydrateForKind, hydrateFromNeon, hydrateSettingsFromNeon]);

    // ─── Persist component state ──────────────────────────────────
    useEffect(() => {
        persistComponentState();
    }, [instances, selectedInstanceId, nextInstanceIndex, persistComponentState]);

    // ─── Token sync on mount ──────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        const syncTokenSets = async () => {
            setTokensLoading(true);
            try {
                const fromApi = await fetchTokenSetsFromApi();
                if (cancelled) return;
                const sanitized = fromApi
                    .map((set) => sanitizeTokenSet(set))
                    .filter((set): set is StudioTokenSet => set !== null)
                    .map((set) => ({ ...set, source: 'user' as const }));
                setTokenSets(ensureTokenSetsWithSystem(sanitized));
                setTokenSyncMessage(sanitized.length > 0 ? 'Token sets synced from Neon.' : 'No remote token sets yet.');
            } catch {
                if (!cancelled) {
                    setTokenSyncMessage('Token sets are currently local. Sign in to sync with Neon.');
                }
            } finally {
                if (!cancelled) setTokensLoading(false);
            }
        };
        void syncTokenSets();
        return () => { cancelled = true; };
    }, [setTokenSets, setTokenSyncMessage, setTokensLoading]);

    // ─── Debounced preview instance ───────────────────────────────
    useEffect(() => {
        if (!selectedInstance) {
            setDebouncedPreviewInstance(null);
            return;
        }
        const timeoutId = window.setTimeout(() => setDebouncedPreviewInstance(selectedInstance), 45);
        return () => window.clearTimeout(timeoutId);
    }, [selectedInstance]);

    // ─── Guards ───────────────────────────────────────────────────
    useEffect(() => {
        if (selectedInstanceId && !instances.some((i) => i.id === selectedInstanceId)) {
            setSelectedInstanceId(instances[0]?.id ?? null);
        }
    }, [instances, selectedInstanceId, setSelectedInstanceId]);

    const isOverlayComponent = selectedInstance ? supportsPanelStyle(selectedInstance.kind) : false;
    const usesStateAppearanceControls = selectedInstance ? supportsStateStyles(selectedInstance.kind) : false;
    const canReplayEntryMotion = Boolean(
        selectedInstance &&
        supportsEntryMotion(selectedInstance.kind) &&
        selectedInstance.style.motionEntryEnabled,
    );
    const stageHandlesOwnEntryMotion = (kind: UIComponentKind) =>
        supportsPanelStyle(kind) || kind === 'accordion' || kind === 'alert';
    const stageHandlesOwnInteractionMotion = (kind: UIComponentKind) =>
        stageHandlesOwnEntryMotion(kind) || kind === 'switch' || kind === 'tabs' || kind === 'checkbox';

    useEffect(() => {
        if (!isOverlayComponent && pinOverlayPreviews) setPinOverlayPreviews(false);
    }, [isOverlayComponent, pinOverlayPreviews, setPinOverlayPreviews]);

    useEffect(() => {
        if (!selectedInstance || supportsEntryMotion(selectedInstance.kind) || !selectedInstance.style.motionEntryEnabled) return;
        updateSelectedStyle('motionEntryEnabled', false);
    }, [selectedInstance, updateSelectedStyle]);

    const hasPrimitiveBehaviorControls = false; // placeholder — not used in thin shell
    const availableInspectorTabs = useMemo(
        () => (hasPrimitiveBehaviorControls ? (['style', 'interaction', 'behavior'] as const) : (['style', 'interaction'] as const)),
        [hasPrimitiveBehaviorControls],
    );

    useEffect(() => {
        if (!(availableInspectorTabs as readonly string[]).includes(inspectorTab)) setInspectorTab('style');
    }, [availableInspectorTabs, inspectorTab, setInspectorTab]);

    useEffect(() => {
        if (exportStyleMode === 'inline' && codePanelTab === 'theme') setCodePanelTab('code');
    }, [codePanelTab, exportStyleMode, setCodePanelTab]);

    // ─── Derived values for canvas + motion ───────────────────────
    const activePreviewInstance =
        selectedInstance && debouncedPreviewInstance?.id === selectedInstance.id ? debouncedPreviewInstance : selectedInstance;

    const STATE_LABELS: Record<string, string> = { default: 'Default', hover: 'Hover', active: 'Active', disabled: 'Disabled', focus: 'Focus' };
    const buttonStateOptions: Array<{ value: ButtonPreviewState; label: string }> = useMemo(() => {
        if (!selectedInstance) return [{ value: 'default' as ButtonPreviewState, label: 'Default' }];
        const states = getSupportedStates(selectedInstance.kind);
        return [
            { value: 'default' as ButtonPreviewState, label: 'Default' },
            ...states.map((s) => ({ value: s as ButtonPreviewState, label: STATE_LABELS[s] ?? s })),
        ];
    }, [selectedInstance?.kind]);

    const previewStateSource = activePreviewInstance ?? selectedInstance ?? null;
    const stagePreviewInstance =
        previewStateSource && usesStateAppearanceControls
            ? { ...previewStateSource, style: { ...previewStateSource.style, buttonPreviewState: 'default' as ButtonPreviewState } }
            : previewStateSource;
    const stagePreview = stagePreviewInstance ? buildPreviewPresentation(stagePreviewInstance) : null;

    const statePreviewItems =
        previewStateSource && usesStateAppearanceControls
            ? buttonStateOptions.map((state) => {
                const instanceForState: ComponentInstance = {
                    ...previewStateSource,
                    style: { ...previewStateSource.style, buttonPreviewState: state.value },
                };
                return { ...state, instance: instanceForState, preview: buildPreviewPresentation(instanceForState) };
            })
            : [];

    const componentVisualPresets = useMemo(
        () => (selectedInstance ? getComponentVisualPresets(selectedInstance.kind) : []),
        [selectedInstance?.kind],
    );
    const visualMotionPresets = useMemo(
        () =>
            componentVisualPresets
                .filter((preset) => preset.id.startsWith('motion-'))
                .map((preset) => ({ id: preset.id, label: preset.label, description: preset.description })),
        [componentVisualPresets],
    );
    const motionComponentPresets = useMemo(
        () => (selectedInstance ? getMotionComponentPresets(selectedInstance.kind) : []),
        [selectedInstance?.kind],
    );
    const interactionMotionPresets = useMemo(
        () =>
            motionComponentPresets.filter((preset) =>
                ['tap-scale', 'hover-lift', 'button-press', 'card-hover'].includes(preset.id),
            ),
        [motionComponentPresets],
    );
    const surfaceMotionPresets = useMemo(
        () =>
            motionComponentPresets.filter((preset) =>
                ['fade-in', 'fade-scale', 'scale-in', 'slide-up', 'slide-down', 'slide-in-left', 'slide-in-right', 'modal-content', 'sheet-content', 'dropdown-down', 'dropdown-up'].includes(preset.id),
            ),
        [motionComponentPresets],
    );

    const defaultCanvasBg = studioTheme === 'dark' ? '#101a2d' : '#f3f7ff';
    const resolvedCanvasBg = canvasBackground || defaultCanvasBg;
    const canvasDotColor = studioTheme === 'dark' ? 'rgba(126, 255, 237, 0.09)' : 'rgba(31, 56, 94, 0.16)';
    const canvasDark = isDarkCanvasColor(resolvedCanvasBg);
    const canvasStateVars = useMemo(() => ({
        ['--ui-canvas-state-heading' as string]: canvasDark ? 'rgba(127,149,180,0.92)' : 'rgba(56,80,110,0.86)',
        ['--ui-canvas-state-label' as string]: canvasDark ? '#dbe8fb' : '#1a3656',
        ['--ui-canvas-state-label-selected' as string]: canvasDark ? '#eafcff' : '#0f304d',
        ['--ui-canvas-state-meta' as string]: canvasDark ? '#9bb0cc' : '#3f6087',
        ['--ui-canvas-state-accent' as string]: canvasDark ? '#86fff1' : '#0f7ea1',
        ['--ui-canvas-state-empty' as string]: canvasDark ? 'rgba(127,149,180,0.96)' : 'rgba(56,80,110,0.90)',
        ['--ui-canvas-state-selected-bg' as string]: canvasDark ? 'rgba(99,232,218,0.06)' : 'rgba(19,96,151,0.10)',
        ['--ui-canvas-state-selected-ring' as string]: canvasDark ? 'rgba(126,254,240,0.16)' : 'rgba(19,96,151,0.24)',
        ['--ui-canvas-state-hover-bg' as string]: canvasDark ? 'rgba(255,255,255,0.03)' : 'rgba(13,42,74,0.08)',
    } satisfies CSSProperties), [canvasDark]);

    // ─── Render ───────────────────────────────────────────────────
    return (
        <div className="ui-studio-shell min-h-dvh text-[#e6f0ff]" data-studio-theme={studioTheme}>
            <div className="relative min-h-dvh xl:h-dvh">
                <div className="grid min-h-dvh grid-cols-1 xl:h-full xl:grid-cols-[280px_minmax(0,1fr)_minmax(360px,280px)]">
                    {/* ─── Left Sidebar ─── */}
                    <Sidebar />

                    {/* ─── Center: Profile / Token Manager / Canvas ─── */}
                    <div className="flex min-h-0 flex-col p-3 xl:p-4">
                        {showProfile ? (
                            <ProfileEditor />
                        ) : showTokenManager ? (
                            <TokenManager />
                        ) : (
                            <section className="ui-studio-canvas flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(20,31,49,0.96),rgba(12,20,35,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_rgba(2,6,14,0.45)]">
                                <header className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="ui-studio-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f95b4]">
                                            Preview Stage
                                        </p>
                                        <p className="truncate text-xs text-[#9bb0cc]">
                                            {selectedInstance ? selectedInstance.name : 'Select a component from the left sidebar'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {canReplayEntryMotion ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isOverlayComponent && !pinOverlayPreviews) setPinOverlayPreviews(true);
                                                    replayMotion();
                                                }}
                                                className={studioActionButtonClass}
                                            >
                                                <Play className="size-3.5 fill-current" />
                                                Play Motion
                                            </button>
                                        ) : null}
                                        {isOverlayComponent ? (
                                            <button
                                                type="button"
                                                onClick={() => setPinOverlayPreviews(!pinOverlayPreviews)}
                                                className={cn(
                                                    studioActionButtonClass,
                                                    pinOverlayPreviews && 'bg-[#63e8da]/16 text-[#86fff1] shadow-[inset_0_0_0_1px_rgba(126,254,240,0.3)]',
                                                )}
                                            >
                                                {pinOverlayPreviews ? 'Unpin Overlay' : 'Pin Overlay'}
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setShowCanvasGrid(!showCanvasGrid)}
                                            className={cn(
                                                'inline-flex size-8 items-center justify-center rounded-sm transition',
                                                showCanvasGrid
                                                    ? 'bg-[#63e8da]/18 text-[#86fff1] shadow-[inset_0_0_0_1px_rgba(126,254,240,0.32)]'
                                                    : 'bg-white/[0.04] text-[#94aac8] hover:bg-white/[0.08] hover:text-[#eaf2ff]',
                                            )}
                                            aria-label="Toggle grid"
                                        >
                                            <Grid className="size-4" />
                                        </button>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        'inline-flex size-8 items-center justify-center rounded-sm transition',
                                                        canvasBackground
                                                            ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
                                                            : 'bg-white/[0.04] text-[#94aac8] hover:bg-white/[0.08] hover:text-[#eaf2ff]',
                                                    )}
                                                    aria-label="Canvas background"
                                                >
                                                    {canvasBackground ? (
                                                        <span className="size-4 rounded-sm border border-white/20" style={{ backgroundColor: canvasBackground }} />
                                                    ) : (
                                                        <Pipette className="size-4" />
                                                    )}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                side="bottom"
                                                align="end"
                                                className="w-[200px] border-white/10 bg-[#0f1828] p-3 shadow-[0_12px_32px_rgba(2,6,15,0.5)]"
                                            >
                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7f95b4]">Stage Background</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {activeTokenSet.tokens.filter((t) => t.value).map((token) => (
                                                        <button
                                                            key={token.id}
                                                            type="button"
                                                            onClick={() => setCanvasBackground(token.value!)}
                                                            className={cn(
                                                                'relative size-7 rounded-md border transition hover:scale-110',
                                                                canvasBackground === token.value
                                                                    ? 'border-[#63e8da] ring-1 ring-[#63e8da]/40'
                                                                    : 'border-white/15 hover:border-white/30',
                                                            )}
                                                            style={{ backgroundColor: token.value }}
                                                            title={token.label}
                                                        >
                                                            {canvasBackground === token.value ? (
                                                                <Check className="absolute inset-0 m-auto size-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                                                            ) : null}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="mt-2.5 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={canvasBackground}
                                                        onChange={(e) => setCanvasBackground(e.target.value)}
                                                        placeholder={defaultCanvasBg}
                                                        className="h-7 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] text-[#e6f0ff] placeholder:text-[#5a6f8a] outline-none focus:border-white/20"
                                                    />
                                                    {canvasBackground ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCanvasBackground('')}
                                                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-[#94aac8] transition hover:border-white/20 hover:text-[#eaf2ff]"
                                                            title="Reset to default"
                                                        >
                                                            <RotateCcw className="size-3" />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <button
                                            type="button"
                                            onClick={() => setStudioTheme(studioTheme === 'dark' ? 'light' : 'dark')}
                                            aria-label="Toggle light/dark mode"
                                            className={cn(
                                                'inline-flex size-8 items-center justify-center rounded-sm transition',
                                                'bg-white/[0.04] text-[#94aac8] hover:bg-white/[0.08] hover:text-[#eaf2ff]',
                                            )}
                                        >
                                            {studioTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                                        </button>
                                    </div>
                                </header>
                                <div
                                    className="flex min-h-0 flex-1 flex-col"
                                    style={{
                                        ...canvasStateVars,
                                        backgroundColor: resolvedCanvasBg,
                                        backgroundImage: showCanvasGrid
                                            ? `radial-gradient(circle, ${canvasDotColor} 1px, transparent 1px)`
                                            : 'none',
                                        backgroundSize: '16px 16px',
                                    }}
                                >
                                    <div className="relative grid min-h-0 flex-[3_1_0%] place-items-center p-8">
                                        {selectedInstance && stagePreview && stagePreviewInstance ? (
                                            <div key={`stage-preview-${stagePreviewInstance.id}-${motionPreviewKey}`} className="pointer-events-auto">
                                                {hasAdvancedHoverEnabled(stagePreviewInstance.style) ? (
                                                    <AdvancedHoverWrapper config={stagePreviewInstance.style}>
                                                        {renderWithMotionControls(
                                                            renderPreview(stagePreviewInstance, stagePreview.style, stagePreview.motionClassName, {
                                                                pinOverlayOpen: pinOverlayPreviews,
                                                            }),
                                                            stagePreviewInstance.style,
                                                            !stageHandlesOwnEntryMotion(stagePreviewInstance.kind),
                                                            !stageHandlesOwnInteractionMotion(stagePreviewInstance.kind),
                                                        )}
                                                    </AdvancedHoverWrapper>
                                                ) : (
                                                    renderWithMotionControls(
                                                        renderPreview(stagePreviewInstance, stagePreview.style, stagePreview.motionClassName, {
                                                            pinOverlayOpen: pinOverlayPreviews,
                                                        }),
                                                        stagePreviewInstance.style,
                                                        !stageHandlesOwnEntryMotion(stagePreviewInstance.kind),
                                                        !stageHandlesOwnInteractionMotion(stagePreviewInstance.kind),
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-[color:var(--ui-canvas-state-empty)]">Choose a component from the sidebar list.</p>
                                        )}
                                    </div>
                                    {statePreviewItems.length > 0 ? (
                                        <div className="flex min-h-0 flex-[2_1_0%] flex-col border-t border-white/8 px-4 py-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="ui-studio-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ui-canvas-state-heading)]">
                                                    State Snapshots
                                                </p>
                                                <p className="text-[11px] text-[color:var(--ui-canvas-state-meta)]">
                                                    Editing {selectedStyle?.buttonPreviewState}
                                                </p>
                                            </div>
                                            <div className="min-h-0 flex-1 overflow-y-auto">
                                                <div className="grid auto-rows-fr grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-4">
                                                    {statePreviewItems.map((state) => {
                                                        const isSelected = selectedStyle?.buttonPreviewState === state.value;
                                                        return (
                                                            <div key={state.value} className="flex min-w-0 flex-col">
                                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                                    <span className={cn('text-[11px] font-semibold transition', isSelected ? 'text-[color:var(--ui-canvas-state-label-selected)]' : 'text-[color:var(--ui-canvas-state-label)]')}>
                                                                        {state.label}
                                                                    </span>
                                                                    {isSelected ? <Check className="size-3.5 text-[color:var(--ui-canvas-state-accent)]" /> : null}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateSelectedStyle('buttonPreviewState', state.value)}
                                                                    className={cn(
                                                                        'inline-flex h-full min-h-[88px] w-full items-center justify-center rounded-lg text-left transition',
                                                                        isSelected
                                                                            ? 'bg-[color:var(--ui-canvas-state-selected-bg)] shadow-[inset_0_0_0_1px_var(--ui-canvas-state-selected-ring)]'
                                                                            : 'hover:bg-[color:var(--ui-canvas-state-hover-bg)]',
                                                                    )}
                                                                >
                                                                    <div className="pointer-events-none scale-[0.88] select-none [&_*]:pointer-events-none">
                                                                        {renderPreview(state.instance, state.preview.style, state.preview.motionClassName, {
                                                                            pinOverlayOpen: pinOverlayPreviews,
                                                                        })}
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ─── Right Panel ─── */}
                    <section className="ui-studio-right-panel flex min-h-0 min-w-0 flex-col overflow-hidden bg-[rgba(1, 3, 5, 0.76)] backdrop-blur-xl xl:border-l xl:border-white/8">
                        <header className="border-b border-white/8 px-4 py-2">
                            <Tabs value={rightSidebarTab} onValueChange={(value) => setRightSidebarTab(value as 'inspector' | 'motion' | 'export')} className="w-full">
                                <TabsList variant="line" className="w-full border-b border-white/10 pb-1">
                                    <TabsTrigger value="inspector" className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]">
                                        Design
                                    </TabsTrigger>
                                    <TabsTrigger value="motion" className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]">
                                        Motion FX
                                    </TabsTrigger>
                                    <TabsTrigger value="export" className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]">
                                        Export
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </header>

                        {/* Export Tab */}
                        <div className={cn('flex min-h-0 flex-1 flex-col', rightSidebarTab !== 'export' && 'hidden')}>
                            <ExportPanel />
                        </div>

                        {/* Motion Tab */}
                        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-white/8', rightSidebarTab !== 'motion' && 'hidden')}>
                            {selectedStyle && selectedInstance ? (
                                <ScrollArea className="min-h-0 h-full min-w-0 flex-1">
                                    <div className="min-w-0 px-4 pb-4 pt-3">
                                        <div className="mb-3 flex items-center justify-between border-b border-white/8 pb-2.5">
                                            <div>
                                                <h2 className="truncate text-sm font-semibold text-[#edf5ff]">{selectedInstance.name}</h2>
                                                <p className="text-[11px] text-[#8da4c3]">{buildKindTitle(selectedInstance.kind)} motion controls</p>
                                            </div>
                                        </div>
                                        <MotionInspectorSection
                                            selectedStyle={selectedStyle}
                                            componentKind={selectedInstance.kind}
                                            isOverlayComponent={isOverlayComponent}
                                            supportsEntryMotion={supportsEntryMotion(selectedInstance.kind)}
                                            supportsAdvancedHover={supportsAdvancedHover(selectedInstance.kind)}
                                            visualMotionPresets={visualMotionPresets}
                                            interactionMotionPresets={interactionMotionPresets}
                                            surfaceMotionPresets={surfaceMotionPresets}
                                            updateSelectedStyle={updateSelectedStyle}
                                            applyMotionComponentPreset={applyMotionComponentPreset}
                                            applyVisualMotionPreset={applyComponentVisualPreset}
                                            clearVisualMotionPreset={clearVisualMotionPreset}
                                        />
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="p-4 text-sm text-[#87a0c2]">Select a variant to open motion controls.</div>
                            )}
                        </div>

                        {/* Design Inspector Tab */}
                        <div className={cn('ui-studio-inspector flex min-h-0 flex-1 flex-col overflow-hidden border-t border-white/8', rightSidebarTab !== 'inspector' && 'hidden')}>
                            <InspectorPanel />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
