import { useState, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

interface ComponentPreviewProps {
  children: ReactNode;
  code: string;
  className?: string;
}

const T = {
  bg: '#0a0a0b',
  subtle: '#111113',
  surface: '#141416',
  elevated: '#1a1a1d',
  text: '#f0ede8',
  textSec: '#9a9aa3',
  textMuted: '#6b6b72',
  border: 'rgba(255,255,255,0.08)',
};

export function ComponentPreview({ children, code, className }: ComponentPreviewProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className={className}
      style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}
    >
      {/* Preview area */}
      <div
        className="flex items-center justify-center p-10 min-h-[160px]"
        style={{ background: T.subtle }}
      >
        {children}
      </div>

      {/* Code area */}
      <div style={{ borderTop: `1px solid ${T.border}`, background: T.surface }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono" style={{ color: T.textMuted }}>
              {showCode ? 'Code' : 'Preview'}
            </span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
            style={{
              background: showCode ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: T.textSec,
              border: `1px solid ${T.border}`,
            }}
          >
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
        </div>

        {/* Collapsible code block */}
        {showCode && (
          <CodeBlock
            code={code}
            language="tsx"
            collapsible={false}
            maxHeight={400}
          />
        )}
      </div>
    </div>
  );
}
