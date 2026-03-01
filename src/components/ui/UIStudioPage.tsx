import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Switch } from 'radix-ui';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ChevronDown, Copy, Download, Minus, SlidersHorizontal } from 'lucide-react';
import {
    Config,
    Delete,
    EditOne,
    Grid,
    Home,
    Moon,
    Pencil,
    Plus,
    Power,
    Ruler,
    Search,
    Sparkles,
    Swatches,
    Sun,
    TextAlignCenter,
    TextAlignLeft,
    TextAlignRight,
    UserSettings,
} from '@mynaui/icons-react';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MotionInspectorSection } from '@/components/ui/motion/MotionInspectorSection';
import { cn } from '@/lib/utils';
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
    ICON_OPTIONS,
    normalizeStyleConfig,
} from './ui-studio/constants';
import type { ButtonStateField } from './ui-studio/constants';
import {
    buildExportComponentName,
    buildKindTitle,
    buildMotionClassName,
    buildPreviewPresentation,
    downloadSnippetFile,
    getComponentVisualPreset,
    getComponentVisualPresets,
    isUIComponentKind,
    resolveTokenToHex,
    sanitizeFileSegment,
    supportsAnimatedBorderEffect,
    supportsButtonStateStyle,
    supportsDropdownHoverStyle,
    supportsEntryMotion,
    supportsGradientSlideEffect,
    supportsIconSelection,
    supportsLoadingEffect,
    supportsPanelStyle,
    supportsPrimitiveControls,
    supportsRippleFillEffect,
    supportsSweepEffect,
    supportsTypographyStyle,
    toPascalCase,
    wrapSnippetInNamedComponent,
} from './ui-studio/utilities';
import type { ExportStyleMode } from './ui-studio/utilities';
import {
    buildMotionComponentSnippet,
    getMotionComponentPresets,
    renderWithMotionControls,
} from './ui-studio/motion';
import {
    FlatColorControl,
    FlatField,
    FlatInspectorSection,
    FlatSelect,
    FlatSwitchRow,
    FlatUnitField,
    MiniNumberField,
    UnitInput,
} from './ui-studio/inspector';
import { componentSnippet, renderPreview } from './ui-studio/preview';

type InspectorTab = 'style' | 'interaction' | 'behavior';
type CodePanelTab = 'snippet' | 'named' | 'exports' | 'theme';

interface PersistedComponentState {
    instances: ComponentInstance[];
    selectedInstanceId: string | null;
    nextInstanceIndex: number;
}

const STUDIO_STORAGE_PREFIX = 'ui-studio-oss:v1:';
const INSPECTOR_TAB_STORAGE_PREFIX = `${STUDIO_STORAGE_PREFIX}inspector-tab:`;
const TOKEN_SETS_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}token-sets`;
const ACTIVE_TOKEN_SET_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}active-token-set`;
const STUDIO_THEME_STORAGE_KEY = `${STUDIO_STORAGE_PREFIX}studio-theme`;

function getComponentStorageKey(kind: UIComponentKind): string {
    return `${STUDIO_STORAGE_PREFIX}${kind}`;
}

function getInspectorTabStorageKey(kind: UIComponentKind): string {
    return `${INSPECTOR_TAB_STORAGE_PREFIX}${kind}`;
}

function isInspectorTab(value: string | null): value is InspectorTab {
    return value === 'style' || value === 'interaction' || value === 'behavior';
}

