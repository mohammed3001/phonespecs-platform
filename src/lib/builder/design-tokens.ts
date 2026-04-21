// =============================================================================
// Design Tokens — Unified design system for all Page Builder widgets
// =============================================================================

// -----------------------------------------------------------------------------
// Spacing
// -----------------------------------------------------------------------------

export const spacing = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
} as const;

export type SpacingToken = keyof typeof spacing;

// -----------------------------------------------------------------------------
// Typography
// -----------------------------------------------------------------------------

export const typography = {
  h1: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' },
  h2: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.025em' },
  h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
  h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },
  body: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '400' },
  bodyLg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '400' },
  caption: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },
  small: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '400' },
} as const;

export type TypographyToken = keyof typeof typography;

// -----------------------------------------------------------------------------
// Colors — Semantic tokens (reference Tailwind classes)
// -----------------------------------------------------------------------------

export const colors = {
  // Primary
  primary: { light: 'teal-600', dark: 'teal-400' },
  primaryHover: { light: 'teal-700', dark: 'teal-300' },
  primaryBg: { light: 'teal-50', dark: 'teal-950' },

  // Secondary
  secondary: { light: 'slate-600', dark: 'slate-400' },
  secondaryHover: { light: 'slate-700', dark: 'slate-300' },
  secondaryBg: { light: 'slate-50', dark: 'slate-900' },

  // Surface
  surface: { light: 'white', dark: 'slate-800' },
  surfaceRaised: { light: 'white', dark: 'slate-750' },
  surfaceOverlay: { light: 'white/80', dark: 'slate-800/80' },

  // Background
  background: { light: 'gray-50', dark: 'slate-900' },
  backgroundAlt: { light: 'gray-100', dark: 'slate-800' },

  // Text
  text: { light: 'gray-900', dark: 'gray-100' },
  textMuted: { light: 'gray-500', dark: 'gray-400' },
  textInverse: { light: 'white', dark: 'gray-900' },

  // Border
  border: { light: 'gray-200', dark: 'slate-700' },
  borderHover: { light: 'gray-300', dark: 'slate-600' },

  // Status
  success: { light: 'emerald-600', dark: 'emerald-400' },
  warning: { light: 'amber-600', dark: 'amber-400' },
  error: { light: 'red-600', dark: 'red-400' },
  info: { light: 'blue-600', dark: 'blue-400' },
} as const;

export type ColorToken = keyof typeof colors;

// -----------------------------------------------------------------------------
// Border Radius
// -----------------------------------------------------------------------------

export const radii = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radii;

// -----------------------------------------------------------------------------
// Shadows
// -----------------------------------------------------------------------------

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export type ShadowToken = keyof typeof shadows;

// -----------------------------------------------------------------------------
// Breakpoints (matches Tailwind defaults)
// -----------------------------------------------------------------------------

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type BreakpointToken = keyof typeof breakpoints;

// -----------------------------------------------------------------------------
// Tailwind Class Helpers
// -----------------------------------------------------------------------------

/**
 * Generate Tailwind padding classes from spacing tokens.
 */
export function paddingClass(
  size: SpacingToken,
  axis?: 'x' | 'y'
): string {
  const map: Record<SpacingToken, string> = {
    none: '0', xs: '1', sm: '2', md: '4', lg: '6', xl: '8',
    '2xl': '12', '3xl': '16', '4xl': '24',
  };
  const suffix = map[size];
  if (axis === 'x') return `px-${suffix}`;
  if (axis === 'y') return `py-${suffix}`;
  return `p-${suffix}`;
}

/**
 * Generate Tailwind text color classes with dark mode support.
 */
export function textColorClass(token: ColorToken): string {
  const color = colors[token];
  return `text-${color.light} dark:text-${color.dark}`;
}

/**
 * Generate Tailwind background color classes with dark mode support.
 */
export function bgColorClass(token: ColorToken): string {
  const color = colors[token];
  return `bg-${color.light} dark:bg-${color.dark}`;
}

/**
 * Generate Tailwind border color classes with dark mode support.
 */
export function borderColorClass(token: ColorToken): string {
  const color = colors[token];
  return `border-${color.light} dark:border-${color.dark}`;
}

// -----------------------------------------------------------------------------
// Widget Default Styles
// -----------------------------------------------------------------------------

/**
 * Common default styles applied to all widgets unless overridden.
 */
export const widgetDefaults = {
  /** Default wrapper classes for consistency */
  wrapperClass: 'w-full',
  /** Default transition for interactive elements */
  transitionClass: 'transition-all duration-200 ease-in-out',
  /** Default focus ring for accessibility */
  focusClass: 'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
} as const;
