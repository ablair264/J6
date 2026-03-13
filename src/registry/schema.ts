export interface RegistryComponent {
  /** URL-safe slug, e.g. "badge" */
  name: string;
  /** Human-readable name, e.g. "Badge" */
  label: string;
  /** One-line description */
  description: string;
  /** Category for sidebar grouping */
  category: 'primitives' | 'data-display' | 'feedback' | 'overlay' | 'navigation' | 'charts' | 'compact';
  /** Source files that make up this component (relative to src/) */
  files: RegistryFile[];
  /** Other registry components this depends on */
  registryDependencies?: string[];
  /** npm packages this requires */
  npmDependencies?: Record<string, string>;
  /** CSS variables that must exist in the user's theme */
  cssVars?: string[];
  /** Auto-generated props (populated by build script) */
  props?: RegistryProp[];
}

export interface RegistryFile {
  /** Path relative to src/, e.g. "components/ui/badge.tsx" */
  path: string;
  /** Target path in user project, e.g. "components/ui/badge.tsx" */
  target: string;
  /** File type for display */
  type: 'component' | 'lib' | 'types' | 'css';
}

export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface RegistryExample {
  title: string;
  /** Usage code string */
  code: string;
}
