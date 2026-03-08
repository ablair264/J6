import { createContext, useContext } from 'react';

export const palette = {
  light: {
    bg: '#f8f8f5',
    bgAlt: '#f0f0ec',
    bgCard: '#ffffff',
    bgCardHover: '#fafafa',
    border: 'rgba(0,0,0,0.08)',
    borderHover: 'rgba(0,0,0,0.18)',
    text: '#111110',
    textMid: '#444440',
    textMuted: '#888880',
    accent: '#e8540a',
    accentSoft: 'rgba(232,84,10,0.08)',
    accentBorder: 'rgba(232,84,10,0.25)',
    pro: '#7c3aed',
    proSoft: 'rgba(124,58,237,0.08)',
    proBorder: 'rgba(124,58,237,0.2)',
    shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
    shadowHover: '0 4px 24px rgba(0,0,0,0.12)',
  },
  dark: {
    bg: '#0e0e0c',
    bgAlt: '#141412',
    bgCard: '#1a1a17',
    bgCardHover: '#1f1f1c',
    border: 'rgba(255,255,255,0.07)',
    borderHover: 'rgba(255,255,255,0.14)',
    text: '#f0f0ec',
    textMid: '#b0b0ac',
    textMuted: '#585854',
    accent: '#e8540a',
    accentSoft: 'rgba(232,84,10,0.1)',
    accentBorder: 'rgba(232,84,10,0.3)',
    pro: '#a78bfa',
    proSoft: 'rgba(167,139,250,0.1)',
    proBorder: 'rgba(167,139,250,0.25)',
    shadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.3)',
    shadowHover: '0 4px 24px rgba(0,0,0,0.5)',
  },
} as const;

export type Theme = {
  [K in keyof (typeof palette)['dark']]: string;
};

export const ThemeContext = createContext<{
  dark: boolean;
  toggle: () => void;
  t: Theme;
}>({
  dark: true,
  toggle: () => {},
  t: palette.dark,
});

export const useTheme = () => useContext(ThemeContext);
