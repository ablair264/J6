import { useEffect, useRef, type ChangeEvent } from 'react';
import { Minus, RotateCcw } from 'lucide-react';
import { Delete, Plus, Sparkles } from '@mynaui/icons-react';
import { cn } from '@/lib/utils';
import {
    parseImportedTokenSet,
    SYSTEM_TOKEN_SET_ID,
    createTokenSetId,
    ensureTokenSetsWithSystem,
    normalizeHexColor,
} from '@/components/ui/token-sets';
import type { StudioSizeTokenKey, StudioTokenSet } from '@/components/ui/token-sets';
import {
    deleteTokenSetFromApi,
    upsertTokenSetToApi,
} from '@/lib/token-set-api';
import { resolveTokenToHex } from '../utilities';
import { useStudioStore, selectActiveTokenSet } from '../store';

const AUTO_SAVE_DELAY_MS = 2000;

export function TokenManager() {
    const tokenSets = useStudioStore((s) => s.tokenSets);
    const setTokenSets = useStudioStore((s) => s.setTokenSets);
    const activeTokenSetId = useStudioStore((s) => s.activeTokenSetId);
    const setActiveTokenSetId = useStudioStore((s) => s.setActiveTokenSetId);
    const tokenSyncMessage = useStudioStore((s) => s.tokenSyncMessage);
    const setTokenSyncMessage = useStudioStore((s) => s.setTokenSyncMessage);
    const tokensLoading = useStudioStore((s) => s.tokensLoading);
    const setTokensLoading = useStudioStore((s) => s.setTokensLoading);
    const setShowTokenManager = useStudioStore((s) => s.setShowTokenManager);
    const newSetName = useStudioStore((s) => s.newSetName);
    const setNewSetName = useStudioStore((s) => s.setNewSetName);
    const showNewSetInput = useStudioStore((s) => s.showNewSetInput);
    const setShowNewSetInput = useStudioStore((s) => s.setShowNewSetInput);
    const newTokenForm = useStudioStore((s) => s.newTokenForm);
    const setNewTokenForm = useStudioStore((s) => s.setNewTokenForm);
    const suggestPaletteColor = useStudioStore((s) => s.suggestPaletteColor);
    const setSuggestPaletteColor = useStudioStore((s) => s.setSuggestPaletteColor);
    const suggestingPalette = useStudioStore((s) => s.suggestingPalette);
    const setSuggestingPalette = useStudioStore((s) => s.setSuggestingPalette);
    const activeTokenSet = useStudioStore(selectActiveTokenSet);
    const importFileInputRef = useRef<HTMLInputElement | null>(null);

    // ─── Auto-save to Neon (debounced) ────────────────────────────────────
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        // Skip the initial render — only save on actual user changes
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            autoSaveTimerRef.current = null;
            const setToSave = activeTokenSet.source === 'system'
                ? { ...activeTokenSet, source: 'user' as const }
                : activeTokenSet;
            setTokenSyncMessage('Saving…');
            upsertTokenSetToApi(setToSave)
                .then(() => setTokenSyncMessage('Saved'))
                .catch(() => setTokenSyncMessage('Auto-save failed'));
        }, AUTO_SAVE_DELAY_MS);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [activeTokenSet, setTokenSyncMessage]);

    // ─── Token Actions ───────────────────────────────────────────────────

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
        setNewSetName('');
        setShowNewSetInput(false);
    };

    const updateActiveTokenValue = (tokenId: string, value: string) => {
        const normalized = normalizeHexColor(value);
        if (!normalized) return;
        setTokenSets((current) =>
            current.map((set) =>
                set.id === activeTokenSet.id
                    ? {
                        ...set,
                        tokens: set.tokens.map((token) =>
                            token.id === tokenId ? { ...token, value: normalized, cssVar: undefined } : token,
                        ),
                    }
                    : set,
            ),
        );
    };

    const updateActiveSizeToken = (size: StudioSizeTokenKey, field: 'height' | 'width', value: number) => {
        const sanitized = Math.max(0, Math.min(640, Math.round(value)));
        setTokenSets((current) =>
            current.map((set) => {
                if (set.id !== activeTokenSet.id) return set;
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
                    sizeTokens: { ...set.sizeTokens, [size]: { ...currentSize, height: sanitized } },
                };
            }),
        );
    };

    const addTokenToActiveSet = (id: string, label: string, hex: string) => {
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
        setTokenSets((current) =>
            current.map((set) =>
                set.id === activeTokenSet.id
                    ? { ...set, tokens: set.tokens.filter((token) => token.id !== tokenId) }
                    : set,
            ),
        );
    };

    const deleteActiveTokenSetFromNeon = async () => {
        if (activeTokenSet.source !== 'user') return;
        if (!window.confirm(`Delete token set "${activeTokenSet.name}"?`)) return;
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

    const resetSystemTokenSet = async () => {
        if (!window.confirm('Reset Tailwind System token set to defaults? Any saved customisations will be removed.')) return;
        setTokensLoading(true);
        try {
            await deleteTokenSetFromApi(SYSTEM_TOKEN_SET_ID).catch(() => { /* ignore if not saved */ });
            setTokenSets((current) => {
                const withoutSystem = current.filter((set) => set.id !== SYSTEM_TOKEN_SET_ID);
                return ensureTokenSetsWithSystem(withoutSystem);
            });
            setTokenSyncMessage('Tailwind System reset to defaults.');
        } catch {
            setTokenSyncMessage('Could not reset system token set.');
        } finally {
            setTokensLoading(false);
        }
    };

    const suggestPalette = async (primaryColor: string) => {
        setSuggestingPalette(true);
        setTokenSyncMessage('Generating palette\u2026');
        try {
            const res = await fetch('/api/suggest-palette', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primaryColor }),
            });
            const data = await res.json() as { palette?: Record<string, string>; error?: string };
            if (!res.ok || !data.palette) {
                setTokenSyncMessage(data.error ?? 'Failed to generate palette');
                return;
            }
            setTokenSets((current) =>
                current.map((set) => {
                    if (set.id !== activeTokenSetId) return set;
                    const updatedTokens = set.tokens.map((token) => {
                        const suggested = data.palette![token.id];
                        if (!suggested) return token;
                        const validated = normalizeHexColor(suggested);
                        if (!validated) return token;
                        return { ...token, value: validated, cssVar: undefined };
                    });
                    return { ...set, tokens: updatedTokens };
                }),
            );
            setTokenSyncMessage('Palette applied!');
        } catch {
            setTokenSyncMessage('Could not reach palette suggestion service.');
        } finally {
            setSuggestingPalette(false);
        }
    };

    const importTokenFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;
        setTokensLoading(true);
        setTokenSyncMessage('Importing token set…');
        try {
            const content = await file.text();
            const parsed = parseImportedTokenSet(content, file.name);
            if (!parsed) {
                setTokenSyncMessage('Could not parse token file. Use CSS variables or JSON token maps.');
                return;
            }
            const nextSet = parsed.tokenSet;
            setTokenSets((current) =>
                ensureTokenSetsWithSystem([
                    ...current.filter((set) => set.id !== nextSet.id),
                    nextSet,
                ]),
            );
            setActiveTokenSetId(nextSet.id);
            setTokenSyncMessage(`Imported ${nextSet.tokens.length} tokens from ${parsed.format.toUpperCase()}.`);
        } catch {
            setTokenSyncMessage('Could not read selected file.');
        } finally {
            setTokensLoading(false);
            event.currentTarget.value = '';
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────

    return (
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
                                placeholder="Set name\u2026"
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
                        <div className="mt-1 flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => setShowNewSetInput(true)}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#7188a8] transition hover:bg-white/[0.05] hover:text-[#9bb0cc]"
                            >
                                <Plus className="size-3" />
                                New set
                            </button>
                            <button
                                type="button"
                                onClick={() => importFileInputRef.current?.click()}
                                className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#7188a8] transition hover:bg-white/[0.05] hover:text-[#9bb0cc]"
                            >
                                <Plus className="size-3" />
                                Import CSS/JSON
                            </button>
                            <input
                                ref={importFileInputRef}
                                type="file"
                                accept=".css,.json,text/css,application/json"
                                className="hidden"
                                onChange={(event) => void importTokenFile(event)}
                            />
                        </div>
                    )}

                    {/* Set actions */}
                    <div className="mt-auto flex flex-col gap-1 pt-3 border-t border-white/8">
                        {activeTokenSet.id === SYSTEM_TOKEN_SET_ID ? (
                            <button
                                type="button"
                                onClick={() => void resetSystemTokenSet()}
                                disabled={tokensLoading}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#8da4c3] transition hover:bg-white/[0.05] hover:text-[#dbe8fb] disabled:opacity-50"
                            >
                                <RotateCcw className="size-3" />
                                Reset to defaults
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => void deleteActiveTokenSetFromNeon()}
                                disabled={tokensLoading}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-[#ff7d87] transition hover:bg-[#ff7d87]/10 disabled:opacity-50"
                            >
                                <Delete className="size-3" />
                                Delete set
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: token editor */}
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 gap-6">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7188a8]">Colour Tokens</p>
                            <div className="flex items-center gap-1">
                                {/* AI Suggest Palette */}
                                <div className="relative flex items-center">
                                    <label className="relative flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#63e8da] transition hover:bg-[#63e8da]/10 cursor-pointer" title="AI-suggest palette from a primary colour">
                                        <span
                                            className="block size-3.5 rounded-sm border border-white/20 shrink-0"
                                            style={{ background: suggestPaletteColor }}
                                        />
                                        <input
                                            type="color"
                                            value={suggestPaletteColor}
                                            onChange={(e) => setSuggestPaletteColor(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        disabled={suggestingPalette}
                                        onClick={() => void suggestPalette(suggestPaletteColor)}
                                        className="flex items-center gap-1.5 rounded-lg bg-[#63e8da]/12 px-3 py-1.5 text-xs font-medium text-[#63e8da] shadow-[inset_0_0_0_1px_rgba(99,232,218,0.2)] transition hover:bg-[#63e8da]/20 hover:shadow-[inset_0_0_0_1px_rgba(99,232,218,0.35)] disabled:opacity-50"
                                        title="Generate AI palette from selected colour"
                                    >
                                        {suggestingPalette
                                            ? <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                            : <Sparkles className="size-3.5" />
                                        }
                                        AI Suggest
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNewTokenForm({ id: '', label: '', hex: '#22d3ee' })}
                                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[#8da4c3] transition hover:bg-white/[0.05] hover:text-[#dbe8fb]"
                                >
                                    <Plus className="size-3" />
                                    Add token
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {activeTokenSet.tokens.map((token) => {
                                const hexVal = resolveTokenToHex(token) ?? token.value ?? '#000000';
                                return (
                                    <div key={token.id} className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/[0.1]">
                                        <label className="relative shrink-0 cursor-pointer" title="Click to change colour">
                                            <span className="block size-7 rounded-lg border border-white/10 shadow-sm" style={{ background: hexVal }} />
                                            <input
                                                type="color"
                                                value={hexVal.slice(0, 7)}
                                                onChange={(e) => updateActiveTokenValue(token.id, e.target.value)}
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                        </label>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-[#dbe8fb]">{token.label}</p>
                                            <p className="font-mono text-[10px] text-[#7188a8]">{token.id}</p>
                                        </div>
                                        <input
                                            type="text"
                                            value={hexVal}
                                            onChange={(e) => updateActiveTokenValue(token.id, e.target.value)}
                                            className="w-20 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-[#9bb0cc] outline-none focus:border-[#63e8da]/40 focus:text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTokenFromActiveSet(token.id)}
                                            className="shrink-0 rounded-md p-1 text-white/20 opacity-0 transition group-hover:opacity-100 hover:bg-[#ff7d87]/10 hover:text-[#ff7d87]"
                                        >
                                            <Delete className="size-3.5" />
                                        </button>
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
                                                onChange={(e) => { if (newTokenForm) setNewTokenForm({ ...newTokenForm, hex: e.target.value }); }}
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                        </label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="token-id"
                                            value={newTokenForm.id}
                                            onChange={(e) => { if (newTokenForm) setNewTokenForm({ ...newTokenForm, id: e.target.value }); }}
                                            className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1.5 font-mono text-xs text-white placeholder-white/30 outline-none focus:border-[#63e8da]/40"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Label"
                                            value={newTokenForm.label}
                                            onChange={(e) => { if (newTokenForm) setNewTokenForm({ ...newTokenForm, label: e.target.value }); }}
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
                                return (
                                    <div key={size} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                                        <span className="w-6 text-center text-[11px] font-bold uppercase text-[#7188a8]">{size}</span>
                                        <div className="flex flex-1 items-center gap-2">
                                            <label className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-[#7188a8]">H</span>
                                                <input
                                                    type="number"
                                                    min={20}
                                                    max={640}
                                                    value={st.height}
                                                    onChange={(e) => updateActiveSizeToken(size, 'height', Number(e.target.value))}
                                                    className="w-16 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-xs text-white outline-none focus:border-[#63e8da]/40"
                                                />
                                            </label>
                                            <label className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-[#7188a8]">W</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={640}
                                                    value={st.width ?? 0}
                                                    onChange={(e) => updateActiveSizeToken(size, 'width', Number(e.target.value))}
                                                    className="w-16 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-xs text-white outline-none focus:border-[#63e8da]/40"
                                                    placeholder="auto"
                                                />
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
    );
}