function hydrateComponentState(kind: UIComponentKind): PersistedComponentState {
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

function createInstance(kind: UIComponentKind, index: number): ComponentInstance {
    const component = COMPONENTS.find((item) => item.kind === kind);
    return {
        id: `${kind}-${index}-${Date.now()}`,
        kind,
        name: `${component?.label ?? kind} ${index}`,
        style: { ...DEFAULT_STYLE },
    };
}

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

export function UIStudioComponentPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { component } = useParams<{ component: string }>();

    const activeKind: UIComponentKind = isUIComponentKind(component) ? component : 'button';
    const [initialComponentState] = useState<PersistedComponentState>(() => hydrateComponentState(activeKind));
    const [instances, setInstances] = useState<ComponentInstance[]>(() => initialComponentState.instances);
    const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(() => initialComponentState.selectedInstanceId);
    const [nextInstanceIndex, setNextInstanceIndex] = useState(() => initialComponentState.nextInstanceIndex);
    const [copiedCode, setCopiedCode] = useState(false);
    const [exportedCode, setExportedCode] = useState(false);
    const [canvasTheme, setCanvasTheme] = useState<'light' | 'dark'>('dark');
    const [showCanvasGrid, setShowCanvasGrid] = useState(true);
    const [inspectorTab, setInspectorTab] = useState<InspectorTab>(() => {
        if (typeof window === 'undefined') {
            return 'style';
        }
        const raw = window.localStorage.getItem(getInspectorTabStorageKey(activeKind));
        return isInspectorTab(raw) ? raw : 'style';
    });
    const [codePanelTab, setCodePanelTab] = useState<CodePanelTab>('snippet');
    const [exportStyleMode, setExportStyleMode] = useState<ExportStyleMode>('inline');
    const [tokenSets, setTokenSets] = useState<StudioTokenSet[]>(() => {
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
    });
    const [activeTokenSetId, setActiveTokenSetId] = useState<string>(() => {
        if (typeof window === 'undefined') {
            return SYSTEM_TOKEN_SET_ID;
        }
        return window.localStorage.getItem(ACTIVE_TOKEN_SET_STORAGE_KEY) ?? SYSTEM_TOKEN_SET_ID;
    });
    const [tokenSyncMessage, setTokenSyncMessage] = useState<string>('');
    const [tokensLoading, setTokensLoading] = useState(false);
    const [showTokenManager, setShowTokenManager] = useState(false);
    const [newSetName, setNewSetName] = useState('');
    const [showNewSetInput, setShowNewSetInput] = useState(false);
    const [newTokenForm, setNewTokenForm] = useState<{ id: string; label: string; hex: string } | null>(null);
    const [studioTheme, setStudioTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window === 'undefined') return 'dark';
        return (window.localStorage.getItem(STUDIO_THEME_STORAGE_KEY) as 'dark' | 'light') ?? 'dark';
    });
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [componentPickerOpen, setComponentPickerOpen] = useState(false);
    const [componentPickerQuery, setComponentPickerQuery] = useState('');
    const [rightSidebarTab, setRightSidebarTab] = useState<'inspector' | 'motion' | 'export'>('inspector');
    const [pinOverlayPreviews, setPinOverlayPreviews] = useState(false);
    const [effectsBuilderOpen, setEffectsBuilderOpen] = useState(false);
    const [pendingEffectId, setPendingEffectId] = useState<string | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
    const [editingVariantName, setEditingVariantName] = useState('');
    const [debouncedPreviewInstance, setDebouncedPreviewInstance] = useState<ComponentInstance | null>(null);
    const [hoverPreviewInstanceId, setHoverPreviewInstanceId] = useState<string | null>(null);
    const [instanceContextMenu, setInstanceContextMenu] = useState<{ instanceId: string; x: number; y: number } | null>(null);
    const componentSearchRef = useRef<HTMLInputElement | null>(null);
    const hoverPreviewTimerRef = useRef<number | null>(null);
    const contextMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const persisted = hydrateComponentState(activeKind);
        setInstances(persisted.instances);
        setSelectedInstanceId(persisted.selectedInstanceId);
        setNextInstanceIndex(persisted.nextInstanceIndex);
        if (typeof window !== 'undefined') {
            const raw = window.localStorage.getItem(getInspectorTabStorageKey(activeKind));
            setInspectorTab(isInspectorTab(raw) ? raw : 'style');
        }
        setEditingVariantId(null);
        setEditingVariantName('');
        setCodePanelTab('snippet');
        setComponentPickerOpen(false);
        setComponentPickerQuery('');
    }, [activeKind]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const payload: PersistedComponentState = {
            instances,
            selectedInstanceId: instances.some((instance) => instance.id === selectedInstanceId) ? selectedInstanceId : null,
            nextInstanceIndex,
        };
        window.localStorage.setItem(getComponentStorageKey(activeKind), JSON.stringify(payload));
    }, [activeKind, instances, selectedInstanceId, nextInstanceIndex]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(getInspectorTabStorageKey(activeKind), inspectorTab);
    }, [activeKind, inspectorTab]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(TOKEN_SETS_STORAGE_KEY, JSON.stringify(tokenSets));
    }, [tokenSets]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(ACTIVE_TOKEN_SET_STORAGE_KEY, activeTokenSetId);
    }, [activeTokenSetId]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STUDIO_THEME_STORAGE_KEY, studioTheme);
        }
    }, [studioTheme]);

    useEffect(() => {
        if (!tokenSets.some((set) => set.id === activeTokenSetId)) {
            setActiveTokenSetId(SYSTEM_TOKEN_SET_ID);
        }
    }, [tokenSets, activeTokenSetId]);

    useEffect(() => {
        let cancelled = false;

        const syncTokenSets = async () => {
            setTokensLoading(true);
            try {
                const fromApi = await fetchTokenSetsFromApi();
                if (cancelled) {
                    return;
                }
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
                if (!cancelled) {
                    setTokensLoading(false);
                }
            }
        };

        void syncTokenSets();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedInstanceId) {
            return;
        }
        if (!instances.some((instance) => instance.id === selectedInstanceId)) {
            setSelectedInstanceId(instances[0]?.id ?? null);
        }
    }, [instances, selectedInstanceId]);

    useEffect(() => {
        if (!componentPickerOpen) {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            componentSearchRef.current?.focus();
            componentSearchRef.current?.select();
        }, 40);
        return () => window.clearTimeout(timeoutId);
    }, [componentPickerOpen]);
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setComponentPickerOpen((current) => !current);
            }
            if (event.key === 'Escape') {
                setComponentPickerOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverPreviewTimerRef.current !== null) {
                window.clearTimeout(hoverPreviewTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!instanceContextMenu) {
            return;
        }

        const closeContextMenu = () => {
            setInstanceContextMenu(null);
        };

        const handlePointerDown = (event: MouseEvent) => {
            if (contextMenuRef.current?.contains(event.target as Node)) {
                return;
            }
            closeContextMenu();
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeContextMenu();
            }
        };

        const handleScroll = () => {
            closeContextMenu();
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [instanceContextMenu]);

    const selectedInstance = useMemo(
        () => instances.find((instance) => instance.id === selectedInstanceId) ?? null,
        [instances, selectedInstanceId],
    );
    const activeTokenSet = useMemo(
        () => tokenSets.find((set) => set.id === activeTokenSetId) ?? SYSTEM_TOKEN_SET,
        [tokenSets, activeTokenSetId],
    );
    const hasPrimitiveBehaviorControls = selectedInstance ? supportsPrimitiveControls(selectedInstance.kind) : false;
    const availableInspectorTabs = useMemo<InspectorTab[]>(
        () => (hasPrimitiveBehaviorControls ? ['style', 'interaction', 'behavior'] : ['style', 'interaction']),
        [hasPrimitiveBehaviorControls],
    );
    const componentUsage = useMemo(() => {
        const usage = new Map<UIComponentKind, number>();
        for (const instance of instances) {
            usage.set(instance.kind, (usage.get(instance.kind) ?? 0) + 1);
        }
        return usage;
    }, [instances]);
    const quickAddComponents = useMemo(
        () =>
            [...COMPONENTS]
                .sort((a, b) => (componentUsage.get(b.kind) ?? 0) - (componentUsage.get(a.kind) ?? 0) || a.label.localeCompare(b.label))
                .slice(0, 4),
        [componentUsage],
    );
    const filteredComponents = useMemo(() => {
        const query = componentPickerQuery.trim().toLowerCase();
        if (!query) {
            return COMPONENTS;
        }
        return COMPONENTS.filter((item) => {
            const searchable = `${item.label} ${item.summary} ${item.kind}`.toLowerCase();
            return searchable.includes(query);
        });
    }, [componentPickerQuery]);

    useEffect(() => {
        if (!availableInspectorTabs.includes(inspectorTab)) {
            setInspectorTab('style');
        }
    }, [availableInspectorTabs, inspectorTab]);

    useEffect(() => {
        if (exportStyleMode === 'inline' && codePanelTab === 'theme') {
            setCodePanelTab('snippet');
        }
    }, [codePanelTab, exportStyleMode]);

    const updateSelectedStyle = <K extends keyof ComponentStyleConfig>(key: K, value: ComponentStyleConfig[K]) => {
        if (!selectedInstanceId) {
            return;
        }

        setInstances((current) =>
            current.map((instance) =>
                instance.id === selectedInstanceId
                    ? {
                        ...instance,
                        style: {
                            ...instance.style,
                            [key]: value,
                        },
                    }
                    : instance,
            ),
        );
    };

    const updateSelectedStyles = (updates: Partial<ComponentStyleConfig>) => {
        if (!selectedInstanceId) {
            return;
        }

        setInstances((current) =>
            current.map((instance) =>
                instance.id === selectedInstanceId
                    ? {
                        ...instance,
                        style: {
                            ...instance.style,
                            ...updates,
                        },
                    }
                    : instance,
            ),
        );
    };

    const applySizeTokenToSelected = (size: SizeOption) => {
        if (!selectedInstanceId) {
            return;
        }

        const sizeToken = activeTokenSet.sizeTokens[size];
        setInstances((current) =>
            current.map((instance) =>
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
        );
    };

    useEffect(() => {
        if (!selectedInstance) {
            setDebouncedPreviewInstance(null);
            return;
        }
        const timeoutId = window.setTimeout(() => {
            setDebouncedPreviewInstance(selectedInstance);
        }, 45);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [selectedInstance]);

    const updateInstanceName = (id: string, name: string) => {
        setInstances((current) =>
            current.map((instance) => (instance.id === id ? { ...instance, name } : instance)),
        );
    };

    const queueHoverPreview = (instanceId: string) => {
        if (instanceContextMenu) {
            return;
        }
        if (hoverPreviewTimerRef.current !== null) {
            window.clearTimeout(hoverPreviewTimerRef.current);
        }
        hoverPreviewTimerRef.current = window.setTimeout(() => {
            setHoverPreviewInstanceId(instanceId);
        }, 700);
    };

    const clearHoverPreview = () => {
        if (hoverPreviewTimerRef.current !== null) {
            window.clearTimeout(hoverPreviewTimerRef.current);
            hoverPreviewTimerRef.current = null;
        }
        setHoverPreviewInstanceId(null);
    };

    const addInstance = (kind: UIComponentKind = activeKind) => {
        const newInstance = createInstance(kind, nextInstanceIndex);
        setInstances((current) => [...current, newInstance]);
        setSelectedInstanceId(newInstance.id);
        setNextInstanceIndex((value) => value + 1);
        setComponentPickerOpen(false);
        setComponentPickerQuery('');
    };

    const deleteInstance = (id: string) => {
        setInstances((current) => (current.length <= 1 ? current : current.filter((instance) => instance.id !== id)));
    };

    const duplicateInstance = (sourceId: string) => {
        const source = instances.find((instance) => instance.id === sourceId);
        if (!source) {
            return;
        }

        const duplicate = createInstance(source.kind, nextInstanceIndex);
        duplicate.name = `${source.name} Copy`;
        duplicate.style = { ...source.style };
        setInstances((current) => [...current, duplicate]);
        setSelectedInstanceId(duplicate.id);
        setNextInstanceIndex((value) => value + 1);
    };

    const openInstanceContextMenu = (event: React.MouseEvent<HTMLElement>, instanceId: string) => {
        event.preventDefault();
        setSelectedInstanceId(instanceId);
        setInstanceContextMenu({
            instanceId,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const updateContentDisplayMode = (mode: 'text' | 'text-icon' | 'icon') => {
        if (!selectedInstance || !supportsTextIconMode) {
            return;
        }

        const defaultIcon: IconOptionId = selectedStyle?.icon === 'none' ? 'search' : selectedStyle?.icon ?? 'search';
        if (selectedInstance.kind === 'button') {
            updateSelectedStyle('buttonShowText', mode !== 'icon');
            updateSelectedStyle('icon', mode === 'text' ? 'none' : defaultIcon);
            return;
        }
        updateSelectedStyle('badgeShowText', mode !== 'icon');
        updateSelectedStyle('icon', mode === 'text' ? 'none' : defaultIcon);
    };

    const selectedStyle = selectedInstance?.style;
    const componentVisualPresets = selectedInstance ? getComponentVisualPresets(selectedInstance.kind) : [];
    const designVisualPresets = componentVisualPresets.filter((preset) => !preset.id.startsWith('motion-'));
    const visualMotionPresets = componentVisualPresets
        .filter((preset) => preset.id.startsWith('motion-'))
        .map((preset) => ({ id: preset.id, label: preset.label, description: preset.description }));
    const activeDesignPresetId =
        selectedStyle && designVisualPresets.some((preset) => preset.id === selectedStyle.componentPreset)
            ? selectedStyle.componentPreset
            : designVisualPresets[0]?.id;
    const activeComponentPreset = selectedInstance && selectedStyle?.componentPreset
        ? getComponentVisualPreset(selectedInstance.kind, selectedStyle.componentPreset)
        : undefined;
    const motionComponentPresets = selectedInstance ? getMotionComponentPresets(selectedInstance.kind) : [];
    const interactionMotionPresets = motionComponentPresets.filter((preset) =>
        ['tap-scale', 'hover-lift', 'button-press', 'card-hover'].includes(preset.id),
    );
    const surfaceMotionPresets = motionComponentPresets.filter((preset) =>
        [
            'fade-in',
            'fade-scale',
            'scale-in',
            'slide-up',
            'slide-down',
            'slide-in-left',
            'slide-in-right',
            'modal-content',
            'sheet-content',
            'dropdown-down',
            'dropdown-up',
        ].includes(preset.id),
    );
    const supportsTextIconMode =
        selectedInstance?.kind === 'button' || selectedInstance?.kind === 'badge';
    const isOverlayComponent = selectedInstance ? supportsEntryMotion(selectedInstance.kind) : false;
    const hasPanelElementControls = selectedInstance ? supportsPanelStyle(selectedInstance.kind) : false;
    const usesStateAppearanceControls = selectedInstance ? supportsButtonStateStyle(selectedInstance.kind) : false;
    const supportsGradientSlide = selectedInstance ? supportsGradientSlideEffect(selectedInstance.kind) : false;
    const supportsAnimatedBorder = selectedInstance ? supportsAnimatedBorderEffect(selectedInstance.kind) : false;
    const supportsRippleFill = selectedInstance ? supportsRippleFillEffect(selectedInstance.kind) : false;
    const supportsLoadingState = selectedInstance ? supportsLoadingEffect(selectedInstance.kind) : false;
    const supportsSweep = selectedInstance ? supportsSweepEffect(selectedInstance.kind) : false;

    useEffect(() => {
        if (!isOverlayComponent && pinOverlayPreviews) {
            setPinOverlayPreviews(false);
        }
    }, [isOverlayComponent, pinOverlayPreviews]);

    const appearanceSectionTitle = selectedInstance
        ? `${buildKindTitle(selectedInstance.kind)} Appearance`
        : 'Appearance';
    const showWidthControl =
        selectedInstance?.kind === 'slider' ||
        selectedInstance?.kind === 'checkbox' ||
        selectedInstance?.kind === 'input' ||
        selectedInstance?.kind === 'tabs';
    const contentDisplayMode: 'text' | 'text-icon' | 'icon' = selectedStyle
        ? selectedInstance?.kind === 'button'
            ? selectedStyle.buttonShowText
                ? selectedStyle.icon === 'none'
                    ? 'text'
                    : 'text-icon'
                : 'icon'
            : selectedInstance?.kind === 'badge'
                ? selectedStyle.badgeShowText
                    ? selectedStyle.icon === 'none'
                        ? 'text'
                        : 'text-icon'
                    : 'icon'
                : 'text'
        : 'text';

    const getStyleForMotionOutput = (instance: ComponentInstance): ComponentStyleConfig =>
        supportsEntryMotion(instance.kind)
            ? instance.style
            : {
                ...instance.style,
                motionEntryEnabled: false,
            };

    useEffect(() => {
        if (!selectedInstance || supportsEntryMotion(selectedInstance.kind) || !selectedInstance.style.motionEntryEnabled) {
            return;
        }
        updateSelectedStyle('motionEntryEnabled', false);
    }, [selectedInstance, updateSelectedStyle]);

    const buildSnippetForInstance = (instance: ComponentInstance): string => {
        const preview = buildPreviewPresentation(instance);
        const baseSnippet = componentSnippet(
            instance,
            preview.style,
            preview.motionClassName,
            exportStyleMode,
            activeTokenSet,
        );
        const motionSnippet = buildMotionComponentSnippet(getStyleForMotionOutput(instance));
        return motionSnippet ? `${baseSnippet}\n\n${motionSnippet}` : baseSnippet;
    };

    const buildNamedSnippetForInstance = (instance: ComponentInstance): string => {
        const preview = buildPreviewPresentation(instance);
        const baseSnippet = componentSnippet(
            instance,
            preview.style,
            preview.motionClassName,
            exportStyleMode,
            activeTokenSet,
        );
        return wrapSnippetInNamedComponent(baseSnippet, buildExportComponentName(instance), buildMotionComponentSnippet(getStyleForMotionOutput(instance)));
    };

    const buildMultiVariantBundle = (sourceInstances: ComponentInstance[]): string => {
        const payload = {
            version: 1,
            type: 'ui-studio-design-bundle',
            componentKind: activeKind,
            exportStyleMode,
            activeTokenSetId,
            tokenSets: tokenSets.map((set) => ({
                id: set.id,
                name: set.name,
                source: set.source,
                tokens: set.tokens.map((token) => ({
                    id: token.id,
                    label: token.label,
                    value: resolveTokenToHex(token) ?? token.value ?? '#000000',
                    cssVar: token.cssVar,
                })),
                sizeTokens: set.sizeTokens,
            })),
            components: sourceInstances.map((instance) => ({
                id: instance.id,
                name: instance.name,
                kind: instance.kind,
                style: instance.style,
            })),
        };

        return JSON.stringify(payload, null, 2);
    };

    const buildTailwindThemeStyles = (): string => {
        const sanitizeTokenVarName = (tokenId: string): string =>
            tokenId
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

        const knownVarFallbacks: Record<string, string> = {
            '--background': '#ffffff',
            '--foreground': '#0f1419',
            '--primary': '#4daebc',
            '--secondary': '#f1f5f9',
            '--accent': '#e0f7fa',
            '--muted': '#f1f5f9',
            '--border': '#d8dee8',
            '--input': '#e2e8f0',
            '--ring': '#4daebc',
            '--success': '#10b981',
            '--warning': '#f59e0b',
            '--info': '#3b82f6',
            '--destructive': '#ef4444',
        };

        const inferCssVar = (token: StudioColorToken): string => {
            if (token.cssVar) {
                return token.cssVar;
            }
            const normalized = sanitizeTokenVarName(token.id);
            const semanticVars: Record<string, string> = {
                background: '--background',
                foreground: '--foreground',
                primary: '--primary',
                secondary: '--secondary',
                accent: '--accent',
                muted: '--muted',
                border: '--border',
                input: '--input',
                ring: '--ring',
                success: '--success',
                warning: '--warning',
                info: '--info',
                destructive: '--destructive',
            };
            return semanticVars[normalized] ?? `--ui-${normalized}`;
        };

        const buildVarLinesForSet = (set: StudioTokenSet): string[] => {
            const deduped = new Map<string, string>();
            for (const token of set.tokens) {
                const cssVar = inferCssVar(token);
                const resolved =
                    resolveTokenToHex(token) ??
                    token.value ??
                    knownVarFallbacks[cssVar] ??
                    '#000000';
                deduped.set(cssVar, resolved);
            }
            return Array.from(deduped.entries()).map(([cssVar, value]) => `  ${cssVar}: ${value};`);
        };

        const activeVarLines = buildVarLinesForSet(activeTokenSet);
        const sizeLines = [
            `  --ui-size-sm-height: ${activeTokenSet.sizeTokens.sm.height}px;`,
            `  --ui-size-sm-width: ${(activeTokenSet.sizeTokens.sm.width ?? 0)}px;`,
            `  --ui-size-md-height: ${activeTokenSet.sizeTokens.md.height}px;`,
            `  --ui-size-md-width: ${(activeTokenSet.sizeTokens.md.width ?? 0)}px;`,
            `  --ui-size-lg-height: ${activeTokenSet.sizeTokens.lg.height}px;`,
            `  --ui-size-lg-width: ${(activeTokenSet.sizeTokens.lg.width ?? 0)}px;`,
        ];

        const themeInlineLines = activeTokenSet.tokens.map((token) => {
            const cssVar = inferCssVar(token);
            return `  --color-${sanitizeTokenVarName(token.id)}: var(${cssVar});`;
        });

        const additionalThemeBlocks = tokenSets
            .filter((set) => set.id !== activeTokenSet.id)
            .map((set) => {
                const selector = `[data-ui-theme='${set.id.replace(/'/g, "\\'")}']`;
                return `${selector} {\n${buildVarLinesForSet(set).join('\n')}\n}`;
            })
            .join('\n\n');

        const usesRainbowMotion = instances.some(
            (instance) => buildMotionClassName(instance.kind, instance.style.motionPreset) === 'ui-studio-motion-rainbow',
        );
        const usesShimmerMotion = instances.some(
            (instance) => buildMotionClassName(instance.kind, instance.style.motionPreset) === 'ui-studio-motion-shimmer',
        );
        const usesAnimatedBorderEffect = instances.some(
            (instance) => supportsAnimatedBorderEffect(instance.kind) && instance.style.effectAnimatedBorderEnabled,
        );
        const usesGradientSlideEffect = instances.some(
            (instance) => supportsGradientSlideEffect(instance.kind) && instance.style.effectGradientSlideEnabled,
        );
        const usesRippleFillEffect = instances.some(
            (instance) => supportsRippleFillEffect(instance.kind) && instance.style.effectRippleFillEnabled,
        );
        const usesSweepEffect = instances.some(
            (instance) => supportsSweepEffect(instance.kind) && instance.style.effectSweepEnabled,
        );

        const motionUtilityBlocks: string[] = [];
        if (usesRainbowMotion) {
            motionUtilityBlocks.push(`  .ui-studio-motion-rainbow {
    position: relative;
    overflow: hidden;
    border-color: transparent !important;
    background-image:
      linear-gradient(var(--ui-motion-fill, rgba(17, 24, 39, 0.82)), var(--ui-motion-fill, rgba(17, 24, 39, 0.82))),
      linear-gradient(
        90deg,
        var(--ui-motion-rainbow-1, #22d3ee),
        var(--ui-motion-rainbow-2, #60a5fa),
        var(--ui-motion-rainbow-3, #a78bfa),
        var(--ui-motion-rainbow-4, #34d399),
        var(--ui-motion-rainbow-5, #f59e0b),
        var(--ui-motion-rainbow-1, #22d3ee)
      );
    background-origin: border-box;
    background-clip: padding-box, border-box;
    background-size: 100% 100%, 300% 100%;
    animation: ui-studio-rainbow-shift var(--ui-motion-speed, 2.8s) linear infinite;
  }`);
        }

        if (usesShimmerMotion) {
            motionUtilityBlocks.push(`  .ui-studio-motion-shimmer {
    position: relative;
    overflow: hidden;
    background-image: linear-gradient(
      110deg,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 0%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 38%,
      var(--ui-motion-shimmer, rgba(255, 255, 255, 0.66)) 50%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 62%,
      var(--ui-motion-fill, rgba(18, 25, 40, 0.96)) 100%
    );
    background-size: 220% 100%;
    animation: ui-studio-shimmer-sweep var(--ui-motion-speed, 2.8s) linear infinite;
  }`);
        }

        if (usesGradientSlideEffect) {
            motionUtilityBlocks.push(`  .ui-studio-effect-gradient-slide {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-gradient-slide::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    transition: transform var(--ui-effect-gs-speed, 0.32s) ease;
    z-index: 0;
  }

  .ui-studio-effect-gradient-slide > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-gradient-slide-gradient::before {
    background: linear-gradient(135deg, var(--ui-motion-gradient-from, #f54900), var(--ui-motion-gradient-to, #ff8904));
  }

  .ui-studio-effect-gradient-slide-solid::before {
    background: var(--ui-motion-gradient-from, #f54900);
  }

  .ui-studio-effect-gradient-slide-left::before {
    transform: translateX(-100%);
  }

  .ui-studio-effect-gradient-slide-right::before {
    transform: translateX(100%);
  }

  .ui-studio-effect-gradient-slide-top::before {
    transform: translateY(-100%);
  }

  .ui-studio-effect-gradient-slide-bottom::before {
    transform: translateY(100%);
  }

  .ui-studio-effect-gradient-slide:hover::before {
    transform: translate(0, 0);
  }`);
        }

        if (usesAnimatedBorderEffect) {
            motionUtilityBlocks.push(`  .ui-studio-effect-animated-border {
    position: relative;
  }

  .ui-studio-effect-animated-border-state-default,
  .ui-studio-effect-animated-border-state-hover:hover,
  .ui-studio-effect-animated-border-state-active:active,
  .ui-studio-effect-animated-border-state-disabled:disabled,
  .ui-studio-effect-animated-border-state-disabled[data-disabled='true'],
  .ui-studio-effect-animated-border-state-disabled[aria-disabled='true'] {
    border-color: transparent !important;
    border-width: var(--ui-effect-border-width, 1px) !important;
    background:
      linear-gradient(var(--ui-animated-border-fill, var(--ui-motion-fill, rgba(17, 24, 39, 0.9))), var(--ui-animated-border-fill, var(--ui-motion-fill, rgba(17, 24, 39, 0.9)))),
      linear-gradient(
        90deg,
        var(--ui-effect-border-1, #22d3ee),
        var(--ui-effect-border-2, #60a5fa),
        var(--ui-effect-border-3, #a78bfa),
        var(--ui-effect-border-4, #34d399),
        var(--ui-effect-border-5, #f59e0b),
        var(--ui-effect-border-1, #22d3ee)
      ) !important;
    background-origin: border-box !important;
    background-clip: padding-box, border-box !important;
    background-size: 100% 100%, 300% 100% !important;
    animation: ui-studio-effect-border-spin var(--ui-effect-border-speed, 2.8s) linear infinite;
  }`);
        }

        if (usesRippleFillEffect) {
            motionUtilityBlocks.push(`  .ui-studio-effect-ripple-fill {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-ripple-fill::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    transform: translate(-50%, -50%) scale(0);
    background: var(--ui-motion-ripple-color, #0f172a);
    opacity: 0.86;
    pointer-events: none;
    transition: transform var(--ui-effect-ripple-speed, 0.5s) ease;
    z-index: 0;
  }

  .ui-studio-effect-ripple-fill > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-ripple-fill:hover::before {
    transform: translate(-50%, -50%) scale(34);
  }`);
        }

        if (usesSweepEffect) {
            motionUtilityBlocks.push(`  .ui-studio-effect-sweep {
    position: relative;
    overflow: hidden;
    isolation: isolate;
  }

  .ui-studio-effect-sweep::after {
    content: '';
    position: absolute;
    top: -8%;
    left: calc(50% - (var(--ui-effect-sweep-width, 22%) / 2));
    width: var(--ui-effect-sweep-width, 22%);
    height: 116%;
    background: linear-gradient(
      100deg,
      rgba(255, 255, 255, 0) 0%,
      color-mix(in srgb, var(--ui-effect-sweep-color, #ffffff) 82%, transparent) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
    pointer-events: none;
    z-index: 0;
  }

  .ui-studio-effect-sweep > * {
    position: relative;
    z-index: 1;
  }

  .ui-studio-effect-sweep-state-default::after,
  .ui-studio-effect-sweep-state-hover:hover::after,
  .ui-studio-effect-sweep-state-active:active::after,
  .ui-studio-effect-sweep-state-disabled:disabled::after,
  .ui-studio-effect-sweep-state-disabled[data-disabled='true']::after,
  .ui-studio-effect-sweep-state-disabled[aria-disabled='true']::after {
    animation: ui-studio-effect-sweep-pass var(--ui-effect-sweep-speed, 1.6s) ease-in-out infinite;
  }`);
        }

        const motionKeyframes: string[] = [];
        if (usesRainbowMotion) {
            motionKeyframes.push(`@keyframes ui-studio-rainbow-shift {
  0% { background-position: 0% 0%, 0% 0%; }
  100% { background-position: 0% 0%, 300% 0%; }
}`);
        }
        if (usesShimmerMotion) {
            motionKeyframes.push(`@keyframes ui-studio-shimmer-sweep {
  0% { background-position: 180% 0; }
  100% { background-position: -180% 0; }
}`);
        }
        if (usesAnimatedBorderEffect) {
            motionKeyframes.push(`@keyframes ui-studio-effect-border-spin {
  0% { background-position: 0 0, 0% 0; }
  100% { background-position: 0 0, 300% 0; }
}`);
        }
        if (usesSweepEffect) {
            motionKeyframes.push(`@keyframes ui-studio-effect-sweep-pass {
  0% { transform: translateX(-160%); opacity: 0; }
  20% { opacity: var(--ui-effect-sweep-opacity, 0.4); }
  100% { transform: translateX(160%); opacity: 0; }
}`);
        }

        return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
${[...activeVarLines, ...sizeLines].join('\n')}
}

.dark {
${activeVarLines.join('\n')}
}

@theme inline {
${themeInlineLines.join('\n')}
}

@layer utilities {
  .ui-studio-button-state:hover {
    background: var(--ui-btn-hover-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-hover-bg);
    color: var(--ui-btn-hover-fg) !important;
    border-color: var(--ui-btn-hover-border) !important;
    border-width: var(--ui-btn-hover-border-width) !important;
    font-size: var(--ui-btn-hover-font-size) !important;
    font-weight: var(--ui-btn-hover-font-weight) !important;
    justify-content: var(--ui-btn-hover-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-state:active {
    background: var(--ui-btn-active-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-active-bg);
    color: var(--ui-btn-active-fg) !important;
    border-color: var(--ui-btn-active-border) !important;
    border-width: var(--ui-btn-active-border-width) !important;
    font-size: var(--ui-btn-active-font-size) !important;
    font-weight: var(--ui-btn-active-font-weight) !important;
    justify-content: var(--ui-btn-active-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-state:disabled,
  .ui-studio-button-state[data-disabled='true'],
  .ui-studio-button-state[aria-disabled='true'] {
    background: var(--ui-btn-disabled-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-disabled-bg);
    color: var(--ui-btn-disabled-fg) !important;
    border-color: var(--ui-btn-disabled-border) !important;
    border-width: var(--ui-btn-disabled-border-width) !important;
    font-size: var(--ui-btn-disabled-font-size) !important;
    font-weight: var(--ui-btn-disabled-font-weight) !important;
    justify-content: var(--ui-btn-disabled-justify) !important;
    border-style: solid !important;
    opacity: 1 !important;
  }

  .ui-studio-button-preview-hover {
    background: var(--ui-btn-hover-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-hover-bg);
    color: var(--ui-btn-hover-fg) !important;
    border-color: var(--ui-btn-hover-border) !important;
    border-width: var(--ui-btn-hover-border-width) !important;
    font-size: var(--ui-btn-hover-font-size) !important;
    font-weight: var(--ui-btn-hover-font-weight) !important;
    justify-content: var(--ui-btn-hover-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-preview-active {
    background: var(--ui-btn-active-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-active-bg);
    color: var(--ui-btn-active-fg) !important;
    border-color: var(--ui-btn-active-border) !important;
    border-width: var(--ui-btn-active-border-width) !important;
    font-size: var(--ui-btn-active-font-size) !important;
    font-weight: var(--ui-btn-active-font-weight) !important;
    justify-content: var(--ui-btn-active-justify) !important;
    border-style: solid !important;
  }

  .ui-studio-button-preview-disabled {
    background: var(--ui-btn-disabled-bg) !important;
    --ui-animated-border-fill: var(--ui-btn-disabled-bg);
    color: var(--ui-btn-disabled-fg) !important;
    border-color: var(--ui-btn-disabled-border) !important;
    border-width: var(--ui-btn-disabled-border-width) !important;
    font-size: var(--ui-btn-disabled-font-size) !important;
    font-weight: var(--ui-btn-disabled-font-weight) !important;
    justify-content: var(--ui-btn-disabled-justify) !important;
    border-style: solid !important;
    opacity: 1 !important;
  }
${motionUtilityBlocks.length > 0 ? `\n${motionUtilityBlocks.join('\n\n')}\n` : ''}
}
${motionKeyframes.length > 0 ? `\n${motionKeyframes.join('\n\n')}\n` : ''}
${additionalThemeBlocks ? `\n/* Optional alternate saved token sets */\n${additionalThemeBlocks}\n` : ''}`;
    };

    const applyPresetToSelected = (preset: StylePreset) => {
        if (!selectedInstanceId) {
            return;
        }

        setInstances((current) =>
            current.map((instance) =>
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
                                : {
                                    ...mergedStyle,
                                    motionEntryEnabled: false,
                                },
                        };
                    })()
                    : instance,
            ),
        );
    };

    const applyMotionComponentPreset = (presetId: string) => {
        if (!selectedInstanceId || !selectedInstance) {
            return;
        }

        const preset = getMotionComponentPresets(selectedInstance.kind).find((item) => item.id === presetId);
        if (!preset) {
            return;
        }

        setInstances((current) =>
            current.map((instance) =>
                instance.id === selectedInstanceId
                    ? {
                        ...instance,
                        style: supportsEntryMotion(instance.kind) ? {
                            ...instance.style,
                            ...preset.values,
                        } : {
                            ...instance.style,
                            ...preset.values,
                            motionEntryEnabled: false,
                        },
                    }
                    : instance,
            ),
        );
    };

    const syncBaseStateStyles = (kind: UIComponentKind, style: ComponentStyleConfig): ComponentStyleConfig => {
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
    };

    const applyComponentVisualPreset = (presetId: string) => {
        if (!selectedInstanceId || !selectedInstance) {
            return;
        }

        const preset = getComponentVisualPreset(selectedInstance.kind, presetId);
        if (!preset) {
            return;
        }

        setInstances((current) =>
            current.map((instance) =>
                instance.id === selectedInstanceId ? (() => {
                    const mergedStyle: ComponentStyleConfig = {
                        ...instance.style,
                        ...preset.values,
                        componentPreset: preset.id,
                        motionPreset: preset.autoMotionPreset ?? (preset.id.startsWith('motion-') ? instance.style.motionPreset : 'none'),
                    };
                    return {
                        ...instance,
                        style: syncBaseStateStyles(instance.kind, mergedStyle),
                    };
                })() : instance,
            ),
        );
    };

    const clearVisualMotionPreset = () => {
        applyComponentVisualPreset('default');
    };

    const createUserTokenSet = (name: string) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const nextSet: StudioTokenSet = {
            id: createTokenSetId(trimmedName),
            name: trimmedName,
            source: 'user',
            tokens: activeTokenSet.tokens.map((token) => ({
                id: token.id,
                label: token.label,
                value: resolveTokenToHex(token) ?? token.value ?? '#000000',
            })),
            sizeTokens: {
                sm: { ...activeTokenSet.sizeTokens.sm },
                md: { ...activeTokenSet.sizeTokens.md },
                lg: { ...activeTokenSet.sizeTokens.lg },
            },
        };
        setTokenSets((current) => ensureTokenSetsWithSystem([...current.filter((set) => set.id !== nextSet.id), nextSet]));
        setActiveTokenSetId(nextSet.id);
        setTokenSyncMessage('New token set created locally. Save to Neon to persist across sessions.');
        setNewSetName('');
        setShowNewSetInput(false);
    };

    const updateActiveTokenValue = (tokenId: string, value: string) => {
        const normalized = normalizeHexColor(value);
        if (!normalized || activeTokenSet.source !== 'user') {
            return;
        }
        setTokenSets((current) =>
            current.map((set) =>
                set.id === activeTokenSet.id
                    ? {
                        ...set,
                        tokens: set.tokens.map((token) =>
                            token.id === tokenId
                                ? {
                                    ...token,
                                    value: normalized,
                                    cssVar: undefined,
                                }
                                : token,
                        ),
                    }
                    : set,
            ),
        );
    };

    const updateActiveSizeToken = (size: StudioSizeTokenKey, field: 'height' | 'width', value: number) => {
        if (activeTokenSet.source !== 'user') {
            return;
        }
        const sanitized = Math.max(0, Math.min(640, Math.round(value)));
        setTokenSets((current) =>
            current.map((set) => {
                if (set.id !== activeTokenSet.id) {
                    return set;
                }
                const currentSize = set.sizeTokens[size];
                if (field === 'width') {
                    return {
                        ...set,
                        sizeTokens: {
                            ...set.sizeTokens,
                            [size]: sanitized > 0 ? { ...currentSize, width: sanitized } : { height: currentSize.height },
                        },
                    };
                }
                return {
                    ...set,
                    sizeTokens: {
                        ...set.sizeTokens,
                        [size]: {
                            ...currentSize,
                            height: sanitized,
                        },
                    },
                };
            }),
        );
    };

    const addTokenToActiveSet = (id: string, label: string, hex: string) => {
        if (activeTokenSet.source !== 'user') {
            setTokenSyncMessage('Duplicate the system token set before editing tokens.');
            return;
        }
        const value = normalizeHexColor(hex);
        if (!value || !id.trim() || !label.trim()) return;
        setTokenSets((current) =>
            current.map((set) =>
                set.id === activeTokenSet.id
                    ? { ...set, tokens: [...set.tokens.filter((t) => t.id !== id.trim()), { id: id.trim(), label: label.trim(), value }] }
                    : set,
            ),
        );
        setNewTokenForm(null);
    };

    const removeTokenFromActiveSet = (tokenId: string) => {
        if (activeTokenSet.source !== 'user') {
            return;
        }
        setTokenSets((current) =>
            current.map((set) =>
                set.id === activeTokenSet.id
                    ? {
                        ...set,
                        tokens: set.tokens.filter((token) => token.id !== tokenId),
                    }
                    : set,
            ),
        );
    };

    const saveActiveTokenSetToNeon = async () => {
        if (activeTokenSet.source !== 'user') {
            setTokenSyncMessage('System token set is read-only. Duplicate it first.');
            return;
        }
        setTokensLoading(true);
        try {
            const saved = await upsertTokenSetToApi(activeTokenSet);
            const sanitized = sanitizeTokenSet(saved);
            if (sanitized) {
                setTokenSets((current) =>
                    ensureTokenSetsWithSystem(
                        current.map((set) =>
                            set.id === sanitized.id
                                ? {
                                    ...sanitized,
                                    source: 'user',
                                }
                                : set,
                        ),
                    ),
                );
            }
            setTokenSyncMessage('Token set saved to Neon.');
        } catch {
            setTokenSyncMessage('Could not save token set to Neon. Check your session and database configuration.');
        } finally {
            setTokensLoading(false);
        }
    };

    const deleteActiveTokenSetFromNeon = async () => {
        if (activeTokenSet.source !== 'user') {
            return;
        }
        if (!window.confirm(`Delete token set "${activeTokenSet.name}"?`)) {
            return;
        }
        setTokensLoading(true);
        try {
            await deleteTokenSetFromApi(activeTokenSet.id);
            setTokenSets((current) => ensureTokenSetsWithSystem(current.filter((set) => set.id !== activeTokenSet.id)));
            setActiveTokenSetId(SYSTEM_TOKEN_SET_ID);
            setTokenSyncMessage('Token set deleted from Neon.');
        } catch {
            setTokenSyncMessage('Could not delete token set from Neon.');
        } finally {
            setTokensLoading(false);
        }
    };

    const copyCode = async (snippet: string) => {
        try {
            await navigator.clipboard.writeText(snippet);
            setCopiedCode(true);
            window.setTimeout(() => setCopiedCode(false), 1200);
        } catch {
            const area = document.createElement('textarea');
            area.value = snippet;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
            setCopiedCode(true);
            window.setTimeout(() => setCopiedCode(false), 1200);
        }
    };

    const exportCode = (filename: string, snippet: string) => {
        downloadSnippetFile(filename, snippet);
        setExportedCode(true);
        window.setTimeout(() => setExportedCode(false), 1200);
    };

    const duplicateSelected = () => {
        if (!selectedInstance) {
            return;
        }
        duplicateInstance(selectedInstance.id);
    };

    const resetSelectedStyle = () => {
        if (!selectedInstanceId) {
            return;
        }
        setInstances((current) =>
            current.map((instance) =>
                instance.id === selectedInstanceId
                    ? {
                        ...instance,
                        style: { ...DEFAULT_STYLE },
                    }
                    : instance,
            ),
        );
    };

    const activeSnippetSource = selectedInstance;
    const activePreviewInstance =
        selectedInstance && debouncedPreviewInstance?.id === selectedInstance.id ? debouncedPreviewInstance : selectedInstance;
    const activePreview = activePreviewInstance ? buildPreviewPresentation(activePreviewInstance) : null;
    const activeSnippet = activeSnippetSource ? buildSnippetForInstance(activeSnippetSource) : '// Select a variant to generate code.';
    const activeNamedSnippet = activeSnippetSource ? buildNamedSnippetForInstance(activeSnippetSource) : '// Select a variant to generate a named component.';
    const allExportsSnippet = buildMultiVariantBundle(instances);
    const tailwindThemeSnippet = buildTailwindThemeStyles();

    const activeCodeSnippet =
        codePanelTab === 'snippet'
            ? activeSnippet
            : codePanelTab === 'named'
                ? activeNamedSnippet
                : codePanelTab === 'theme'
                    ? tailwindThemeSnippet
                    : allExportsSnippet;
    const styleModeSuffix = exportStyleMode === 'tailwind' ? '-tailwind' : '';
    const activeCodeFilename =
        codePanelTab === 'snippet'
            ? `ui-studio-${sanitizeFileSegment(activeKind)}-${sanitizeFileSegment(activeSnippetSource?.name ?? 'variant')}${styleModeSuffix}.tsx`
            : codePanelTab === 'named'
                ? `${activeSnippetSource ? buildExportComponentName(activeSnippetSource) : `${toPascalCase(activeKind)}Variant`}${styleModeSuffix}.tsx`
                : codePanelTab === 'theme'
                    ? 'ui-studio.theme.css'
                    : 'ui-studio-design-bundle.json';

    const startRenameVariant = (instance: ComponentInstance) => {
        setEditingVariantId(instance.id);
        setEditingVariantName(instance.name);
    };

    const commitRenameVariant = (instanceId: string) => {
        const trimmed = editingVariantName.trim();
        if (trimmed.length > 0) {
            updateInstanceName(instanceId, trimmed);
        }
        setEditingVariantId(null);
        setEditingVariantName('');
    };

    const buttonStateOptions: Array<{ value: ButtonPreviewState; label: string }> = [
        { value: 'default', label: 'Default' },
        { value: 'hover', label: 'Hover' },
        { value: 'active', label: 'Active' },
        { value: 'disabled', label: 'Disabled' },
    ];

    const effectOptions = selectedStyle
        ? [
            { id: 'drop-shadow', label: 'Drop Shadow', enabled: selectedStyle.effectDropShadow, supported: true },
            { id: 'inner-shadow', label: 'Inner Shadow', enabled: selectedStyle.effectInnerShadow, supported: true },
            { id: 'background-blur', label: 'Background Blur', enabled: selectedStyle.effectBlur, supported: true },
            { id: 'glass-tint', label: 'Glass Tint', enabled: selectedStyle.effectGlass, supported: true },
            { id: 'gradient-slide', label: 'Gradient Slide', enabled: selectedStyle.effectGradientSlideEnabled, supported: supportsGradientSlide },
            { id: 'animated-border', label: hasPanelElementControls ? 'Animated Border (Trigger)' : 'Animated Border', enabled: selectedStyle.effectAnimatedBorderEnabled, supported: supportsAnimatedBorder },
            { id: 'ripple-fill', label: 'Ripple Fill (Hover)', enabled: selectedStyle.effectRippleFillEnabled, supported: supportsRippleFill },
            { id: 'loading-state', label: 'Loading State Icon', enabled: selectedStyle.effectLoadingActiveEnabled, supported: supportsLoadingState },
            { id: 'sweep', label: 'Sweep Animation', enabled: selectedStyle.effectSweepEnabled, supported: supportsSweep },
        ].filter((item) => item.supported)
        : [];
    const inactiveEffectOptions = effectOptions.filter((item) => !item.enabled);

    useEffect(() => {
        if (!effectsBuilderOpen) {
            return;
        }

        if (!pendingEffectId || !inactiveEffectOptions.some((option) => option.id === pendingEffectId)) {
            setPendingEffectId(inactiveEffectOptions[0]?.id ?? null);
        }
    }, [effectsBuilderOpen, inactiveEffectOptions, pendingEffectId]);

    const setEffectEnabled = (
        effectId: 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep',
        enabled: boolean,
    ) => {
        switch (effectId) {
            case 'drop-shadow':
                updateSelectedStyle('effectDropShadow', enabled);
                break;
            case 'inner-shadow':
                updateSelectedStyle('effectInnerShadow', enabled);
                break;
            case 'background-blur':
                updateSelectedStyle('effectBlur', enabled);
                break;
            case 'glass-tint':
                updateSelectedStyle('effectGlass', enabled);
                break;
            case 'gradient-slide':
                updateSelectedStyle('effectGradientSlideEnabled', enabled);
                break;
            case 'animated-border':
                updateSelectedStyle('effectAnimatedBorderEnabled', enabled);
                break;
            case 'ripple-fill':
                updateSelectedStyle('effectRippleFillEnabled', enabled);
                break;
            case 'loading-state':
                updateSelectedStyle('effectLoadingActiveEnabled', enabled);
                break;
            case 'sweep':
                updateSelectedStyle('effectSweepEnabled', enabled);
                break;
        }
    };

    const renderEffectStateSelect = (effectId: 'animated-border' | 'sweep') => {
        if (!selectedStyle) {
            return null;
        }

        const optionKeys = effectId === 'animated-border'
            ? [
                { label: 'Default', key: 'effectAnimatedBorderStateDefault' as const },
                { label: 'Hover', key: 'effectAnimatedBorderStateHover' as const },
                { label: 'Active', key: 'effectAnimatedBorderStateActive' as const },
                { label: 'Disabled', key: 'effectAnimatedBorderStateDisabled' as const },
            ]
            : [
                { label: 'Default', key: 'effectSweepStateDefault' as const },
                { label: 'Hover', key: 'effectSweepStateHover' as const },
                { label: 'Active', key: 'effectSweepStateActive' as const },
                { label: 'Disabled', key: 'effectSweepStateDisabled' as const },
            ];
        const activeLabels = optionKeys.filter((option) => selectedStyle[option.key]).map((option) => option.label);

        return (
            <FlatField label="States" stacked>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="ui-studio-inspector-input inline-flex h-6 w-full items-center justify-between gap-2 rounded-sm border-[var(--inspector-border-soft)] bg-[#0c121d] px-2 text-[12px] font-medium text-[var(--inspector-text)]"
                        >
                            <span className="min-w-0 truncate text-left">
                                {activeLabels.length > 0 ? activeLabels.join(', ') : 'No states'}
                            </span>
                            <ChevronDown className="size-3.5 shrink-0 text-[var(--inspector-muted-text)]" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        side="left"
                        align="start"
                        sideOffset={10}
                        className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-2 text-[var(--inspector-text)]"
                    >
                        <div className="space-y-1">
                            {optionKeys.map((option) => {
                                const checked = selectedStyle[option.key];
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => updateSelectedStyle(option.key, !checked)}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[12px] font-medium transition',
                                            checked
                                                ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                : 'text-[var(--inspector-muted-text)] hover:bg-white/[0.04] hover:text-[var(--inspector-text)]',
                                        )}
                                    >
                                        <Check className={cn('size-3.5 shrink-0', checked ? 'opacity-100' : 'opacity-0')} />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            </FlatField>
        );
    };

    const renderEffectConfigurator = (
        effectId: 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep',
    ) => {
        if (!selectedStyle || !selectedInstance) {
            return null;
        }

        switch (effectId) {
            case 'drop-shadow':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <MiniNumberField
                            label="Distance"
                            value={Math.max(0, selectedStyle.dropShadowY)}
                            min={0}
                            max={80}
                            onChange={(value) => updateSelectedStyles({ dropShadowStrength: value, dropShadowY: value })}
                        />
                        <MiniNumberField label="X" value={selectedStyle.dropShadowX} min={-80} max={80} onChange={(value) => updateSelectedStyle('dropShadowX', value)} />
                        <MiniNumberField label="Blur" value={selectedStyle.dropShadowBlur} min={0} max={80} onChange={(value) => updateSelectedStyle('dropShadowBlur', value)} />
                        <MiniNumberField label="Spread" value={selectedStyle.dropShadowSpread} min={-40} max={40} onChange={(value) => updateSelectedStyle('dropShadowSpread', value)} />
                    </div>
                );
            case 'inner-shadow':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <MiniNumberField label="X" value={selectedStyle.innerShadowX} min={-80} max={80} onChange={(value) => updateSelectedStyle('innerShadowX', value)} />
                        <MiniNumberField label="Y" value={selectedStyle.innerShadowY} min={-80} max={80} onChange={(value) => updateSelectedStyle('innerShadowY', value)} />
                        <MiniNumberField label="Blur" value={selectedStyle.innerShadowBlur} min={0} max={80} onChange={(value) => updateSelectedStyle('innerShadowBlur', value)} />
                        <MiniNumberField label="Spread" value={selectedStyle.innerShadowSpread} min={-40} max={40} onChange={(value) => updateSelectedStyle('innerShadowSpread', value)} />
                    </div>
                );
            case 'background-blur':
                return <MiniNumberField label="Amount" value={selectedStyle.blurAmount} min={0} max={30} unit="px" onChange={(value) => updateSelectedStyle('blurAmount', value)} />;
            case 'glass-tint':
                return <MiniNumberField label="Opacity" value={selectedStyle.glassOpacity} min={0} max={100} unit="%" onChange={(value) => updateSelectedStyle('glassOpacity', value)} />;
            case 'gradient-slide':
                return (
                    <div className="space-y-3">
                        <FlatField label="Direction" stacked>
                            <FlatSelect
                                value={selectedStyle.effectGradientSlideDirection}
                                onValueChange={(value) => updateSelectedStyle('effectGradientSlideDirection', value as ComponentStyleConfig['effectGradientSlideDirection'])}
                            >
                                <option value="left">Left → Right</option>
                                <option value="right">Right → Left</option>
                                <option value="top">Top → Bottom</option>
                                <option value="bottom">Bottom → Top</option>
                            </FlatSelect>
                        </FlatField>
                        <FlatColorControl
                            label="Slide Color"
                            value={selectedStyle.effectGradientSlideColor}
                            onChange={(value) => updateSelectedStyle('effectGradientSlideColor', value)}
                            tokens={activeTokenSet.tokens}
                            allowGradient
                            mode={selectedStyle.effectGradientSlideFillMode}
                            onModeChange={(mode) => updateSelectedStyle('effectGradientSlideFillMode', mode)}
                            secondaryValue={selectedStyle.effectGradientSlideColorTo}
                            onSecondaryChange={(value) => updateSelectedStyle('effectGradientSlideColorTo', value)}
                        />
                        <FlatUnitField
                            label="Motion Speed"
                            value={selectedStyle.effectGradientSlideSpeed}
                            min={0.1}
                            max={2}
                            step={0.05}
                            unit="s"
                            onChange={(value) => updateSelectedStyle('effectGradientSlideSpeed', value)}
                        />
                    </div>
                );
            case 'animated-border':
                return (
                    <div className="space-y-3">
                        <FlatUnitField
                            label="Preset Speed"
                            value={selectedStyle.effectAnimatedBorderSpeed}
                            min={0.6}
                            max={8}
                            step={0.1}
                            unit="s"
                            onChange={(value) => updateSelectedStyle('effectAnimatedBorderSpeed', value)}
                        />
                        <FlatField label="Color Count" stacked>
                            <FlatSelect
                                value={selectedStyle.effectAnimatedBorderColorCount}
                                onValueChange={(value) => updateSelectedStyle('effectAnimatedBorderColorCount', Math.max(2, Math.min(5, Number(value))))}
                            >
                                {[2, 3, 4, 5].map((count) => (
                                    <option key={count} value={count}>
                                        {count}
                                    </option>
                                ))}
                            </FlatSelect>
                        </FlatField>
                        <FlatColorControl label="Color 1" value={selectedStyle.effectAnimatedBorderColor1} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor1', value)} tokens={activeTokenSet.tokens} />
                        <FlatColorControl label="Color 2" value={selectedStyle.effectAnimatedBorderColor2} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor2', value)} tokens={activeTokenSet.tokens} />
                        {selectedStyle.effectAnimatedBorderColorCount >= 3 ? <FlatColorControl label="Color 3" value={selectedStyle.effectAnimatedBorderColor3} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor3', value)} tokens={activeTokenSet.tokens} /> : null}
                        {selectedStyle.effectAnimatedBorderColorCount >= 4 ? <FlatColorControl label="Color 4" value={selectedStyle.effectAnimatedBorderColor4} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor4', value)} tokens={activeTokenSet.tokens} /> : null}
                        {selectedStyle.effectAnimatedBorderColorCount >= 5 ? <FlatColorControl label="Color 5" value={selectedStyle.effectAnimatedBorderColor5} onChange={(value) => updateSelectedStyle('effectAnimatedBorderColor5', value)} tokens={activeTokenSet.tokens} /> : null}
                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Border width is linked to Stroke Width.</p>
                        {renderEffectStateSelect('animated-border')}
                    </div>
                );
            case 'ripple-fill':
                return (
                    <div className="space-y-3">
                        <FlatColorControl
                            label="Ripple Color"
                            value={selectedStyle.effectRippleFillColor}
                            onChange={(value) => updateSelectedStyle('effectRippleFillColor', value)}
                            tokens={activeTokenSet.tokens}
                        />
                        <FlatUnitField
                            label="Fill Speed"
                            value={selectedStyle.effectRippleFillSpeed}
                            min={0.2}
                            max={1.8}
                            step={0.05}
                            unit="s"
                            onChange={(value) => updateSelectedStyle('effectRippleFillSpeed', value)}
                        />
                    </div>
                );
            case 'loading-state':
                return (
                    <div className="space-y-3">
                        <FlatField label="Icon Position" stacked>
                            <FlatSelect
                                value={selectedStyle.effectLoadingPosition}
                                onValueChange={(value) => updateSelectedStyle('effectLoadingPosition', value as 'left' | 'right')}
                            >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </FlatSelect>
                        </FlatField>
                        <FlatField label="Outcome Icon" stacked>
                            <FlatSelect
                                value={selectedStyle.effectLoadingOutcome}
                                onValueChange={(value) => updateSelectedStyle('effectLoadingOutcome', value as ComponentStyleConfig['effectLoadingOutcome'])}
                            >
                                <option value="success">Success</option>
                                <option value="failure">Failure</option>
                                <option value="warning">Warning</option>
                            </FlatSelect>
                        </FlatField>
                        {selectedInstance.kind === 'badge' ? (
                            <FlatSwitchRow
                                label="Show in Default State"
                                checked={selectedStyle.effectLoadingBadgeDefaultEnabled}
                                onCheckedChange={(checked) => updateSelectedStyle('effectLoadingBadgeDefaultEnabled', checked)}
                            />
                        ) : null}
                    </div>
                );
            case 'sweep':
                return (
                    <div className="space-y-3">
                        <FlatColorControl
                            label="Sweep Color"
                            value={selectedStyle.effectSweepColor}
                            opacity={selectedStyle.effectSweepOpacity}
                            onOpacityChange={(value) => updateSelectedStyle('effectSweepOpacity', value)}
                            onChange={(value) => updateSelectedStyle('effectSweepColor', value)}
                            tokens={activeTokenSet.tokens}
                        />
                        <FlatUnitField
                            label="Sweep Width"
                            value={selectedStyle.effectSweepWidth}
                            min={8}
                            max={60}
                            unit="%"
                            onChange={(value) => updateSelectedStyle('effectSweepWidth', value)}
                        />
                        <FlatUnitField
                            label="Sweep Speed"
                            value={selectedStyle.effectSweepSpeed}
                            min={0.4}
                            max={4}
                            step={0.1}
                            unit="s"
                            onChange={(value) => updateSelectedStyle('effectSweepSpeed', value)}
                        />
                        {renderEffectStateSelect('sweep')}
                    </div>
                );
        }
    };

    const getButtonStateValues = (state: ButtonPreviewState) => {
        if (!selectedStyle || !selectedInstance || !supportsButtonStateStyle(selectedInstance.kind)) {
            return null;
        }
        const keys = BUTTON_STATE_FIELD_KEYS[state];
        return {
            fillMode: selectedStyle[keys.fillMode] as FillMode,
            fillColor: selectedStyle[keys.fillColor] as string,
            fillColorTo: selectedStyle[keys.fillColorTo] as string,
            fillWeight: selectedStyle[keys.fillWeight] as number,
            fillOpacity: selectedStyle[keys.fillOpacity] as number,
            fontSize: selectedStyle[keys.fontSize] as number,
            fontWeight: selectedStyle[keys.fontWeight] as number,
            fontPosition: selectedStyle[keys.fontPosition] as FontPosition,
            fontColor: selectedStyle[keys.fontColor] as string,
            fontOpacity: selectedStyle[keys.fontOpacity] as number,
            strokeColor: selectedStyle[keys.strokeColor] as string,
            strokeOpacity: selectedStyle[keys.strokeOpacity] as number,
            strokeWeight: selectedStyle[keys.strokeWeight] as number,
        };
    };

    const updateButtonStateValue = (
        state: ButtonPreviewState,
        field: ButtonStateField,
        value: string | number | FillMode,
    ) => {
        const key = BUTTON_STATE_FIELD_KEYS[state][field] as keyof ComponentStyleConfig;
        updateSelectedStyle(key, value as never);
    };

    const currentAppearanceValues = selectedStyle
        ? usesStateAppearanceControls
            ? getButtonStateValues(selectedStyle.buttonPreviewState)
            : {
                fillMode: selectedStyle.fillMode,
                fillColor: selectedStyle.fillColor,
                fillColorTo: selectedStyle.fillColorTo,
                fillWeight: selectedStyle.fillWeight,
                fillOpacity: selectedStyle.fillOpacity,
                fontSize: selectedStyle.fontSize,
                fontWeight: selectedStyle.fontWeight,
                fontPosition: selectedStyle.fontPosition,
                fontColor: selectedStyle.fontColor,
                fontOpacity: selectedStyle.fontOpacity,
                strokeColor: selectedStyle.strokeColor,
                strokeOpacity: selectedStyle.strokeOpacity,
                strokeWeight: selectedStyle.strokeWeight,
            }
        : null;

    const updateAppearanceField = (
        field: ButtonStateField,
        value: string | number | FillMode,
    ) => {
        if (!selectedStyle) {
            return;
        }

        if (usesStateAppearanceControls) {
            updateButtonStateValue(selectedStyle.buttonPreviewState, field, value);
            return;
        }

        const key = BUTTON_STATE_FIELD_KEYS.default[field] as keyof ComponentStyleConfig;
        updateSelectedStyle(key, value as never);
    };

    const previewStateSource = activePreviewInstance ?? selectedInstance ?? null;
    const stagePreviewInstance =
        previewStateSource && usesStateAppearanceControls
            ? {
                ...previewStateSource,
                style: {
                    ...previewStateSource.style,
                    buttonPreviewState: 'default' as ButtonPreviewState,
                },
            }
            : previewStateSource;
    const stagePreview = stagePreviewInstance ? buildPreviewPresentation(stagePreviewInstance) : activePreview;
    const statePreviewItems =
        previewStateSource && usesStateAppearanceControls
            ? buttonStateOptions.map((state) => {
                const instanceForState: ComponentInstance = {
                    ...previewStateSource,
                    style: {
                        ...previewStateSource.style,
                        buttonPreviewState: state.value,
                    },
                };

                return {
                    ...state,
                    instance: instanceForState,
                    preview: buildPreviewPresentation(instanceForState),
                };
            })
            : [];

    const canvasBackground = canvasTheme === 'dark' ? '#101a2d' : '#f3f7ff';
    const canvasDotColor = canvasTheme === 'dark' ? 'rgba(126, 255, 237, 0.09)' : 'rgba(31, 56, 94, 0.16)';
    const studioActionButtonClass =
        'inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-[#b7c8df] transition hover:bg-white/[0.1] hover:text-[#eef5ff]';
    const studioAccentButtonClass =
        'inline-flex items-center gap-1.5 rounded-lg bg-[#63e8da]/16 px-2.5 py-1.5 text-[11px] font-semibold text-[#7efef0] shadow-[inset_0_0_0_1px_rgba(126,254,240,0.34)] transition hover:bg-[#63e8da]/28';
    const studioInputClass =
        'h-8 w-full rounded-lg bg-[#0e182a] px-2.5 text-[11px] text-[#e6f0ff] outline-none ring-1 ring-inset ring-white/12 transition placeholder:text-[#5f7597] focus:ring-[#63e8da]/45';
    const studioSectionTitleClass = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8da4c3]';
    const inspectorControlClass = 'ui-studio-inspector-input h-8 w-full rounded-lg px-2 text-xs text-[var(--inspector-text)]';
    const inspectorChoiceButtonBase = 'h-6 flex-1 rounded-sm px-2.5 text-[13px] font-medium transition-colors';
    const inspectorChoiceButtonActive = 'bg-white/[0.10] text-[#eef5ff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]';
    const inspectorChoiceButtonIdle = 'text-[#7f8ca3] hover:bg-white/[0.03] hover:text-[#dfe7f5]';
    const inspectorIconChoiceButtonBase = 'inline-flex h-7 flex-1 items-center justify-center rounded-lg transition-colors';
    const inspectorJourneyHint: Record<InspectorTab, string> = {
        style: 'Start with essentials, then refine appearance and content.',
        interaction: 'Shape state behavior first, then tune motion.',
        behavior: 'Configure primitive-level runtime options.',
    };
    const inspectorTabLabels: Record<InspectorTab, string> = {
        style: 'Style',
        interaction: 'Interaction',
        behavior: 'Runtime',
    };

    return (
        <div className="ui-studio-shell min-h-dvh text-[#e6f0ff]" data-studio-theme={studioTheme}>
            <div className="relative min-h-dvh xl:h-dvh">
                <div className="grid min-h-dvh grid-cols-1 xl:h-full xl:grid-cols-[280px_minmax(0,1fr)_minmax(360px,280px)]">
                    <aside className="ui-studio-sidebar flex min-h-0 flex-col overflow-hidden bg-[rgba(8,14,25,0.76)] backdrop-blur-xl xl:border-r xl:border-white/8">
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setProfileMenuOpen((current) => !current)}
                                    className="group flex w-full items-center gap-3 rounded-lg px-1.5 py-2 text-left transition hover:bg-white/[0.04]"
                                >
                                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#63e8da]/16 text-sm font-semibold text-[#7efef0] overflow-hidden">
                                        {user?.avatar_url
                                            ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            : (user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() ?? 'UI')
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[#f0f6ff]">{user?.name ?? 'My Account'}</p>
                                        <p className="truncate text-[11px] text-[#8da4c3]">{user?.email ?? 'Designer'}</p>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            'ml-auto size-4 text-[#8da4c3] transition-transform duration-200 group-hover:text-[#dbe8fb]',
                                            profileMenuOpen && 'rotate-180',
                                        )}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {profileMenuOpen ? (
                                        <motion.nav
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-2 space-y-0.5 text-[13px] text-[#c7d6eb]">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileMenuOpen(false);
                                                        navigate('/projects');
                                                    }}
                                                    className="flex h-7 w-full items-center gap-2.5 rounded-md px-2 transition hover:bg-white/[0.05]"
                                                >
                                                    <Home className="size-4 text-[#8da4c3]" />
                                                    Home
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setInspectorTab('style');
                                                        setShowTokenManager(true);
                                                        setRightSidebarTab('inspector');
                                                        setProfileMenuOpen(false);
                                                    }}
                                                    className="flex h-7 w-full items-center gap-2.5 rounded-md px-2 transition hover:bg-white/[0.05]"
                                                >
                                                    <Pencil className="size-4 text-[#8da4c3]" />
                                                    Token Sets
                                                </button>
                                                {/* Theme toggle row */}
                                                <div className="flex h-7 w-full items-center gap-2.5 rounded-md px-2">
                                                    <Config className="size-4 text-[#8da4c3]" />
                                                    <span className="flex-1 text-[13px]">Theme</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStudioTheme((t) => t === 'dark' ? 'light' : 'dark')}
                                                        className={cn(
                                                            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none',
                                                            studioTheme === 'light' ? 'bg-[#63e8da]' : 'bg-white/20',
                                                        )}
                                                        aria-label="Toggle light/dark mode"
                                                    >
                                                        <span
                                                            className={cn(
                                                                'pointer-events-none inline-flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200',
                                                                studioTheme === 'light' ? 'translate-x-4' : 'translate-x-0',
                                                            )}
                                                        >
                                                            {studioTheme === 'light'
                                                                ? <Sun className="size-2.5 text-[#0d9488]" />
                                                                : <Moon className="size-2.5 text-[#8da4c3]" />
                                                            }
                                                        </span>
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileMenuOpen(false);
                                                        navigate('/profile');
                                                    }}
                                                    className="flex h-7 w-full items-center gap-2.5 rounded-md px-2 transition hover:bg-white/[0.05]"
                                                >
                                                    <UserSettings className="size-4 text-[#8da4c3]" />
                                                    Profile
                                                </button>
                                                <div className="my-1 h-px bg-white/10" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfileMenuOpen(false);
                                                        logout();
                                                        navigate('/login');
                                                    }}
                                                    className="flex h-7 w-full items-center gap-2.5 rounded-md px-2 text-[#ff7d87] transition hover:bg-[#ff7d87]/10"
                                                >
                                                    <Power className="size-4" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.nav>
                                    ) : null}
                                </AnimatePresence>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <div>
                                    <p className={studioSectionTitleClass}>Components</p>
                                    <p className="mt-1 text-[11px] text-[#7188a8]">{instances.length} on canvas</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setComponentPickerOpen(true)}
                                    className="inline-flex size-8 items-center justify-center rounded-md text-[#b7c8df] transition hover:bg-white/[0.05] hover:text-[#eff6ff]"
                                    aria-label="Add component"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait" initial={false}>
                                {componentPickerOpen ? (
                                    <motion.div
                                        key="catalog-view"
                                        initial={{ opacity: 0, x: 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -12 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="mt-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setComponentPickerOpen(false);
                                                    setComponentPickerQuery('');
                                                }}
                                                className="rounded-md px-1.5 py-1 text-[11px] font-medium text-[#8da4c3] transition hover:bg-white/[0.05] hover:text-[#e8f1ff]"
                                            >
                                                Back
                                            </button>
                                            <p className="text-[10px] text-[#6e84a3]">Cmd/Ctrl + K</p>
                                        </div>

                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#89a2c3]" />
                                            <input
                                                ref={componentSearchRef}
                                                value={componentPickerQuery}
                                                onChange={(event) => setComponentPickerQuery(event.target.value)}
                                                placeholder="Find button, dialog, tooltip..."
                                                className={cn(studioInputClass, 'pl-8')}
                                            />
                                        </div>

                                        <div className="space-y-0.5">
                                            {filteredComponents.length > 0 ? (
                                                filteredComponents.map((item) => (
                                                    <button
                                                        key={item.kind}
                                                        type="button"
                                                        onClick={() => addInstance(item.kind)}
                                                        className={cn(
                                                            'flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition',
                                                            selectedInstance?.kind === item.kind ? 'bg-[#63e8da]/14 text-[#86fff1]' : 'hover:bg-white/[0.05]',
                                                        )}
                                                    >
                                                        <span className="text-[13px] text-[#e6f0ff]">{item.label}</span>
                                                        <span className="text-[11px] text-[#7f95b4]">{componentUsage.get(item.kind) ?? 0}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-2 py-3 text-[11px] text-[#8ba2c1]">No component matches “{componentPickerQuery}”.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="instance-view"
                                        initial={{ opacity: 0, x: -14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 12 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="mt-3 space-y-0.5"
                                    >
                                        {instances.map((instance) => {
                                            const preview = buildPreviewPresentation(instance);
                                            const isSelected = instance.id === selectedInstanceId;
                                            const isEditing = editingVariantId === instance.id;

                                            return (
                                                <Popover key={instance.id} open={instanceContextMenu === null && hoverPreviewInstanceId === instance.id} modal={false}>
                                                    <PopoverTrigger asChild>
                                                        <article
                                                            role="button"
                                                            tabIndex={0}
                                                            onMouseEnter={() => queueHoverPreview(instance.id)}
                                                            onMouseLeave={clearHoverPreview}
                                                            onClick={() => setSelectedInstanceId(instance.id)}
                                                            onContextMenu={(event) => {
                                                                clearHoverPreview();
                                                                openInstanceContextMenu(event, instance.id);
                                                            }}
                                                            onDoubleClick={() => startRenameVariant(instance)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter' || event.key === ' ') {
                                                                    event.preventDefault();
                                                                    setSelectedInstanceId(instance.id);
                                                                }
                                                            }}
                                                            className={cn(
                                                                'flex items-center gap-3 rounded-lg px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#63e8da]/45',
                                                                isSelected ? 'bg-[#12233b]' : 'hover:bg-white/[0.05]',
                                                            )}
                                                        >
                                                            <div
                                                                className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#0d182a] shadow-[inset_0_0_0_1px_rgba(143,177,217,0.14)]"
                                                                style={{
                                                                    backgroundColor: canvasBackground,
                                                                    backgroundImage: showCanvasGrid
                                                                        ? `radial-gradient(circle, ${canvasDotColor} 1px, transparent 1px)`
                                                                        : 'none',
                                                                    backgroundSize: '12px 12px',
                                                                }}
                                                            >
                                                                <div className="pointer-events-none scale-[0.58] select-none [&_*]:pointer-events-none">
                                                                    {renderWithMotionControls(
                                                                        renderPreview(instance, preview.style, preview.motionClassName),
                                                                        instance.style,
                                                                        supportsEntryMotion(instance.kind),
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                {isEditing ? (
                                                                    <input
                                                                        value={editingVariantName}
                                                                        onChange={(event) => setEditingVariantName(event.target.value)}
                                                                        onBlur={() => commitRenameVariant(instance.id)}
                                                                        onKeyDown={(event) => {
                                                                            if (event.key === 'Enter') {
                                                                                event.preventDefault();
                                                                                commitRenameVariant(instance.id);
                                                                            }
                                                                            if (event.key === 'Escape') {
                                                                                event.preventDefault();
                                                                                setEditingVariantId(null);
                                                                                setEditingVariantName('');
                                                                            }
                                                                        }}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        className={cn(studioInputClass, 'h-7')}
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    <>
                                                                        <p className="truncate text-[14px] font-medium text-[#e6f0ff]">{instance.name}</p>
                                                                        <p className="truncate text-[11px] text-[#7f95b4]">{buildKindTitle(instance.kind)}</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-[#6f87a8]">›</span>
                                                        </article>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="right"
                                                        align="start"
                                                        sideOffset={12}
                                                        className="w-[260px] border-white/10 bg-[#0f1828] p-3 text-[#eaf2ff] shadow-[0_18px_36px_rgba(2,6,15,0.48)]"
                                                    >
                                                        <PopoverHeader>
                                                            <PopoverTitle className="text-sm">{instance.name}</PopoverTitle>
                                                            <PopoverDescription className="text-xs text-[#8da4c3]">{buildKindTitle(instance.kind)} preview</PopoverDescription>
                                                        </PopoverHeader>
                                                        <div
                                                            className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-[#111c2f] shadow-[inset_0_0_0_1px_rgba(143,177,217,0.14)]"
                                                            style={{
                                                                backgroundColor: canvasBackground,
                                                                backgroundImage: showCanvasGrid
                                                                    ? `radial-gradient(circle, ${canvasDotColor} 1px, transparent 1px)`
                                                                    : 'none',
                                                                backgroundSize: '16px 16px',
                                                            }}
                                                        >
                                                            <div className="pointer-events-none scale-[0.95] select-none [&_*]:pointer-events-none">
                                                                {renderWithMotionControls(
                                                                    renderPreview(instance, preview.style, preview.motionClassName),
                                                                    instance.style,
                                                                    supportsEntryMotion(instance.kind),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </aside>

                    <div className="ui-studio-canvas-wrap relative min-h-0 p-4 xl:border-r xl:border-white/8">
                        {showTokenManager ? (
                        <section className="ui-studio-canvas flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(20,31,49,0.96),rgba(12,20,35,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_rgba(2,6,14,0.45)]">
                            {/* Token Manager header */}
                            <header className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                                <button
                                    type="button"
                                    onClick={() => setShowTokenManager(false)}
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#8da4c3] transition hover:bg-white/[0.06] hover:text-[#dbe8fb]"
                                >
                                    <Minus className="size-3 rotate-90" />
                                    Back
                                </button>
                                <div className="min-w-0 flex-1">
                                    <p className="ui-studio-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f95b4]">Token Sets</p>
                                    <p className="truncate text-xs text-[#9bb0cc]">Manage colour and size tokens saved to your account</p>
                                </div>
                                {tokensLoading && <svg className="size-4 animate-spin text-[#63e8da]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                                {tokenSyncMessage && <p className="max-w-[200px] truncate text-[11px] text-[#7f95b4]">{tokenSyncMessage}</p>}
                            </header>

                            {/* Token Manager body */}
                            <div className="flex min-h-0 flex-1 overflow-hidden">
                                {/* Left: token set list */}
                                <div className="flex w-52 shrink-0 flex-col gap-1 border-r border-white/8 overflow-y-auto px-3 py-3">
                                    <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-[#7188a8]">Sets</p>
                                    {tokenSets.map((set) => (
                                        <button
                                            key={set.id}
                                            type="button"
                                            onClick={() => setActiveTokenSetId(set.id)}
                                            className={cn(
                                                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition',
                                                set.id === activeTokenSetId
                                                    ? 'bg-[#63e8da]/12 text-[#86fff1] shadow-[inset_0_0_0_1px_rgba(126,254,240,0.2)]'
                                                    : 'text-[#9bb0cc] hover:bg-white/[0.05] hover:text-[#dbe8fb]',
                                            )}
                                        >
                                            <span className="size-2 shrink-0 rounded-full" style={{ background: resolveTokenToHex(set.tokens[0]) ?? set.tokens[0]?.value ?? '#63e8da' }} />
                                            <span className="min-w-0 truncate">{set.name}</span>
                                            {set.source === 'system' && <span className="ml-auto shrink-0 rounded px-1 text-[9px] text-[#7188a8]">system</span>}
                                        </button>
                                    ))}

                                    {/* New set input */}
                                    {showNewSetInput ? (
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); createUserTokenSet(newSetName); }}
                                            className="mt-1 flex flex-col gap-1.5"
                                        >
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Set name…"
                                                value={newSetName}
                                                onChange={(e) => setNewSetName(e.target.value)}
                                                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#63e8da]/40"
                                            />
                                            <div className="flex gap-1">
                                                <button type="submit" disabled={!newSetName.trim()} className="flex-1 rounded-md bg-[#63e8da]/20 py-1 text-[11px] font-semibold text-[#86fff1] disabled:opacity-40 hover:bg-[#63e8da]/30 transition">Create</button>
                                                <button type="button" onClick={() => { setShowNewSetInput(false); setNewSetName(''); }} className="flex-1 rounded-md bg-white/[0.06] py-1 text-[11px] text-[#8da4c3] hover:bg-white/[0.1] transition">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowNewSetInput(true)}
                                            className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#7188a8] transition hover:bg-white/[0.05] hover:text-[#9bb0cc]"
                                        >
                                            <Plus className="size-3" />
                                            New set
                                        </button>
                                    )}

                                    {/* Set actions */}
                                    {activeTokenSet.source === 'user' && (
                                        <div className="mt-auto flex flex-col gap-1 pt-3 border-t border-white/8">
                                            <button
                                                type="button"
                                                onClick={() => void saveActiveTokenSetToNeon()}
                                                disabled={tokensLoading}
                                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#63e8da]/16 px-2.5 py-2 text-xs font-semibold text-[#86fff1] transition hover:bg-[#63e8da]/24 disabled:opacity-50"
                                            >
                                                {tokensLoading ? <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Download className="size-3" />}
                                                Save to Neon
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void deleteActiveTokenSetFromNeon()}
                                                disabled={tokensLoading}
                                                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#ff7d87] transition hover:bg-[#ff7d87]/10 disabled:opacity-50"
                                            >
                                                <Delete className="size-3" />
                                                Delete set
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right: token editor */}
                                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 gap-6">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7188a8]">Colour Tokens</p>
                                            {activeTokenSet.source === 'user' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNewTokenForm({ id: '', label: '', hex: '#22d3ee' })}
                                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#8da4c3] transition hover:bg-white/[0.05] hover:text-[#dbe8fb]"
                                                >
                                                    <Plus className="size-3" />
                                                    Add token
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {activeTokenSet.tokens.map((token) => {
                                                const hexVal = resolveTokenToHex(token) ?? token.value ?? '#000000';
                                                const isEditable = activeTokenSet.source === 'user';
                                                return (
                                                    <div key={token.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/[0.1]">
                                                        {/* Colour swatch */}
                                                        <label className="relative shrink-0 cursor-pointer" title={isEditable ? 'Click to change colour' : undefined}>
                                                            <span
                                                                className="block size-7 rounded-lg border border-white/10 shadow-sm"
                                                                style={{ background: hexVal }}
                                                            />
                                                            {isEditable && (
                                                                <input
                                                                    type="color"
                                                                    value={hexVal.slice(0, 7)}
                                                                    onChange={(e) => updateActiveTokenValue(token.id, e.target.value)}
                                                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                                />
                                                            )}
                                                        </label>

                                                        {/* Token info */}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-xs font-semibold text-[#dbe8fb]">{token.label}</p>
                                                            <p className="font-mono text-[10px] text-[#7188a8]">{token.id}</p>
                                                        </div>

                                                        {/* Hex display / input */}
                                                        {isEditable ? (
                                                            <input
                                                                type="text"
                                                                value={hexVal}
                                                                onChange={(e) => updateActiveTokenValue(token.id, e.target.value)}
                                                                className="w-20 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-[#9bb0cc] outline-none focus:border-[#63e8da]/40 focus:text-white"
                                                            />
                                                        ) : (
                                                            <span className="font-mono text-[11px] text-[#7188a8]">{hexVal}</span>
                                                        )}

                                                        {/* Delete */}
                                                        {isEditable && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTokenFromActiveSet(token.id)}
                                                                className="shrink-0 rounded-md p-1 text-white/20 opacity-0 transition group-hover:opacity-100 hover:bg-[#ff7d87]/10 hover:text-[#ff7d87]"
                                                            >
                                                                <Delete className="size-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* Add token form */}
                                            {newTokenForm && (
                                                <form
                                                    onSubmit={(e) => { e.preventDefault(); addTokenToActiveSet(newTokenForm.id, newTokenForm.label, newTokenForm.hex); }}
                                                    className="flex flex-col gap-2 rounded-xl border border-[#63e8da]/20 bg-[#63e8da]/[0.04] p-3"
                                                >
                                                    <p className="text-[11px] font-semibold text-[#86fff1]">New token</p>
                                                    <div className="flex items-center gap-2">
                                                        <label className="relative shrink-0 cursor-pointer">
                                                            <span className="block size-7 rounded-lg border border-white/10" style={{ background: newTokenForm.hex }} />
                                                            <input
                                                                type="color"
                                                                value={newTokenForm.hex}
                                                                onChange={(e) => setNewTokenForm((f) => f ? { ...f, hex: e.target.value } : f)}
                                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                                            />
                                                        </label>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            placeholder="token-id"
                                                            value={newTokenForm.id}
                                                            onChange={(e) => setNewTokenForm((f) => f ? { ...f, id: e.target.value } : f)}
                                                            className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 font-mono text-xs text-white placeholder-white/30 outline-none focus:border-[#63e8da]/40"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Label"
                                                            value={newTokenForm.label}
                                                            onChange={(e) => setNewTokenForm((f) => f ? { ...f, label: e.target.value } : f)}
                                                            className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#63e8da]/40"
                                                        />
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button type="submit" disabled={!newTokenForm.id.trim() || !newTokenForm.label.trim()} className="flex-1 rounded-md bg-[#63e8da]/20 py-1 text-[11px] font-semibold text-[#86fff1] disabled:opacity-40 hover:bg-[#63e8da]/30 transition">Add</button>
                                                        <button type="button" onClick={() => setNewTokenForm(null)} className="flex-1 rounded-md bg-white/[0.06] py-1 text-[11px] text-[#8da4c3] hover:bg-white/[0.1] transition">Cancel</button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>

                                    {/* Size tokens */}
                                    <div>
                                        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#7188a8]">Size Tokens</p>
                                        <div className="flex flex-col gap-2">
                                            {(['sm', 'md', 'lg'] as const).map((size) => {
                                                const st = activeTokenSet.sizeTokens[size];
                                                const isEditable = activeTokenSet.source === 'user';
                                                return (
                                                    <div key={size} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                                                        <span className="w-6 text-center text-[11px] font-bold uppercase text-[#7188a8]">{size}</span>
                                                        <div className="flex flex-1 items-center gap-2">
                                                            <label className="flex items-center gap-1.5">
                                                                <span className="text-[10px] text-[#7188a8]">H</span>
                                                                {isEditable ? (
                                                                    <input
                                                                        type="number"
                                                                        min={20}
                                                                        max={640}
                                                                        value={st.height}
                                                                        onChange={(e) => updateActiveSizeToken(size, 'height', Number(e.target.value))}
                                                                        className="w-16 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-xs text-white outline-none focus:border-[#63e8da]/40"
                                                                    />
                                                                ) : (
                                                                    <span className="font-mono text-xs text-[#9bb0cc]">{st.height}px</span>
                                                                )}
                                                            </label>
                                                            <label className="flex items-center gap-1.5">
                                                                <span className="text-[10px] text-[#7188a8]">W</span>
                                                                {isEditable ? (
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={640}
                                                                        value={st.width ?? 0}
                                                                        onChange={(e) => updateActiveSizeToken(size, 'width', Number(e.target.value))}
                                                                        className="w-16 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-xs text-white outline-none focus:border-[#63e8da]/40"
                                                                        placeholder="auto"
                                                                    />
                                                                ) : (
                                                                    <span className="font-mono text-xs text-[#9bb0cc]">{st.width ? `${st.width}px` : 'auto'}</span>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
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
                                    {isOverlayComponent ? (
                                        <button
                                            type="button"
                                            onClick={() => setPinOverlayPreviews((current) => !current)}
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
                                        onClick={() => setShowCanvasGrid((current) => !current)}
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
                                    <div className="inline-flex items-center gap-2 p-2">
                                        <Sun className={cn('size-4 transition-colors', canvasTheme === 'light' ? 'text-[#86fff1]' : 'text-[#7289a9]')} />
                                        <Switch.Root
                                            checked={canvasTheme === 'dark'}
                                            onCheckedChange={(checked) => setCanvasTheme(checked ? 'dark' : 'light')}
                                            aria-label="Toggle canvas theme"
                                            className={cn(
                                                'relative h-5 w-10 shrink-0 rounded-full border transition-colors duration-300 ease-out outline-none',
                                                'focus-visible:ring-2 focus-visible:ring-[#63e8da]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101a2d]',
                                                canvasTheme === 'dark'
                                                    ? 'border-[#111f34]/45 bg-[#63e8da]/30'
                                                    : 'border-white/20 bg-[#111f34]',
                                            )}
                                        >
                                            <Switch.Thumb
                                                className={cn(
                                                    'block size-3 rounded-full shadow-md transition-transform duration-300 ease-out will-change-transform',
                                                    canvasTheme === 'dark'
                                                        ? 'translate-x-[22px] bg-[#86fff1]'
                                                        : 'translate-x-[2px] bg-[#d8e6fb]',
                                                )}
                                            />
                                        </Switch.Root>
                                        <Moon className={cn('size-4 transition-colors', canvasTheme === 'dark' ? 'text-[#86fff1]' : 'text-[#7289a9]')} />
                                    </div>
                                </div>
                            </header>
                            <div
                                className="flex min-h-0 flex-1 flex-col"
                                style={{
                                    backgroundColor: canvasBackground,
                                    backgroundImage: showCanvasGrid
                                        ? `radial-gradient(circle, ${canvasDotColor} 1px, transparent 1px)`
                                        : 'none',
                                    backgroundSize: '16px 16px',
                                }}
                            >
                                <div className="relative grid min-h-0 flex-[3_1_0%] place-items-center p-8">
                                    {selectedInstance && stagePreview && stagePreviewInstance ? (
                                        <div className="pointer-events-auto">
                                            {renderWithMotionControls(
                                                renderPreview(stagePreviewInstance, stagePreview.style, stagePreview.motionClassName, {
                                                    pinOverlayOpen: pinOverlayPreviews,
                                                }),
                                                stagePreviewInstance.style,
                                                !supportsEntryMotion(stagePreviewInstance.kind),
                                                !supportsEntryMotion(stagePreviewInstance.kind),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[#7f95b4]">Choose a component from the sidebar list.</p>
                                    )}
                                </div>
                                {statePreviewItems.length > 0 ? (
                                    <div className="flex min-h-0 flex-[2_1_0%] flex-col border-t border-white/8 px-4 py-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="ui-studio-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7f95b4]">
                                                State Snapshots
                                            </p>
                                            <p className="text-[11px] text-[#9bb0cc]">
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
                                                                <span className={cn('text-[11px] font-semibold transition', isSelected ? 'text-[#eafcff]' : 'text-[#dbe8fb]')}>
                                                                    {state.label}
                                                                </span>
                                                                {isSelected ? <Check className="size-3.5 text-[#86fff1]" /> : null}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateSelectedStyle('buttonPreviewState', state.value)}
                                                                className={cn(
                                                                    'inline-flex h-full min-h-[88px] w-full items-center justify-center rounded-lg text-left transition',
                                                                    isSelected
                                                                        ? 'bg-[#63e8da]/6 shadow-[inset_0_0_0_1px_rgba(126,254,240,0.16)]'
                                                                        : 'hover:bg-white/[0.03]',
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

                    <section className="ui-studio-right-panel flex min-h-0 min-w-0 flex-col overflow-hidden bg-[rgba(1, 3, 5, 0.76)] backdrop-blur-xl xl:border-l xl:border-white/8">
                        <header className="border-b border-white/8 px-4 py-2">
                            <Tabs value={rightSidebarTab} onValueChange={(value) => setRightSidebarTab(value as 'inspector' | 'motion' | 'export')} className="w-full">
                                <TabsList variant="line" className="w-full border-b border-white/10 pb-1">
                                    <TabsTrigger
                                        value="inspector"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Design
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="motion"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Motion FX
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="export"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Export
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </header>

                        <div className={cn('flex min-h-0 flex-1 flex-col', rightSidebarTab !== 'export' && 'hidden')}>
                            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                                <div className="inline-flex rounded-sm bg-[#0d0f12] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setExportStyleMode('inline')}
                                        className={cn(
                                            'rounded-md px-2 py-1 text-[13px] font-semibold transition',
                                            exportStyleMode === 'inline' ? 'bg-white/[0.16] text-[#eaf3ff]' : 'text-[#92a7c5] hover:text-[#e6f0ff]',
                                        )}
                                    >
                                        CSS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExportStyleMode('tailwind')}
                                        className={cn(
                                            'rounded-md px-2 py-1 text-[13px] font-semibold transition',
                                            exportStyleMode === 'tailwind' ? 'bg-white/[0.16] text-[#eaf3ff]' : 'text-[#92a7c5] hover:text-[#e6f0ff]',
                                        )}
                                    >
                                        Tailwind
                                    </button>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <button type="button" onClick={() => void copyCode(activeCodeSnippet)} className={studioActionButtonClass}>
                                        {copiedCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                                        {copiedCode ? 'Copied' : 'Copy'}
                                    </button>
                                    <button type="button" onClick={() => exportCode(activeCodeFilename, activeCodeSnippet)} className={studioActionButtonClass}>
                                        {exportedCode ? <Check className="size-3" /> : <Download className="size-3" />}
                                        {exportedCode ? 'Done' : 'Export'}
                                    </button>
                                </div>
                            </div>

                            <Tabs value={codePanelTab} onValueChange={(value) => setCodePanelTab(value as CodePanelTab)} className="min-h-0 flex-1 px-4 pb-3 pt-2">
                                <TabsList variant="line" className="w-full border-b border-white/10 pb-1">
                                    <TabsTrigger
                                        value="snippet"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Snippet
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="named"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Component
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="exports"
                                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                    >
                                        Design Bundle
                                    </TabsTrigger>
                                    {exportStyleMode === 'tailwind' ? (
                                        <TabsTrigger
                                            value="theme"
                                            className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                                        >
                                            Theme CSS
                                        </TabsTrigger>
                                    ) : null}
                                </TabsList>
                                <TabsContent value="snippet" className="min-h-0">
                                    <pre className="h-full min-h-[260px] overflow-auto pt-3 text-[12px] leading-relaxed text-[#bfd1ec]">
                                        <code>{activeSnippet}</code>
                                    </pre>
                                </TabsContent>
                                <TabsContent value="named" className="min-h-0">
                                    <pre className="h-full min-h-[260px] overflow-auto pt-3 text-[12px] leading-relaxed text-[#bfd1ec]">
                                        <code>{activeNamedSnippet}</code>
                                    </pre>
                                </TabsContent>
                                <TabsContent value="exports" className="min-h-0">
                                    <pre className="h-full min-h-[260px] overflow-auto pt-3 text-[12px] leading-relaxed text-[#bfd1ec]">
                                        <code>{allExportsSnippet}</code>
                                    </pre>
                                </TabsContent>
                                <TabsContent value="theme" className="min-h-0">
                                    <pre className="h-full min-h-[260px] overflow-auto pt-3 text-[12px] leading-relaxed text-[#bfd1ec]">
                                        <code>{tailwindThemeSnippet}</code>
                                    </pre>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-white/8', rightSidebarTab !== 'motion' && 'hidden')}>
                            {selectedStyle && selectedInstance ? (
                                <>
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
                                </>
                            ) : (
                                <div className="p-4 text-sm text-[#87a0c2]">Select a variant to open motion controls.</div>
                            )}
                        </div>

                        <div
                            className={cn(
                                'ui-studio-inspector flex min-h-0 flex-1 flex-col overflow-hidden border-t border-white/8',
                                rightSidebarTab !== 'inspector' && 'hidden',
                            )}
                        >
                            {selectedStyle && selectedInstance ? (
                                <ScrollArea className="ui-studio-inspector-scroll min-h-0 h-full min-w-0 flex-1 overflow-x-hidden">
                                    <div className="min-w-0 overflow-x-hidden px-2 pb-6 pt-2">
                                        <div className="mx-1 mb-1.5 flex items-center justify-between border-b border-white/8 px-2 pb-2 pt-1">
                                            {editingVariantId === selectedInstance.id ? (
                                                <input
                                                    value={editingVariantName}
                                                    onChange={(event) => setEditingVariantName(event.target.value)}
                                                    onBlur={() => commitRenameVariant(selectedInstance.id)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter') {
                                                            event.preventDefault();
                                                            commitRenameVariant(selectedInstance.id);
                                                        }
                                                        if (event.key === 'Escape') {
                                                            event.preventDefault();
                                                            setEditingVariantId(null);
                                                            setEditingVariantName('');
                                                        }
                                                    }}
                                                    className={cn(studioInputClass, 'h-8 max-w-[220px]')}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="inline-flex items-center gap-2">
                                                    <h2 className="truncate text-sm font-semibold text-[#edf5ff]">{selectedInstance.name}</h2>
                                                    <button
                                                        type="button"
                                                        onClick={() => startRenameVariant(selectedInstance)}
                                                        className="rounded-md p-1 text-[#8fa6c7] transition hover:bg-white/[0.06] hover:text-[#eaf2ff]"
                                                        aria-label="Rename component"
                                                    >
                                                        <EditOne className="size-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <Tooltip delay={800}>
                                                <TooltipTrigger
                                                    className="inline-flex size-8 items-center justify-center rounded-md text-[#8fa6c7] transition hover:bg-white/[0.06] hover:text-[#ff9ca4]"
                                                    onPress={() => deleteInstance(selectedInstance.id)}
                                                    aria-label="Clear selected component"
                                                >
                                                    <Delete className="size-4" />
                                                </TooltipTrigger>
                                                <TooltipContent>Clear</TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="flex flex-col divide-y divide-[var(--inspector-border-soft)]">
                                            {designVisualPresets.length > 0 && activeDesignPresetId ? (
                                                <div className="p-1">
                                                    <FlatInspectorSection
                                                        title="Presets"
                                                        icon={Sparkles}
                                                        defaultOpen={false}
                                                        subtitle={`${designVisualPresets.length} presets`}
                                                    >

                                                        <FlatSelect
                                                            value={activeDesignPresetId}
                                                            onValueChange={(value) => applyComponentVisualPreset(value)}
                                                            ariaLabel={`${buildKindTitle(selectedInstance.kind)} preset`}
                                                        >
                                                            {designVisualPresets.map((preset) => (
                                                                <option key={preset.id} value={preset.id}>
                                                                    {preset.label}
                                                                </option>
                                                            ))}
                                                        </FlatSelect>

                                                        {activeComponentPreset ? (
                                                            <p className="text-[10px] leading-relaxed text-[var(--inspector-muted-text)]">
                                                                {activeComponentPreset.description}
                                                            </p>
                                                        ) : null}
                                                    </FlatInspectorSection>
                                                </div>
                                            ) : null}

                                            <div className="p-1">
                                                <FlatInspectorSection
                                                    title={hasPanelElementControls ? 'Button Design' : 'Dimensions'}
                                                    icon={Ruler}
                                                    defaultOpen
                                                    subtitle={hasPanelElementControls ? 'Button trigger sizing and visual styling.' : undefined}
                                                >
                                                    <div className={cn('flex items-start gap-3', showWidthControl ? 'flex-wrap' : 'flex-nowrap')}>
                                                        <div className="w-[112px] shrink-0">
                                                            <FlatField label="Size" stacked>
                                                                <div className="flex h-6 w-full items-center gap-1 rounded-sm bg-[var(--inspector-input)]">
                                                                    {([
                                                                        { label: 'S', value: 'sm' },
                                                                        { label: 'M', value: 'md' },
                                                                        { label: 'L', value: 'lg' },
                                                                    ] as const).map((option) => (
                                                                        <button
                                                                            key={option.value}
                                                                            type="button"
                                                                            onClick={() => applySizeTokenToSelected(option.value)}
                                                                            className={cn(
                                                                                inspectorChoiceButtonBase,
                                                                                selectedStyle.size === option.value
                                                                                    ? inspectorChoiceButtonActive
                                                                                    : inspectorChoiceButtonIdle,
                                                                            )}
                                                                        >
                                                                            {option.label}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </FlatField>
                                                        </div>
                                                        {showWidthControl ? (
                                                            <FlatUnitField
                                                                label="Width"
                                                                value={selectedStyle.customWidth}
                                                                min={0}
                                                                max={640}
                                                                unit="px"
                                                                onChange={(value) => updateSelectedStyle('customWidth', value)}
                                                                zeroLabel="auto"
                                                            />
                                                        ) : null}
                                                        <FlatUnitField
                                                            label="Height"
                                                            value={selectedStyle.customHeight}
                                                            min={0}
                                                            max={720}
                                                            unit="px"
                                                            onChange={(value) => updateSelectedStyle('customHeight', value)}
                                                            zeroLabel="auto"
                                                        />
                                                        <FlatUnitField
                                                            label="Radius"
                                                            value={selectedStyle.cornerRadius}
                                                            min={0}
                                                            max={40}
                                                            unit="px"
                                                            onChange={(value) => updateSelectedStyle('cornerRadius', value)}
                                                        />
                                                    </div>
                                                    {hasPanelElementControls ? (
                                                        <>
                                                            {currentAppearanceValues ? (
                                                                <div className="flex items-end gap-1.5">
                                                                    <div className="min-w-0 flex-1">
                                                                        <FlatColorControl
                                                                            label="Fill"
                                                                            value={currentAppearanceValues.fillColor}
                                                                            opacity={currentAppearanceValues.fillOpacity}
                                                                            onOpacityChange={(value) => updateAppearanceField('fillOpacity', value)}
                                                                            onChange={(value) => updateAppearanceField('fillColor', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                            allowGradient
                                                                            mode={currentAppearanceValues.fillMode}
                                                                            onModeChange={(mode) => updateAppearanceField('fillMode', mode)}
                                                                            secondaryValue={currentAppearanceValues.fillColorTo}
                                                                            onSecondaryChange={(value) => updateAppearanceField('fillColorTo', value)}
                                                                            mix={currentAppearanceValues.fillWeight}
                                                                            onMixChange={(value) => updateAppearanceField('fillWeight', value)}
                                                                            stacked
                                                                            compact
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <FlatColorControl
                                                                            label="Stroke"
                                                                            value={currentAppearanceValues.strokeColor}
                                                                            opacity={currentAppearanceValues.strokeOpacity}
                                                                            onOpacityChange={(value) => updateAppearanceField('strokeOpacity', value)}
                                                                            onChange={(value) => updateAppearanceField('strokeColor', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                            stacked
                                                                            compact
                                                                        />
                                                                    </div>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Adjust stroke width"
                                                                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] transition hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]"
                                                                            >
                                                                                <SlidersHorizontal className="size-4" />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent
                                                                            side="left"
                                                                            align="start"
                                                                            sideOffset={10}
                                                                            className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                                        >
                                                                            <div className="space-y-3">
                                                                                <div className="space-y-1">
                                                                                    <p className="text-[12px] font-medium text-[var(--inspector-text)]">Stroke Width</p>
                                                                                    <p className="text-[11px] text-[var(--inspector-muted-text)]">
                                                                                        {currentAppearanceValues.strokeWeight}px
                                                                                    </p>
                                                                                </div>
                                                                                <Slider
                                                                                    value={[currentAppearanceValues.strokeWeight]}
                                                                                    onValueChange={(values: number[]) => updateAppearanceField('strokeWeight', values[0] ?? 0)}
                                                                                    min={0}
                                                                                    max={8}
                                                                                    step={0.5}
                                                                                />
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            ) : null}

                                                            {supportsTypographyStyle(selectedInstance.kind) && currentAppearanceValues ? (
                                                                <>
                                                                    <FlatField label="Typography" stacked>
                                                                        <div className="flex flex-wrap items-end gap-3">
                                                                            <FlatUnitField
                                                                                label="Size"
                                                                                value={currentAppearanceValues.fontSize}
                                                                                min={10}
                                                                                max={36}
                                                                                unit="px"
                                                                                onChange={(value) => updateAppearanceField('fontSize', value)}
                                                                            />
                                                                            <div className="w-[92px] shrink-0">
                                                                                <FlatField label="Weight" stacked>
                                                                                    <FlatSelect
                                                                                        value={currentAppearanceValues.fontWeight}
                                                                                        onValueChange={(value) => updateAppearanceField('fontWeight', Number(value))}
                                                                                        ariaLabel="Typography weight"
                                                                                    >
                                                                                        {[300, 400, 500, 600, 700].map((weight) => (
                                                                                            <option key={weight} value={weight}>
                                                                                                {weight}
                                                                                            </option>
                                                                                        ))}
                                                                                    </FlatSelect>
                                                                                </FlatField>
                                                                            </div>
                                                                        </div>
                                                                    </FlatField>

                                                                    <FlatField label="Align">
                                                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                                            {[
                                                                                { value: 'left' as const, icon: TextAlignLeft },
                                                                                { value: 'center' as const, icon: TextAlignCenter },
                                                                                { value: 'right' as const, icon: TextAlignRight },
                                                                            ].map((item) => {
                                                                                const Icon = item.icon;
                                                                                return (
                                                                                    <button
                                                                                        key={item.value}
                                                                                        type="button"
                                                                                        onClick={() => updateAppearanceField('fontPosition', item.value as FontPosition)}
                                                                                        className={cn(
                                                                                            inspectorIconChoiceButtonBase,
                                                                                            currentAppearanceValues.fontPosition === item.value
                                                                                                ? inspectorChoiceButtonActive
                                                                                                : inspectorChoiceButtonIdle,
                                                                                        )}
                                                                                    >
                                                                                        <Icon className="size-4" />
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </FlatField>

                                                                    <FlatField label="Text" stacked>
                                                                        <FlatColorControl
                                                                            label="Color"
                                                                            value={currentAppearanceValues.fontColor}
                                                                            opacity={currentAppearanceValues.fontOpacity}
                                                                            onOpacityChange={(value) => updateAppearanceField('fontOpacity', value)}
                                                                            onChange={(value) => updateAppearanceField('fontColor', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                            compact
                                                                        />
                                                                    </FlatField>
                                                                </>
                                                            ) : null}

                                                            {supportsTextIconMode ? (
                                                                <FlatField label="Content Mode" stacked>
                                                                    <FlatSelect
                                                                        value={contentDisplayMode}
                                                                        onValueChange={(value) => updateContentDisplayMode(value as 'text' | 'text-icon' | 'icon')}
                                                                        ariaLabel="Content mode"
                                                                    >
                                                                        <option value="text">Text only</option>
                                                                        <option value="text-icon">Text + Icon</option>
                                                                        <option value="icon">Icon only</option>
                                                                    </FlatSelect>
                                                                </FlatField>
                                                            ) : null}

                                                            <AnimatePresence initial={false}>
                                                                {supportsIconSelection(selectedInstance.kind) && (contentDisplayMode === 'text-icon' || contentDisplayMode === 'icon') ? (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -6 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -4 }}
                                                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                                                        className="space-y-3"
                                                                    >
                                                                        <FlatField label="Icon">
                                                                            <FlatSelect
                                                                                value={selectedStyle.icon}
                                                                                onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                                                ariaLabel="Icon"
                                                                            >
                                                                                {ICON_OPTIONS.map((option) => (
                                                                                    <option key={option.id} value={option.id}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </FlatSelect>
                                                                        </FlatField>
                                                                        <FlatField label="Icon Position">
                                                                            <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                                                {(['left', 'right'] as const).map((position) => (
                                                                                    <button
                                                                                        key={position}
                                                                                        type="button"
                                                                                        onClick={() => updateSelectedStyle('iconPosition', position)}
                                                                                        className={cn(
                                                                                            inspectorChoiceButtonBase,
                                                                                            selectedStyle.iconPosition === position
                                                                                                ? inspectorChoiceButtonActive
                                                                                                : inspectorChoiceButtonIdle,
                                                                                        )}
                                                                                    >
                                                                                        {position}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </FlatField>
                                                                    </motion.div>
                                                                ) : null}
                                                            </AnimatePresence>
                                                        </>
                                                    ) : null}
                                                </FlatInspectorSection>
                                            </div>

                                            <div className="p-1">
                                                <FlatInspectorSection
                                                    title={hasPanelElementControls ? 'Panel Design' : appearanceSectionTitle}
                                                    icon={Swatches}
                                                    defaultOpen
                                                    subtitle={hasPanelElementControls ? 'Overlay dimensions and styling.' : undefined}
                                                >
                                                    {hasPanelElementControls ? (
                                                        <>
                                                            <>
                                                                {selectedInstance && supportsDropdownHoverStyle(selectedInstance.kind) ? (
                                                                    <>
                                                                        <FlatColorControl
                                                                            label="Item Hover Fill"
                                                                            value={selectedStyle.dropdownHoverFill}
                                                                            opacity={selectedStyle.dropdownHoverFillOpacity}
                                                                            onOpacityChange={(value) => updateSelectedStyle('dropdownHoverFillOpacity', value)}
                                                                            onChange={(value) => updateSelectedStyle('dropdownHoverFill', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                        />
                                                                        <FlatColorControl
                                                                            label="Item Hover Text"
                                                                            value={selectedStyle.dropdownHoverText}
                                                                            onChange={(value) => updateSelectedStyle('dropdownHoverText', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                        />
                                                                    </>
                                                                ) : null}
                                                                <div className="flex flex-wrap items-start gap-4">
                                                                    <FlatUnitField
                                                                        label="Width"
                                                                        value={selectedStyle.panelCustomWidth}
                                                                        min={0}
                                                                        max={720}
                                                                        unit="px"
                                                                        onChange={(value) => updateSelectedStyle('panelCustomWidth', value)}
                                                                    />
                                                                    <FlatUnitField
                                                                        label="Height"
                                                                        value={selectedStyle.panelCustomHeight}
                                                                        min={0}
                                                                        max={720}
                                                                        unit="px"
                                                                        onChange={(value) => updateSelectedStyle('panelCustomHeight', value)}
                                                                    />
                                                                    <FlatUnitField
                                                                        label="Radius"
                                                                        value={selectedStyle.panelCornerRadius}
                                                                        min={0}
                                                                        max={40}
                                                                        unit="px"
                                                                        onChange={(value) => updateSelectedStyle('panelCornerRadius', value)}
                                                                    />
                                                                </div>
                                                                <div className="flex items-end gap-1.5">
                                                                    <div className="min-w-0 flex-1">
                                                                        <FlatColorControl
                                                                            label="Fill"
                                                                            value={selectedStyle.panelFillColor}
                                                                            opacity={selectedStyle.panelFillOpacity}
                                                                            onOpacityChange={(value) => updateSelectedStyle('panelFillOpacity', value)}
                                                                            onChange={(value) => updateSelectedStyle('panelFillColor', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                            stacked
                                                                            compact
                                                                        />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <FlatColorControl
                                                                            label="Stroke"
                                                                            value={selectedStyle.panelStrokeColor}
                                                                            opacity={selectedStyle.panelStrokeOpacity}
                                                                            onOpacityChange={(value) => updateSelectedStyle('panelStrokeOpacity', value)}
                                                                            onChange={(value) => updateSelectedStyle('panelStrokeColor', value)}
                                                                            tokens={activeTokenSet.tokens}
                                                                            stacked
                                                                            compact
                                                                        />
                                                                    </div>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Adjust stroke width"
                                                                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] transition hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]"
                                                                            >
                                                                                <SlidersHorizontal className="size-4" />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent
                                                                            side="left"
                                                                            align="start"
                                                                            sideOffset={10}
                                                                            className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                                        >
                                                                            <div className="space-y-3">
                                                                                <div className="space-y-1">
                                                                                    <p className="text-[12px] font-medium text-[var(--inspector-text)]">Stroke Width</p>
                                                                                    <p className="text-[11px] text-[var(--inspector-muted-text)]">
                                                                                        {selectedStyle.panelStrokeWeight}px
                                                                                    </p>
                                                                                </div>
                                                                                <Slider
                                                                                    value={[selectedStyle.panelStrokeWeight]}
                                                                                    onValueChange={(values: number[]) => updateSelectedStyle('panelStrokeWeight', values[0] ?? 0)}
                                                                                    min={0}
                                                                                    max={8}
                                                                                    step={0.5}
                                                                                />
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                                <FlatField label="Typography" stacked>
                                                                    <div className="flex flex-wrap items-end gap-3">
                                                                        <FlatUnitField
                                                                            label="Size"
                                                                            value={selectedStyle.panelFontSize}
                                                                            min={10}
                                                                            max={36}
                                                                            unit="px"
                                                                            onChange={(value) => updateSelectedStyle('panelFontSize', value)}
                                                                        />
                                                                        <div className="w-[92px] shrink-0">
                                                                            <FlatField label="Weight" stacked>
                                                                                <FlatSelect
                                                                                    value={selectedStyle.panelFontWeight}
                                                                                    onValueChange={(value) => updateSelectedStyle('panelFontWeight', Number(value))}
                                                                                    ariaLabel="Typography weight"
                                                                                >
                                                                                    {[300, 400, 500, 600, 700].map((weight) => (
                                                                                        <option key={weight} value={weight}>
                                                                                            {weight}
                                                                                        </option>
                                                                                    ))}
                                                                                </FlatSelect>
                                                                            </FlatField>
                                                                        </div>
                                                                    </div>
                                                                </FlatField>
                                                                <FlatField label="Text" stacked>
                                                                    <div className="flex items-end gap-1.5">
                                                                        <div className="min-w-0 flex-1">
                                                                            <FlatColorControl
                                                                                label="Color"
                                                                                value={selectedStyle.panelFontColor}
                                                                                opacity={selectedStyle.panelFontOpacity}
                                                                                onOpacityChange={(value) => updateSelectedStyle('panelFontOpacity', value)}
                                                                                onChange={(value) => updateSelectedStyle('panelFontColor', value)}
                                                                                tokens={activeTokenSet.tokens}
                                                                                compact
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-wrap items-end gap-1.5">
                                                                            <div className="flex items-center gap-1">
                                                                                <Popover>
                                                                                    <PopoverTrigger asChild>
                                                                                        <button
                                                                                            type="button"
                                                                                            aria-label="Configure panel text shadow"
                                                                                            className={cn(
                                                                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition',
                                                                                                selectedStyle.panelEffectDropShadow
                                                                                                    ? 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                                                                    : 'border-[var(--inspector-border-soft)] bg-[#0c121d] text-[var(--inspector-muted-text)] hover:border-[var(--inspector-border-strong)] hover:text-[var(--inspector-text)]',
                                                                                            )}
                                                                                        >
                                                                                            <Sparkles className="size-4" />
                                                                                        </button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent
                                                                                        side="left"
                                                                                        align="end"
                                                                                        sideOffset={12}
                                                                                        collisionPadding={16}
                                                                                        className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                                                    >
                                                                                        <div className="space-y-3">
                                                                                            <div className="space-y-1">
                                                                                                <p className="text-[12px] font-medium text-[var(--inspector-text)]">Drop Shadow</p>
                                                                                                <p className="text-[11px] text-[var(--inspector-muted-text)]">Adjusting any value enables it.</p>
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                                <MiniNumberField
                                                                                                    label="Distance"
                                                                                                    value={Math.max(0, selectedStyle.panelDropShadowY)}
                                                                                                    min={0}
                                                                                                    max={80}
                                                                                                    onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowY: value })}
                                                                                                />
                                                                                                <MiniNumberField
                                                                                                    label="X"
                                                                                                    value={selectedStyle.panelDropShadowX}
                                                                                                    min={-80}
                                                                                                    max={80}
                                                                                                    onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowX: value })}
                                                                                                />
                                                                                                <MiniNumberField
                                                                                                    label="Blur"
                                                                                                    value={selectedStyle.panelDropShadowBlur}
                                                                                                    min={0}
                                                                                                    max={80}
                                                                                                    onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowBlur: value })}
                                                                                                />
                                                                                                <MiniNumberField
                                                                                                    label="Spread"
                                                                                                    value={selectedStyle.panelDropShadowSpread}
                                                                                                    min={-40}
                                                                                                    max={40}
                                                                                                    onChange={(value) => updateSelectedStyles({ panelEffectDropShadow: true, panelDropShadowSpread: value })}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                                {selectedStyle.panelEffectDropShadow ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => updateSelectedStyle('panelEffectDropShadow', false)}
                                                                                        className="inline-flex h-6 items-center rounded-sm border border-white/10 px-2 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                ) : null}
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Popover>
                                                                                    <PopoverTrigger asChild>
                                                                                        <button
                                                                                            type="button"
                                                                                            aria-label="Configure panel text blur"
                                                                                            className={cn(
                                                                                                'inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition',
                                                                                                selectedStyle.panelEffectBlur
                                                                                                    ? 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)]'
                                                                                                    : 'border-[var(--inspector-border-soft)] bg-[#0c121d] text-[var(--inspector-muted-text)] hover:border-[var(--inspector-border-strong)] hover:text-[var(--inspector-text)]',
                                                                                            )}
                                                                                        >
                                                                                            <Moon className="size-4" />
                                                                                        </button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent
                                                                                        side="left"
                                                                                        align="end"
                                                                                        sideOffset={12}
                                                                                        collisionPadding={16}
                                                                                        className="w-[220px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                                                    >
                                                                                        <div className="space-y-3">
                                                                                            <div className="space-y-1">
                                                                                                <p className="text-[12px] font-medium text-[var(--inspector-text)]">Background Blur</p>
                                                                                                <p className="text-[11px] text-[var(--inspector-muted-text)]">Adjusting the amount enables it.</p>
                                                                                            </div>
                                                                                            <MiniNumberField
                                                                                                label="Amount"
                                                                                                value={selectedStyle.panelBlurAmount}
                                                                                                min={0}
                                                                                                max={30}
                                                                                                unit="px"
                                                                                                onChange={(value) => updateSelectedStyles({ panelEffectBlur: true, panelBlurAmount: value })}
                                                                                            />
                                                                                        </div>
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                                {selectedStyle.panelEffectBlur ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => updateSelectedStyle('panelEffectBlur', false)}
                                                                                        className="inline-flex h-6 items-center rounded-sm border border-white/10 px-2 text-[11px] font-medium text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </FlatField>
                                                            </>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {currentAppearanceValues ? (
                                                                <>
                                                                    <FlatColorControl
                                                                        label="Fill"
                                                                        value={currentAppearanceValues.fillColor}
                                                                        opacity={currentAppearanceValues.fillOpacity}
                                                                        onOpacityChange={(value) => updateAppearanceField('fillOpacity', value)}
                                                                        onChange={(value) => updateAppearanceField('fillColor', value)}
                                                                        tokens={activeTokenSet.tokens}
                                                                        allowGradient
                                                                        mode={currentAppearanceValues.fillMode}
                                                                        onModeChange={(mode) => updateAppearanceField('fillMode', mode)}
                                                                        secondaryValue={currentAppearanceValues.fillColorTo}
                                                                        onSecondaryChange={(value) => updateAppearanceField('fillColorTo', value)}
                                                                        mix={currentAppearanceValues.fillWeight}
                                                                        onMixChange={(value) => updateAppearanceField('fillWeight', value)}
                                                                    />
                                                                    <FlatColorControl
                                                                        label="Stroke"
                                                                        value={currentAppearanceValues.strokeColor}
                                                                        opacity={currentAppearanceValues.strokeOpacity}
                                                                        onOpacityChange={(value) => updateAppearanceField('strokeOpacity', value)}
                                                                        onChange={(value) => updateAppearanceField('strokeColor', value)}
                                                                        tokens={activeTokenSet.tokens}
                                                                    />
                                                                    <FlatUnitField
                                                                        label="Stroke Width"
                                                                        value={currentAppearanceValues.strokeWeight}
                                                                        min={0}
                                                                        max={8}
                                                                        unit="px"
                                                                        onChange={(value) => updateAppearanceField('strokeWeight', value)}
                                                                    />
                                                                </>
                                                            ) : null}

                                                            {supportsTypographyStyle(selectedInstance.kind) && currentAppearanceValues ? (
                                                                <>
                                                                    <FlatField label="Typography" stacked>
                                                                        <div className="flex gap-2 [&>*]:min-w-0 [&>*]:flex-1">
                                                                            <FlatUnitField
                                                                                label="Size"
                                                                                value={currentAppearanceValues.fontSize}
                                                                                min={10}
                                                                                max={36}
                                                                                unit="px"
                                                                                onChange={(value) => updateAppearanceField('fontSize', value)}
                                                                            />
                                                                            <FlatField label="Weight">
                                                                                <FlatSelect
                                                                                    value={currentAppearanceValues.fontWeight}
                                                                                    onValueChange={(value) => updateAppearanceField('fontWeight', Number(value))}
                                                                                    ariaLabel="Typography weight"
                                                                                >
                                                                                    {[300, 400, 500, 600, 700].map((weight) => (
                                                                                        <option key={weight} value={weight}>
                                                                                            {weight}
                                                                                        </option>
                                                                                    ))}
                                                                                </FlatSelect>
                                                                            </FlatField>
                                                                        </div>
                                                                    </FlatField>

                                                                    <FlatField label="Align">
                                                                        <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                                            {[
                                                                                { value: 'left' as const, icon: TextAlignLeft },
                                                                                { value: 'center' as const, icon: TextAlignCenter },
                                                                                { value: 'right' as const, icon: TextAlignRight },
                                                                            ].map((item) => {
                                                                                const Icon = item.icon;
                                                                                return (
                                                                                    <button
                                                                                        key={item.value}
                                                                                        type="button"
                                                                                        onClick={() => updateAppearanceField('fontPosition', item.value as FontPosition)}
                                                                                        className={cn(
                                                                                            inspectorIconChoiceButtonBase,
                                                                                            currentAppearanceValues.fontPosition === item.value
                                                                                                ? inspectorChoiceButtonActive
                                                                                                : inspectorChoiceButtonIdle,
                                                                                        )}
                                                                                    >
                                                                                        <Icon className="size-4" />
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </FlatField>

                                                                    <FlatColorControl
                                                                        label="Text"
                                                                        value={currentAppearanceValues.fontColor}
                                                                        opacity={currentAppearanceValues.fontOpacity}
                                                                        onOpacityChange={(value) => updateAppearanceField('fontOpacity', value)}
                                                                        onChange={(value) => updateAppearanceField('fontColor', value)}
                                                                        tokens={activeTokenSet.tokens}
                                                                    />
                                                                </>
                                                            ) : null}

                                                            {supportsTextIconMode ? (
                                                                <FlatField label="Content Mode" stacked>
                                                                    <FlatSelect
                                                                        value={contentDisplayMode}
                                                                        onValueChange={(value) => updateContentDisplayMode(value as 'text' | 'text-icon' | 'icon')}
                                                                        ariaLabel="Content mode"
                                                                    >
                                                                        <option value="text">Text only</option>
                                                                        <option value="text-icon">Text + Icon</option>
                                                                        <option value="icon">Icon only</option>
                                                                    </FlatSelect>
                                                                </FlatField>
                                                            ) : null}

                                                            <AnimatePresence initial={false}>
                                                                {supportsIconSelection(selectedInstance.kind) && (contentDisplayMode === 'text-icon' || contentDisplayMode === 'icon') ? (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -6 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -4 }}
                                                                        transition={{ duration: 0.18, ease: 'easeOut' }}
                                                                        className="space-y-3"
                                                                    >
                                                                        <FlatField label="Icon">
                                                                            <FlatSelect
                                                                                value={selectedStyle.icon}
                                                                                onValueChange={(value) => updateSelectedStyle('icon', value as IconOptionId)}
                                                                                ariaLabel="Icon"
                                                                            >
                                                                                {ICON_OPTIONS.map((option) => (
                                                                                    <option key={option.id} value={option.id}>
                                                                                        {option.label}
                                                                                    </option>
                                                                                ))}
                                                                            </FlatSelect>
                                                                        </FlatField>
                                                                        <FlatField label="Icon Position">
                                                                            <div className="flex w-full items-center gap-0.5 rounded-md bg-[var(--inspector-input)] p-0.5">
                                                                                {(['left', 'right'] as const).map((position) => (
                                                                                    <button
                                                                                        key={position}
                                                                                        type="button"
                                                                                        onClick={() => updateSelectedStyle('iconPosition', position)}
                                                                                        className={cn(
                                                                                            inspectorChoiceButtonBase,
                                                                                            selectedStyle.iconPosition === position
                                                                                                ? inspectorChoiceButtonActive
                                                                                                : inspectorChoiceButtonIdle,
                                                                                        )}
                                                                                    >
                                                                                        {position}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </FlatField>
                                                                    </motion.div>
                                                                ) : null}
                                                            </AnimatePresence>
                                                        </>
                                                    )}
                                                </FlatInspectorSection>
                                            </div>

                                            <div className="p-1">
                                                <section className="py-0.5">
                                                    <div className="flex items-center justify-between rounded-md px-2 py-2">
                                                        <div className="inline-flex min-w-0 items-center gap-2.5">
                                                            <Sparkles className="size-4 shrink-0 text-[var(--inspector-muted-text)]" />
                                                            <p className="truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--inspector-text)]">Effects</p>
                                                        </div>
                                                        <Popover open={effectsBuilderOpen} onOpenChange={setEffectsBuilderOpen}>
                                                            <PopoverTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    disabled={inactiveEffectOptions.length === 0}
                                                                    aria-label="Add effect"
                                                                    className={cn(
                                                                        'inline-flex size-7 shrink-0 items-center justify-center rounded-sm border transition',
                                                                        inactiveEffectOptions.length === 0
                                                                            ? 'cursor-not-allowed border-white/8 bg-white/[0.02] text-white/20'
                                                                            : 'border-[color:var(--inspector-accent)]/30 bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] hover:border-[color:var(--inspector-accent)]/50 hover:bg-[color:var(--inspector-accent-soft)]/80 hover:text-[var(--inspector-text)]',
                                                                    )}
                                                                >
                                                                    <Plus className="size-4" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent
                                                                side="left"
                                                                align="end"
                                                                sideOffset={12}
                                                                collisionPadding={16}
                                                                className="w-[248px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                            >
                                                                <div className="space-y-3">
                                                                    <FlatField label="Effect" stacked>
                                                                        <FlatSelect
                                                                            value={pendingEffectId ?? inactiveEffectOptions[0]?.id ?? ''}
                                                                            onValueChange={(value) => setPendingEffectId(value)}
                                                                            ariaLabel="Effect to add"
                                                                        >
                                                                            {inactiveEffectOptions.map((option) => (
                                                                                <option key={option.id} value={option.id}>
                                                                                    {option.label}
                                                                                </option>
                                                                            ))}
                                                                        </FlatSelect>
                                                                    </FlatField>
                                                                    {pendingEffectId ? renderEffectConfigurator(pendingEffectId as 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep') : null}
                                                                    <button
                                                                        type="button"
                                                                        disabled={!pendingEffectId}
                                                                        onClick={() => {
                                                                            if (!pendingEffectId) {
                                                                                return;
                                                                            }
                                                                            setEffectEnabled(pendingEffectId as 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep', true);
                                                                            setEffectsBuilderOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            'inline-flex h-8 w-full items-center justify-center rounded-sm text-[12px] font-semibold transition',
                                                                            pendingEffectId
                                                                                ? 'bg-[color:var(--inspector-accent-soft)] text-[color:var(--inspector-accent)] hover:bg-[color:var(--inspector-accent-soft)]/80'
                                                                                : 'cursor-not-allowed bg-white/[0.04] text-white/25',
                                                                        )}
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    {effectOptions.filter((option) => option.enabled).length > 0 ? (
                                                        <div className="space-y-2 px-2 pb-3 pt-1">
                                                            {effectOptions
                                                                .filter((option) => option.enabled)
                                                                .map((option) => (
                                                                    <div key={option.id} className="flex items-center gap-2">
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <button
                                                                                    type="button"
                                                                                    className="inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-sm border border-[var(--inspector-border-soft)] bg-[#0c121d] px-2.5 py-2 text-left transition hover:border-[var(--inspector-border-strong)]"
                                                                                >
                                                                                    <span className="truncate text-[12px] font-medium text-[var(--inspector-text)]">
                                                                                        {option.label}
                                                                                    </span>
                                                                                    <Config className="size-4 shrink-0 text-[var(--inspector-muted-text)]" />
                                                                                </button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent
                                                                                side="left"
                                                                                align="end"
                                                                                sideOffset={12}
                                                                                collisionPadding={16}
                                                                                className="w-[248px] border-[var(--inspector-border-soft)] bg-[var(--inspector-panel)] p-3 text-[var(--inspector-text)]"
                                                                            >
                                                                                <div className="space-y-3">
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-[12px] font-medium text-[var(--inspector-text)]">{option.label}</p>
                                                                                        <p className="text-[11px] text-[var(--inspector-muted-text)]">Changes apply instantly.</p>
                                                                                    </div>
                                                                                    {renderEffectConfigurator(option.id as 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep')}
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEffectEnabled(option.id as 'drop-shadow' | 'inner-shadow' | 'background-blur' | 'glass-tint' | 'gradient-slide' | 'animated-border' | 'ripple-fill' | 'loading-state' | 'sweep', false)}
                                                                            aria-label={`Remove ${option.label}`}
                                                                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.02] text-[var(--inspector-muted-text)] transition hover:border-white/20 hover:text-[var(--inspector-text)]"
                                                                        >
                                                                            <Minus className="size-4" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    ) : null}
                                                </section>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="p-4 text-sm text-[#87a0c2]">Select a variant to open the design inspector.</div>
                            )}
                        </div>
                    </section>
                </div>
                {instanceContextMenu ? (
                    <div
                        ref={contextMenuRef}
                        className="fixed z-[70] w-44 rounded-lg border border-white/12 bg-[#0d1728] p-1 shadow-[0_18px_34px_rgba(2,6,14,0.52)]"
                        style={{
                            left: Math.max(
                                8,
                                Math.min(instanceContextMenu.x, (typeof window === 'undefined' ? instanceContextMenu.x : window.innerWidth - 184)),
                            ),
                            top: Math.max(
                                8,
                                Math.min(instanceContextMenu.y, (typeof window === 'undefined' ? instanceContextMenu.y : window.innerHeight - 148)),
                            ),
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const target =
                                    instances.find((instance) => instance.id === instanceContextMenu.instanceId) ?? selectedInstance ?? instances[0];
                                if (target) {
                                    startRenameVariant(target);
                                }
                                setInstanceContextMenu(null);
                            }}
                            className="flex h-8 w-full items-center rounded-md px-2 text-left text-[12px] text-[#dbe8fa] transition hover:bg-white/[0.08]"
                        >
                            Rename
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                duplicateInstance(instanceContextMenu.instanceId);
                                setInstanceContextMenu(null);
                            }}
                            className="flex h-8 w-full items-center rounded-md px-2 text-left text-[12px] text-[#dbe8fa] transition hover:bg-white/[0.08]"
                        >
                            Duplicate
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                deleteInstance(instanceContextMenu.instanceId);
                                setInstanceContextMenu(null);
                            }}
                            className="flex h-8 w-full items-center rounded-md px-2 text-left text-[12px] text-[#ff9199] transition hover:bg-[#ff9199]/10"
                        >
                            Delete
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
