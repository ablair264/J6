import { useMemo } from 'react';
import { Check, Copy, Download, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    useStudioStore,
    selectSelectedInstance,
    selectActiveTokenSet,
} from '../store';
import type { CodePanelTab, CodeExportMode } from '../store';
import {
    buildExportComponentName,
    downloadSnippetFile,
    sanitizeFileSegment,
    toPascalCase,
} from '../utilities';
import {
    buildSnippetForInstance,
    buildNamedSnippetForInstance,
    buildCSSExport,
    buildMultiVariantBundle,
    buildTailwindThemeStyles,
} from './code-generators';

const actionIconBtnClass =
    'inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[#8fa6c7] transition hover:bg-white/[0.1] hover:text-[#eef5ff]';
const exportTabTriggerClass =
    'min-w-0 whitespace-normal px-3 py-1.5 text-center text-[11px] font-semibold leading-tight text-[#8fa6c7] data-[state=active]:text-[#eaf2ff] data-[state=active]:after:bg-[#63e8da]';
const exportPreClass =
    'h-full min-h-[260px] overflow-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] pt-3 text-[11px] leading-relaxed text-[#bfd1ec]';

export function ExportPanel() {
    const exportStyleMode = useStudioStore((s) => s.exportStyleMode);
    const setExportStyleMode = useStudioStore((s) => s.setExportStyleMode);
    const copiedCode = useStudioStore((s) => s.copiedCode);
    const setCopiedCode = useStudioStore((s) => s.setCopiedCode);
    const exportedCode = useStudioStore((s) => s.exportedCode);
    const setExportedCode = useStudioStore((s) => s.setExportedCode);
    const codePanelTab = useStudioStore((s) => s.codePanelTab);
    const setCodePanelTab = useStudioStore((s) => s.setCodePanelTab);
    const codeExportMode = useStudioStore((s) => s.codeExportMode);
    const setCodeExportMode = useStudioStore((s) => s.setCodeExportMode);
    const activeKind = useStudioStore((s) => s.activeKind);
    const instances = useStudioStore((s) => s.instances);
    const activeTokenSetId = useStudioStore((s) => s.activeTokenSetId);
    const tokenSets = useStudioStore((s) => s.tokenSets);
    const selectedInstance = useStudioStore(selectSelectedInstance);
    const activeTokenSet = useStudioStore(selectActiveTokenSet);

    const cssExport = useMemo(
        () =>
            selectedInstance
                ? buildCSSExport(selectedInstance, activeTokenSet)
                : '/* Select a variant to generate CSS. */',
        [selectedInstance, activeTokenSet],
    );

    const tailwindSnippet = useMemo(
        () =>
            selectedInstance
                ? buildSnippetForInstance(selectedInstance, 'tailwind', activeTokenSet)
                : '// Select a variant to generate code.',
        [selectedInstance, activeTokenSet],
    );

    const namedSnippet = useMemo(
        () =>
            selectedInstance
                ? buildNamedSnippetForInstance(selectedInstance, exportStyleMode, activeTokenSet)
                : '// Select a variant to generate a component.',
        [selectedInstance, exportStyleMode, activeTokenSet],
    );

    const tailwindThemeSnippet = useMemo(
        () => buildTailwindThemeStyles(activeTokenSet, instances),
        [activeTokenSet, instances],
    );

    const bundleSnippet = useMemo(
        () => buildMultiVariantBundle(instances, activeKind, exportStyleMode, activeTokenSetId, tokenSets),
        [instances, activeKind, exportStyleMode, activeTokenSetId, tokenSets],
    );

    const activeCodeSnippet = codePanelTab === 'theme'
        ? tailwindThemeSnippet
        : codeExportMode === 'snippet'
            ? (exportStyleMode === 'inline' ? cssExport : tailwindSnippet)
            : namedSnippet;

    const styleModeSuffix = exportStyleMode === 'tailwind' ? '-tailwind' : '';
    const activeCodeFilename = codePanelTab === 'theme'
        ? 'ui-studio.theme.css'
        : codeExportMode === 'snippet'
            ? exportStyleMode === 'inline'
                ? `ui-studio-${sanitizeFileSegment(activeKind)}-${sanitizeFileSegment(selectedInstance?.name ?? 'variant')}.css`
                : `ui-studio-${sanitizeFileSegment(activeKind)}-${sanitizeFileSegment(selectedInstance?.name ?? 'variant')}${styleModeSuffix}.tsx`
            : `${selectedInstance ? buildExportComponentName(selectedInstance) : `${toPascalCase(activeKind)}Variant`}${styleModeSuffix}.tsx`;

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

    const saveBundleToFile = () => {
        downloadSnippetFile('ui-studio-design-bundle.json', bundleSnippet);
        setExportedCode(true);
        window.setTimeout(() => setExportedCode(false), 1200);
    };

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Header: style toggle + actions in one compact row */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <div className="inline-flex rounded-sm bg-[#0d0f12] p-0.5">
                    <button
                        type="button"
                        onClick={() => setExportStyleMode('inline')}
                        className={cn(
                            'rounded px-2 py-0.5 text-[12px] font-semibold transition',
                            exportStyleMode === 'inline' ? 'bg-white/[0.16] text-[#eaf3ff]' : 'text-[#92a7c5] hover:text-[#e6f0ff]',
                        )}
                    >
                        CSS
                    </button>
                    <button
                        type="button"
                        onClick={() => setExportStyleMode('tailwind')}
                        className={cn(
                            'rounded px-2 py-0.5 text-[12px] font-semibold transition',
                            exportStyleMode === 'tailwind' ? 'bg-white/[0.16] text-[#eaf3ff]' : 'text-[#92a7c5] hover:text-[#e6f0ff]',
                        )}
                    >
                        Tailwind
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => void copyCode(activeCodeSnippet)}
                        className={actionIconBtnClass}
                        title={copiedCode ? 'Copied!' : 'Copy code'}
                    >
                        {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => exportCode(activeCodeFilename, activeCodeSnippet)}
                        className={actionIconBtnClass}
                        title={exportedCode ? 'Exported!' : 'Download file'}
                    >
                        {exportedCode ? <Check className="size-3.5" /> : <Download className="size-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={saveBundleToFile}
                        className={actionIconBtnClass}
                        title="Save studio bundle"
                    >
                        <Save className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={codePanelTab} onValueChange={(value) => setCodePanelTab(value as CodePanelTab)} className="min-h-0 min-w-0 flex-1 px-4 pb-3">
                <TabsList variant="line" className="flex w-full items-stretch justify-start border-b border-white/10">
                    <TabsTrigger value="code" className={exportTabTriggerClass}>
                        Code
                    </TabsTrigger>
                    {exportStyleMode === 'tailwind' ? (
                        <TabsTrigger value="theme" className={exportTabTriggerClass}>
                            Theme
                        </TabsTrigger>
                    ) : null}
                </TabsList>

                <TabsContent value="code" className="min-h-0 min-w-0">
                    {/* Snippet / Component sub-toggle */}
                    <div className="flex items-center gap-2 pb-1 pt-2.5">
                        <div className="inline-flex rounded-sm bg-[#0d0f12] p-0.5">
                            <button
                                type="button"
                                onClick={() => setCodeExportMode('snippet')}
                                className={cn(
                                    'rounded px-2 py-0.5 text-[10px] font-medium transition',
                                    codeExportMode === 'snippet' ? 'bg-white/[0.12] text-[#eaf3ff]' : 'text-[#7a94b5] hover:text-[#c5d6ea]',
                                )}
                            >
                                Snippet
                            </button>
                            <button
                                type="button"
                                onClick={() => setCodeExportMode('component')}
                                className={cn(
                                    'rounded px-2 py-0.5 text-[10px] font-medium transition',
                                    codeExportMode === 'component' ? 'bg-white/[0.12] text-[#eaf3ff]' : 'text-[#7a94b5] hover:text-[#c5d6ea]',
                                )}
                            >
                                Component
                            </button>
                        </div>
                    </div>
                    <pre className={exportPreClass}>
                        <code>{codePanelTab === 'code' ? activeCodeSnippet : ''}</code>
                    </pre>
                </TabsContent>
                <TabsContent value="theme" className="min-h-0 min-w-0">
                    <pre className={cn(exportPreClass, 'pt-2.5')}>
                        <code>{tailwindThemeSnippet}</code>
                    </pre>
                </TabsContent>
            </Tabs>
        </div>
    );
}
