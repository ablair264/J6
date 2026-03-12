import { useEffect, useState, useRef } from 'react';
import { codeToHtml, type BundledTheme } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: BundledTheme;
  showLineNumbers?: boolean;
  maxHeight?: number;
  collapsible?: boolean;
  title?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'tsx',
  theme = 'github-dark-default',
  showLineNumbers = true,
  maxHeight = 300,
  collapsible = true,
  title,
  className,
}: CodeBlockProps) {
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    codeToHtml(code.trim(), {
      lang: language,
      theme,
    }).then(setHtml);
  }, [code, language, theme]);

  useEffect(() => {
    if (codeRef.current && collapsible) {
      setIsOverflowing(codeRef.current.scrollHeight > maxHeight);
    }
  }, [html, maxHeight, collapsible]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={className}>
      {/* Header bar */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}>
          <span className="text-xs font-mono text-[#9a9aa3]">{title}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-colors hover:bg-white/5"
            style={{ color: '#9a9aa3' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code area */}
      <div className="relative group">
        {!title && (
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#9a9aa3' }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}

        <div
          ref={codeRef}
          className="overflow-hidden transition-[max-height] duration-300 [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_code]:!bg-transparent"
          style={{
            maxHeight: collapsible && !expanded && isOverflowing ? maxHeight : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Expand/collapse overlay */}
        {collapsible && isOverflowing && !expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-3 pt-12"
            style={{ background: 'linear-gradient(transparent, #111113 80%)' }}
          >
            <button
              onClick={() => setExpanded(true)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#f0ede8' }}
            >
              Expand
            </button>
          </div>
        )}

        {collapsible && expanded && isOverflowing && (
          <div className="flex justify-center py-2" style={{ background: '#111113' }}>
            <button
              onClick={() => setExpanded(false)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#9a9aa3' }}
            >
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
