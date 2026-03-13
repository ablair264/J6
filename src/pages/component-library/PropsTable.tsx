import type { RegistryProp } from '@/registry/schema';

const T = {
    bg: '#0a0a0b',
    surface: '#141416',
    elevated: '#1a1a1d',
    text: '#f0ede8',
    textSec: '#9a9aa3',
    textMuted: '#6b6b72',
    brand: '#f5a623',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
    plasma: '#818cf8',
} as const;

interface PropsTableProps {
    props: RegistryProp[];
}

export function PropsTable({ props }: PropsTableProps) {
    if (!props || props.length === 0) {
        return (
            <p className="text-[13px]" style={{ color: T.textMuted }}>
                No props documented for this component.
            </p>
        );
    }

    return (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: T.elevated }}>
                        {['Prop', 'Type', 'Default', 'Description'].map((col) => (
                            <th
                                key={col}
                                style={{
                                    padding: '10px 16px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: T.textMuted,
                                    borderBottom: `1px solid ${T.border}`,
                                }}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {props.map((prop, i) => (
                        <tr
                            key={prop.name}
                            style={{
                                background: i % 2 === 0 ? T.bg : T.surface,
                                borderBottom: i < props.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}
                        >
                            <td style={{ padding: '10px 16px', verticalAlign: 'top' }}>
                                <span className="font-mono text-[12px]" style={{ color: T.text }}>
                                    {prop.name}
                                </span>
                                {prop.required && (
                                    <span
                                        className="ml-1 text-[11px]"
                                        style={{ color: T.brand }}
                                        title="Required"
                                    >
                                        *
                                    </span>
                                )}
                            </td>
                            <td style={{ padding: '10px 16px', verticalAlign: 'top' }}>
                                <code
                                    className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                                    style={{
                                        background: `${T.plasma}15`,
                                        color: T.plasma,
                                    }}
                                >
                                    {prop.type}
                                </code>
                            </td>
                            <td style={{ padding: '10px 16px', verticalAlign: 'top' }}>
                                {prop.defaultValue ? (
                                    <code
                                        className="font-mono text-[12px] px-1.5 py-0.5 rounded"
                                        style={{
                                            background: T.elevated,
                                            color: T.textSec,
                                        }}
                                    >
                                        {prop.defaultValue}
                                    </code>
                                ) : (
                                    <span style={{ color: T.textMuted }}>—</span>
                                )}
                            </td>
                            <td style={{ padding: '10px 16px', verticalAlign: 'top', fontSize: 13, color: T.textSec }}>
                                {prop.description ?? '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
