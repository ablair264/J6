import { useMemo } from 'react';

type LoaderNode = { col: number; row: number };

const SVG_LAYOUT_PATH: LoaderNode[] = [
    { col: 1, row: 0 }, // 353, 346
    { col: 2, row: 0 }, // 546, 346
    { col: 2, row: 1 }, // 546, 539.5
    { col: 3, row: 1 }, // 740, 539.5
    { col: 3, row: 2 }, // 740, 733
    { col: 2, row: 2 }, // 546, 733
    { col: 1, row: 2 }, // 353, 733
    { col: 0, row: 2 }, // 159, 733
    { col: 1, row: 1 }, // 353, 539.5
];

const SQUARE_SIZE = 28;
const STEP_SIZE = 32;
const LOOP_DURATION_SECONDS = 10;

function buildPathKeyframes(path: LoaderNode[]): string {
    const stepPercent = 100 / path.length;
    const frames = path.map((node, index) => {
        const pct = (index * stepPercent).toFixed(4);
        return `${pct}% { transform: translate(${node.col * STEP_SIZE}px, ${node.row * STEP_SIZE}px); }`;
    });
    const first = path[0];
    frames.push(`100% { transform: translate(${first.col * STEP_SIZE}px, ${first.row * STEP_SIZE}px); }`);
    return frames.join('\n');
}

export function SvgLayoutLoader() {
    const bounds = useMemo(() => {
        const cols = SVG_LAYOUT_PATH.map((node) => node.col);
        const rows = SVG_LAYOUT_PATH.map((node) => node.row);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        return {
            width: ((maxCol - minCol) * STEP_SIZE) + SQUARE_SIZE,
            height: ((maxRow - minRow) * STEP_SIZE) + SQUARE_SIZE,
        };
    }, []);

    const keyframes = useMemo(() => buildPathKeyframes(SVG_LAYOUT_PATH), []);
    const stepDuration = LOOP_DURATION_SECONDS / SVG_LAYOUT_PATH.length;
    const gridColor = 'rgba(255, 255, 255, 0.10)';

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-900">
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}
            />

            <div
                className="relative z-10"
                style={{ width: `${bounds.width}px`, height: `${bounds.height}px` }}
            >
                {SVG_LAYOUT_PATH.map((_, index) => (
                    <div
                        // Multiple blocks share the same path with time offsets, preserving the SVG layout while animating.
                        key={index}
                        className="absolute left-0 top-0 rounded-sm bg-white"
                        style={{
                            width: `${SQUARE_SIZE}px`,
                            height: `${SQUARE_SIZE}px`,
                            animation: `svg-layout-loader-move ${LOOP_DURATION_SECONDS}s ease-in-out infinite both`,
                            animationDelay: `${-(index * stepDuration)}s`,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes svg-layout-loader-move {
                    ${keyframes}
                }
            `}</style>
        </div>
    );
}

export default SvgLayoutLoader;
