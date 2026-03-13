import { useState } from 'react';
import { getComponentSources } from '@/registry/components';
import { ComponentSource } from '@/components/docs/ComponentSource';
import { CodeBlock } from '@/components/docs/CodeBlock';
import type { RegistryComponent } from '@/registry/schema';

const T = {
    surface: '#141416',
    elevated: '#1a1a1d',
    text: '#f0ede8',
    textSec: '#9a9aa3',
    textMuted: '#6b6b72',
    brand: '#f5a623',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
} as const;

interface InstallationSectionProps {
    component: RegistryComponent;
}

function buildNpmInstallCommand(component: RegistryComponent): string {
    const deps = component.npmDependencies;
    if (!deps || Object.keys(deps).length === 0) return '';
    const pkgList = Object.keys(deps).join(' ');
    return `npm install ${pkgList}`;
}

export function InstallationSection({ component }: InstallationSectionProps) {
    const [tab, setTab] = useState<'cli' | 'manual'>('cli');

    const sources = getComponentSources(component.name);
    const installCmd = buildNpmInstallCommand(component);

    return (
        <div>
            {/* Tab bar */}
            <div
                className="flex gap-1 p-1 rounded-xl w-fit mb-4"
                style={{ background: T.elevated, border: `1px solid ${T.border}` }}
            >
                {(['cli', 'manual'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
                        style={{
                            background: tab === t ? T.surface : 'transparent',
                            color: tab === t ? T.text : T.textMuted,
                        }}
                    >
                        {t === 'cli' ? 'CLI' : 'Manual'}
                    </button>
                ))}
            </div>

            {tab === 'cli' && (
                <div className="space-y-3">
                    <p className="text-[13px]" style={{ color: T.textSec }}>
                        Run the following command in your project root:
                    </p>
                    <div
                        style={{
                            border: `1px solid ${T.border}`,
                            borderRadius: 12,
                            overflow: 'hidden',
                        }}
                    >
                        <CodeBlock
                            code={`npx ui-studio add ${component.name}`}
                            language="bash"
                            collapsible={false}
                            showLineNumbers={false}
                        />
                    </div>
                </div>
            )}

            {tab === 'manual' && (
                <div className="space-y-5">
                    {/* Step 1 – install deps */}
                    {installCmd && (
                        <div>
                            <p className="text-[13px] font-medium mb-2" style={{ color: T.text }}>
                                <span
                                    className="inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold mr-2"
                                    style={{ background: T.brand, color: '#0a0a0b' }}
                                >
                                    1
                                </span>
                                Install dependencies
                            </p>
                            <div
                                style={{
                                    border: `1px solid ${T.border}`,
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                }}
                            >
                                <CodeBlock
                                    code={installCmd}
                                    language="bash"
                                    collapsible={false}
                                    showLineNumbers={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2 – copy source files */}
                    {sources && Object.keys(sources).length > 0 && (
                        <div>
                            <p className="text-[13px] font-medium mb-2" style={{ color: T.text }}>
                                <span
                                    className="inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold mr-2"
                                    style={{ background: T.brand, color: '#0a0a0b' }}
                                >
                                    {installCmd ? '2' : '1'}
                                </span>
                                Copy source files
                            </p>
                            <div className="space-y-3">
                                {Object.entries(sources).map(([filename, code]) => (
                                    <ComponentSource
                                        key={filename}
                                        title={filename}
                                        code={code}
                                        language={filename.endsWith('.ts') ? 'typescript' : 'tsx'}
                                        maxHeight={280}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3 – update import paths */}
                    <div>
                        <p className="text-[13px] font-medium mb-2" style={{ color: T.text }}>
                            <span
                                className="inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold mr-2"
                                style={{ background: T.brand, color: '#0a0a0b' }}
                            >
                                {installCmd ? '3' : sources && Object.keys(sources).length > 0 ? '2' : '1'}
                            </span>
                            Update import paths
                        </p>
                        <p className="text-[13px]" style={{ color: T.textSec }}>
                            Adjust the import paths in the copied files to match your project structure. The default
                            target path is{' '}
                            <code
                                className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                                style={{ background: T.elevated, color: T.textSec }}
                            >
                                src/
                            </code>
                            .
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
