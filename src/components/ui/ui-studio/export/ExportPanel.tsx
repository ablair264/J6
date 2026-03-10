import { useMemo } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    useStudioStore,
    selectSelectedInstance,
    selectActiveTokenSet,
} from '../store';
import type { CodePanelTab, ExportStyleMode } from '../store';
import {
    buildExportComponentName,
    buildPreviewPresentation,
    downloadSnippetFile,
    sanitizeFileSegment,
    supportsEntryMotion,
    toPascalCase,
} from '../utilities';
import {
    buildSnippetForInstance,
    buildNamedSnippetForInstance,
    buildMultiVariantBundle,
    buildTailwindThemeStyles,
} from './code-generators';

const studioActionButtonClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-[#b7c8df] transition hover:bg-white/[0.1] hover:text-[#eef5ff]';

export function ExportPanel() {
    const exportStyleMode = useStudioStore((s) => s.exportStyleMode);
    const setExportStyleMode = useStudioStore((s) => s.setExportStyleMode);
    const copiedCode = useStudioStore((s) => s.copiedCode);
    const setCopiedCode = useStudioStore((s) => s.setCopiedCode);
    const exportedCode = useStudioStore((s) => s.exportedCode);
    const setExportedCode = useStudioStore((s) => s.setExportedCode);
    const codePanelTab = useStudioStore((s) => s.codePanelTab);
    const setCodePanelTab = useStudioStore((s) => s.setCodePanelTab);
    const activeKind = useStudioStore((s) => s.activeKind);
    const instances = useStudioStore((s) => s.instances);
    const activeTokenSetId = useStudioStore((s) => s.activeTokenSetId);
    const tokenSets = useStudioStore((s) => s.tokenSets);
    const selectedInstance = useStudioStore(selectSelectedInstance);
    const activeTokenSet = useStudioStore(selectActiveTokenSet);

    const activeSnippet = useMemo(
        () =>
            selectedInstance
                ? buildSnippetForInstance(selectedInstance, exportStyleMode, activeTokenSet)
                : '// Select a variant to generate code.',
        [selectedInstance, exportStyleMode, activeTokenSet],
    );

    const activeNamedSnippet = useMemo(
        () =>
            selectedInstance
                ? buildNamedSnippetForInstance(selectedInstance, exportStyleMode, activeTokenSet)
                : '// Select a variant to generate a named component.',
        [selectedInstance, exportStyleMode, activeTokenSet],
    );

    const allExportsSnippet = useMemo(
        () => buildMultiVariantBundle(instances, activeKind, exportStyleMode, activeTokenSetId, tokenSets),
        [instances, activeKind, exportStyleMode, activeTokenSetId, tokenSets],
    );

    const tailwindThemeSnippet = useMemo(
        () => buildTailwindThemeStyles(activeTokenSet, instances),
        [activeTokenSet, instances],
    );

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
            ? `ui-studio-${sanitizeFileSegment(activeKind)}-${sanitizeFileSegment(selectedInstance?.name ?? 'variant')}${styleModeSuffix}.tsx`
            : codePanelTab === 'named'
                ? `${selectedInstance ? buildExportComponentName(selectedInstance) : `${toPascalCase(activeKind)}Variant`}${styleModeSuffix}.tsx`
                : codePanelTab === 'theme'
                    ? 'ui-studio.theme.css'
                    : 'ui-studio-design-bundle.json';

    const tabDescription =
        codePanelTab === 'snippet'
            ? 'Quick snippet for an existing file in this project.'
            : codePanelTab === 'named'
                ? 'Reusable React component file for this project.'
                : codePanelTab === 'theme'
                    ? 'Theme CSS for the selected token set only.'
                    : 'Studio data for re-opening this design in UI Studio later.';

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

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div className="mr-3 min-w-[220px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6f86a7]">Export For</div>
                    <div className="mt-1 text-[13px] font-semibold text-[#eaf2ff]">This Project</div>
                    <div className="mt-0.5 text-[11px] leading-relaxed text-[#8fa6c7]">
                        Generated components reference this project&apos;s existing UI primitives.
                    </div>
                </div>
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
                        Quick Snippet
                    </TabsTrigger>
                    <TabsTrigger
                        value="named"
                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                    >
                        Component File
                    </TabsTrigger>
                    <TabsTrigger
                        value="exports"
                        className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                    >
                        Studio Bundle
                    </TabsTrigger>
                    {exportStyleMode === 'tailwind' ? (
                        <TabsTrigger
                            value="theme"
                            className="text-[12px] font-semibold text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]"
                        >
                            Theme Tokens
                        </TabsTrigger>
                    ) : null}
                </TabsList>
                <p className="pt-3 text-[11px] leading-relaxed text-[#8fa6c7]">{tabDescription}</p>
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
    );
}
