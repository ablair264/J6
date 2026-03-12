import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Minus } from 'lucide-react';
import {
    Home,
    Pencil,
    Plus,
    Power,
    Search,
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
import { cn } from '@/lib/utils';
import type { UIComponentKind } from '@/components/ui/ui-studio.types';
import { COMPONENTS } from '../constants';
import {
    buildKindTitle,
    buildPreviewPresentation,
    supportsEntryMotion,
} from '../utilities';
import { renderWithMotionControls } from '../motion';
import { renderPreview } from '../preview';
import {
    useStudioStore,
    selectSelectedInstance,
} from '../store';

const studioInputClass =
    'h-8 w-full rounded-lg bg-[#0e182a] px-2.5 text-[11px] text-[#e6f0ff] outline-none ring-1 ring-inset ring-white/12 transition placeholder:text-[#5f7597] focus:ring-[#63e8da]/45';
const studioSectionTitleClass = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8da4c3]';

export function Sidebar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const profileMenuOpen = useStudioStore((s) => s.profileMenuOpen);
    const setProfileMenuOpen = useStudioStore((s) => s.setProfileMenuOpen);
    const componentPickerOpen = useStudioStore((s) => s.componentPickerOpen);
    const setComponentPickerOpen = useStudioStore((s) => s.setComponentPickerOpen);
    const componentPickerQuery = useStudioStore((s) => s.componentPickerQuery);
    const setComponentPickerQuery = useStudioStore((s) => s.setComponentPickerQuery);
    const selectedInstanceId = useStudioStore((s) => s.selectedInstanceId);
    const setSelectedInstanceId = useStudioStore((s) => s.setSelectedInstanceId);
    const instances = useStudioStore((s) => s.instances);
    const editingVariantId = useStudioStore((s) => s.editingVariantId);
    const setEditingVariantId = useStudioStore((s) => s.setEditingVariantId);
    const editingVariantName = useStudioStore((s) => s.editingVariantName);
    const setEditingVariantName = useStudioStore((s) => s.setEditingVariantName);
    const hoverPreviewInstanceId = useStudioStore((s) => s.hoverPreviewInstanceId);
    const setHoverPreviewInstanceId = useStudioStore((s) => s.setHoverPreviewInstanceId);
    const instanceContextMenu = useStudioStore((s) => s.instanceContextMenu);
    const setInstanceContextMenu = useStudioStore((s) => s.setInstanceContextMenu);
    const showCanvasGrid = useStudioStore((s) => s.showCanvasGrid);
    const canvasBackgroundStore = useStudioStore((s) => s.canvasBackground);
    const studioTheme = useStudioStore((s) => s.studioTheme);
    const addInstance = useStudioStore((s) => s.addInstance);
    const deleteInstance = useStudioStore((s) => s.deleteInstance);
    const duplicateInstance = useStudioStore((s) => s.duplicateInstance);
    const updateInstanceName = useStudioStore((s) => s.updateInstanceName);
    const setInspectorTab = useStudioStore((s) => s.setInspectorTab);
    const setShowTokenManager = useStudioStore((s) => s.setShowTokenManager);
    const setShowProfile = useStudioStore((s) => s.setShowProfile);
    const setRightSidebarTab = useStudioStore((s) => s.setRightSidebarTab);
    const setProfileMenuOpenStore = useStudioStore((s) => s.setProfileMenuOpen);
    const setProfileName = useStudioStore((s) => s.setProfileName);
    const setProfileAvatarPreview = useStudioStore((s) => s.setProfileAvatarPreview);
    const setProfileAvatarBase64 = useStudioStore((s) => s.setProfileAvatarBase64);
    const setProfileError = useStudioStore((s) => s.setProfileError);
    const selectedInstance = useStudioStore(selectSelectedInstance);

    const componentSearchRef = useRef<HTMLInputElement | null>(null);
    const hoverPreviewTimerRef = useRef<number | null>(null);
    const contextMenuRef = useRef<HTMLDivElement | null>(null);
    const renameInputRef = useRef<HTMLInputElement | null>(null);
    const renameOpenedAt = useRef(0);

    const defaultCanvasBg = studioTheme === 'dark' ? '#101a2d' : '#f3f7ff';
    const canvasBackground = canvasBackgroundStore || defaultCanvasBg;
    const canvasDotColor = studioTheme === 'dark' ? 'rgba(126, 255, 237, 0.09)' : 'rgba(31, 56, 94, 0.16)';

    const componentUsage = useMemo(() => {
        const usage = new Map<UIComponentKind, number>();
        for (const instance of instances) {
            usage.set(instance.kind, (usage.get(instance.kind) ?? 0) + 1);
        }
        return usage;
    }, [instances]);

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

    // Focus search input when picker opens
    useEffect(() => {
        if (!componentPickerOpen) return;
        const timeoutId = window.setTimeout(() => {
            componentSearchRef.current?.focus();
            componentSearchRef.current?.select();
        }, 40);
        return () => window.clearTimeout(timeoutId);
    }, [componentPickerOpen]);

    // Keyboard shortcut: Cmd+K for component picker
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setComponentPickerOpen((current: boolean) => !current);
            }
            if (event.key === 'Escape') {
                setComponentPickerOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setComponentPickerOpen]);

    // Cleanup hover timer
    useEffect(() => {
        return () => {
            if (hoverPreviewTimerRef.current !== null) {
                window.clearTimeout(hoverPreviewTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!editingVariantId) return;
        const frameId = window.requestAnimationFrame(() => {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        });
        return () => window.cancelAnimationFrame(frameId);
    }, [editingVariantId]);

    // Context menu close handlers
    useEffect(() => {
        if (!instanceContextMenu) return;

        const closeContextMenu = () => setInstanceContextMenu(null);
        const handlePointerDown = (event: MouseEvent) => {
            if (contextMenuRef.current?.contains(event.target as Node)) return;
            closeContextMenu();
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeContextMenu();
        };
        const handleScroll = () => closeContextMenu();

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('keydown', handleEscape);
        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [instanceContextMenu, setInstanceContextMenu]);

    const queueHoverPreview = (instanceId: string) => {
        if (instanceContextMenu) return;
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

    const startRenameVariant = (instance: { id: string; name: string }) => {
        renameOpenedAt.current = Date.now();
        setSelectedInstanceId(instance.id);
        setEditingVariantId(instance.id);
        setEditingVariantName(instance.name);
    };

    const commitRenameVariant = (instanceId: string) => {
        if (Date.now() - renameOpenedAt.current < 100) return;
        const trimmed = editingVariantName.trim();
        if (trimmed.length > 0) {
            updateInstanceName(instanceId, trimmed);
        }
        setEditingVariantId(null);
        setEditingVariantName('');
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

    return (
        <>
            <aside className="ui-studio-sidebar flex min-h-0 flex-col overflow-hidden bg-[rgba(8,14,25,0.76)] backdrop-blur-xl xl:border-r xl:border-white/8">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
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
                                                setShowProfile(false);
                                                setRightSidebarTab('inspector');
                                                setProfileMenuOpen(false);
                                            }}
                                            className="flex h-7 w-full items-center gap-2.5 rounded-md px-2 transition hover:bg-white/[0.05]"
                                        >
                                            <Pencil className="size-4 text-[#8da4c3]" />
                                            Token Sets
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                setShowTokenManager(false);
                                                setProfileName(user?.name ?? '');
                                                setProfileAvatarPreview(user?.avatar_url ?? null);
                                                setProfileAvatarBase64(undefined);
                                                setProfileError(null);
                                                setShowProfile(true);
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
                                        <p className="px-2 py-3 text-[11px] text-[#8ba2c1]">No component matches &quot;{componentPickerQuery}&quot;.</p>
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
                                                                instance.kind !== 'switch',
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        {isEditing ? (
                                                            <input
                                                                ref={renameInputRef}
                                                                value={editingVariantName}
                                                                onChange={(event) => setEditingVariantName(event.target.value)}
                                                                onBlur={() => commitRenameVariant(instance.id)}
                                                                onMouseDown={(event) => event.stopPropagation()}
                                                                onClick={(event) => event.stopPropagation()}
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
                                                                className={cn(studioInputClass, 'h-7')}
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
                                                            instance.kind !== 'switch',
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

            {/* Context menu */}
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
        </>
    );
}
