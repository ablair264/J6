import { CodeBlock } from './CodeBlock';

interface ComponentSourceProps {
  code: string;
  title: string;
  language?: string;
  maxHeight?: number;
}

export function ComponentSource({
  code,
  title,
  language = 'tsx',
  maxHeight = 200,
}: ComponentSourceProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <CodeBlock
        code={code}
        language={language}
        title={title}
        collapsible
        maxHeight={maxHeight}
      />
    </div>
  );
}
