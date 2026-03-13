import { useNavigate } from 'react-router-dom';
import { getBuilderRegistryComponent } from '@/registry/components';
import { generatedProps } from '@/registry/generated-props';
import { ComponentPreview } from '@/components/docs/ComponentPreview';
import { PropsTable } from './PropsTable';
import { InstallationSection } from './InstallationSection';
import type { LibraryExample } from './examples';

const T = {
    bg: '#0a0a0b',
    subtle: '#111113',
    surface: '#141416',
    elevated: '#1a1a1d',
    text: '#f0ede8',
    textSec: '#9a9aa3',
    textMuted: '#6b6b72',
    brand: '#f5a623',
    brandHover: '#ffba4a',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
} as const;

interface DetailPageProps {
    slug: string;
    examples: LibraryExample[];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="text-[15px] font-semibold mb-4"
            style={{ color: T.text }}
        >
            {children}
        </h2>
    );
}

export function DetailPage({ slug, examples }: DetailPageProps) {
    const navigate = useNavigate();
    const component = getBuilderRegistryComponent(slug);
    const props = generatedProps[slug] ?? [];

    if (!component) {
        return (
            <div className="p-8 lg:p-12">
                <p style={{ color: T.textMuted }}>Component &quot;{slug}&quot; is not available in the builder library.</p>
            </div>
        );
    }

    const defaultExample = examples[0];
    const additionalExamples = examples.slice(1);

    return (
        <div className="p-8 lg:p-12 max-w-4xl">
            {/* Back link */}
            <button
                onClick={() => navigate('/library')}
                className="flex items-center gap-1.5 text-[13px] mb-6 transition-colors"
                style={{ color: T.textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.brand)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                Back to Components
            </button>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: T.text }}>
                    {component.label}
                </h1>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: T.textSec }}>
                    {component.description}
                </p>
                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: `${T.brand}15`, color: T.brand }}
                    >
                        {component.category}
                    </span>
                    {component.npmDependencies &&
                        Object.keys(component.npmDependencies).map((dep) => (
                            <span
                                key={dep}
                                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono"
                                style={{ background: T.elevated, color: T.textSec, border: `1px solid ${T.border}` }}
                            >
                                {dep}
                            </span>
                        ))}
                </div>
            </div>

            {/* Default preview */}
            {defaultExample && (
                <div className="mb-12">
                    <ComponentPreview code={defaultExample.code}>
                        {defaultExample.preview}
                    </ComponentPreview>
                </div>
            )}

            {/* Installation */}
            <section className="mb-12">
                <SectionHeading>Installation</SectionHeading>
                <InstallationSection component={component} />
            </section>

            {/* Usage */}
            {defaultExample && (
                <section className="mb-12">
                    <SectionHeading>Usage</SectionHeading>
                    <p className="text-[13px] mb-4" style={{ color: T.textSec }}>
                        Import the component and use it in your React application.
                    </p>
                    <div
                        style={{
                            border: `1px solid ${T.border}`,
                            borderRadius: 12,
                            overflow: 'hidden',
                        }}
                    >
                        <pre
                            className="p-4 text-[13px] font-mono leading-relaxed overflow-x-auto"
                            style={{ background: T.subtle, color: T.textSec }}
                        >
                            {`import { ${component.label.replace(/\s+/g, '')} } from '@/components/ui/${component.name}';`}
                        </pre>
                    </div>
                </section>
            )}

            {/* Additional examples */}
            {additionalExamples.length > 0 && (
                <section className="mb-12">
                    <SectionHeading>Examples</SectionHeading>
                    <div className="space-y-8">
                        {additionalExamples.map((ex, i) => (
                            <ExampleItem key={i} example={ex} />
                        ))}
                    </div>
                </section>
            )}

            {/* API Reference */}
            {props.length > 0 && (
                <section className="mb-12">
                    <SectionHeading>API Reference</SectionHeading>
                    <PropsTable props={props} />
                </section>
            )}
        </div>
    );
}

function ExampleItem({ example }: { example: LibraryExample }) {
    return (
        <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: T.textSec }}>
                {example.title}
            </p>
            <ComponentPreview code={example.code}>
                {example.preview}
            </ComponentPreview>
        </div>
    );
}
