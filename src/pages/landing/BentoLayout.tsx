import React, { useEffect, useState } from 'react';
import { useTheme } from './theme';

interface BentoProps {
  children: React.ReactNode[];
  className?: string;
}

function Cell({
  children,
  area,
  className = '',
}: {
  children: React.ReactNode;
  area: string;
  className?: string;
}) {
  const { t } = useTheme();
  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        gridArea: area,
        background: t.bgCard,
        border: `1px solid ${t.border}`,
      }}
    >
      {children}
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return mobile;
}

// Layout A: 4-cell — tall left, tall center, top-right + bottom-right
export function BentoA({ children, className = '' }: BentoProps) {
  const mobile = useIsMobile();
  return (
    <div
      className={`grid gap-3 ${className}`}
      style={
        mobile
          ? { gridTemplateColumns: '1fr' }
          : {
              gridTemplateColumns: '310fr 200fr 310fr',
              gridTemplateRows: '210fr 150fr',
              gridTemplateAreas: `
                "left center right-top"
                "left center right-bottom"
              `,
              aspectRatio: '840 / 360',
            }
      }
    >
      <Cell area={mobile ? 'auto' : 'left'}>{children[0]}</Cell>
      <Cell area={mobile ? 'auto' : 'center'}>{children[1]}</Cell>
      <Cell area={mobile ? 'auto' : 'right-top'}>{children[2]}</Cell>
      <Cell area={mobile ? 'auto' : 'right-bottom'}>{children[3]}</Cell>
    </div>
  );
}

// Layout B: 4-cell — top-left, narrow center column, bottom-left, bottom-right
export function BentoB({ children, className = '' }: BentoProps) {
  const mobile = useIsMobile();
  return (
    <div
      className={`grid gap-3 ${className}`}
      style={
        mobile
          ? { gridTemplateColumns: '1fr' }
          : {
              gridTemplateColumns: '310fr 130fr 310fr',
              gridTemplateRows: '200fr 150fr',
              gridTemplateAreas: `
                "left-top    center  ."
                "left-bottom center  right-bottom"
              `,
              aspectRatio: '770 / 360',
            }
      }
    >
      <Cell area={mobile ? 'auto' : 'left-top'}>{children[0]}</Cell>
      <Cell area={mobile ? 'auto' : 'center'}>{children[1]}</Cell>
      <Cell area={mobile ? 'auto' : 'left-bottom'}>{children[2]}</Cell>
      <Cell area={mobile ? 'auto' : 'right-bottom'}>{children[3]}</Cell>
    </div>
  );
}

// Layout C: 3-cell — two stacked left, one tall right
export function BentoC({ children, className = '' }: BentoProps) {
  const mobile = useIsMobile();
  return (
    <div
      className={`grid gap-3 ${className}`}
      style={
        mobile
          ? { gridTemplateColumns: '1fr' }
          : {
              gridTemplateColumns: '310fr 450fr',
              gridTemplateRows: '200fr 150fr',
              gridTemplateAreas: `
                "left-top    right"
                "left-bottom right"
              `,
              aspectRatio: '770 / 360',
            }
      }
    >
      <Cell area={mobile ? 'auto' : 'left-top'}>{children[0]}</Cell>
      <Cell area={mobile ? 'auto' : 'left-bottom'}>{children[1]}</Cell>
      <Cell area={mobile ? 'auto' : 'right'}>{children[2]}</Cell>
    </div>
  );
}

// Layout D: 2-cell — wide bottom-left, tall right (top-left empty)
export function BentoD({ children, className = '' }: BentoProps) {
  const mobile = useIsMobile();
  return (
    <div
      className={`grid gap-3 ${className}`}
      style={
        mobile
          ? { gridTemplateColumns: '1fr' }
          : {
              gridTemplateColumns: '460fr 340fr',
              gridTemplateRows: '210fr 150fr',
              gridTemplateAreas: `
                ".      right"
                "bottom right"
              `,
              aspectRatio: '800 / 360',
            }
      }
    >
      <Cell area={mobile ? 'auto' : 'bottom'}>{children[0]}</Cell>
      <Cell area={mobile ? 'auto' : 'right'}>{children[1]}</Cell>
    </div>
  );
}
