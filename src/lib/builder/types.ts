// =============================================================================
// Widget Base Types — Core type system for the Page Builder widget architecture
// =============================================================================

import type { ComponentType } from 'react';

// -----------------------------------------------------------------------------
// Widget Categories
// -----------------------------------------------------------------------------

export type WidgetCategory =
  | 'layouts'
  | 'content'
  | 'controls'
  | 'data'
  | 'logical'
  | 'list'
  | 'tools';

// -----------------------------------------------------------------------------
// Visibility Rules
// -----------------------------------------------------------------------------

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'all';

export interface VisibilityRule {
  /** Show only on specific screen sizes */
  showOn?: ScreenSize;
  /** Hide on specific screen sizes */
  hideOn?: ScreenSize;
  /** Require authenticated user */
  requireAuth?: boolean;
  /** Custom condition expression (evaluated against Builder state) */
  when?: string;
}

// -----------------------------------------------------------------------------
// Widget Action
// -----------------------------------------------------------------------------

export type ActionType = 'navigate' | 'api-call' | 'set-state' | 'custom';

export interface WidgetAction {
  /** Unique name for this action */
  name: string;
  /** Type of action */
  type: ActionType;
  /** Action configuration */
  config: {
    /** URL for navigate or api-call */
    url?: string;
    /** HTTP method for api-call */
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /** State key and value for set-state */
    stateKey?: string;
    value?: unknown;
    /** Custom handler name for custom type */
    handler?: string;
  };
}

// -----------------------------------------------------------------------------
// Widget Permission
// -----------------------------------------------------------------------------

export interface WidgetPermission {
  /** Roles that can use this widget in the editor */
  editorRoles?: string[];
  /** Roles that can see this widget at runtime */
  viewerRoles?: string[];
}

// -----------------------------------------------------------------------------
// Builder Input Types (maps to Builder.io input system)
// -----------------------------------------------------------------------------

export type BuilderInputType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'longText'
  | 'richText'
  | 'html'
  | 'code'
  | 'color'
  | 'url'
  | 'file'
  | 'date'
  | 'email'
  | 'object'
  | 'list'
  | 'reference';

export interface BuilderInput {
  /** Input name (maps to prop name) */
  name: string;
  /** Display-friendly label */
  friendlyName?: string;
  /** Input type */
  type: BuilderInputType;
  /** Default value */
  defaultValue?: unknown;
  /** Whether input is required */
  required?: boolean;
  /** Help text shown in editor */
  helperText?: string;
  /** Enum options for string type */
  enum?: Array<string | { label: string; value: string | number }>;
  /** Sub-fields for object type */
  subFields?: BuilderInput[];
  /** Regex validation for string type */
  regex?: { pattern: string; message: string };
  /** Show this input only when condition is met */
  showIf?: string;
  /** Advanced: onChange handler expression */
  onChange?: string;
}

// -----------------------------------------------------------------------------
// Widget Definition — The core interface every widget must implement
// -----------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Widget props vary widely; constraint is enforced by WidgetBaseProps
export interface WidgetDefinition<P = any> {
  /** Unique identifier (kebab-case, e.g., "search-widget") */
  id: string;
  /** Widget type (matches id, used for Builder registration) */
  type: string;
  /** Display name shown in editor */
  name: string;
  /** Category this widget belongs to */
  category: WidgetCategory;
  /** Description shown in editor tooltip */
  description?: string;
  /** Icon URL or emoji for editor display */
  icon?: string;
  /** The React component to render */
  component: ComponentType<P>;
  /** Whether this widget can contain child widgets */
  canHaveChildren?: boolean;
  /** Builder.io input definitions (schema for Visual Editor) */
  inputs: BuilderInput[];
  /** Default prop values */
  defaults?: Partial<P>;
  /** Default CSS styles applied in Builder */
  defaultStyles?: Record<string, string>;
  /** Visibility rules */
  visibility?: VisibilityRule;
  /** Available actions */
  actions?: WidgetAction[];
  /** Permission rules */
  permissions?: WidgetPermission;
  /** Models this widget is available in (Builder.io models) */
  models?: string[];
  /** Tags for search/filter in editor */
  tags?: string[];
  /** Screenshot URL for editor preview */
  screenshot?: string;
  /** Documentation link */
  docsLink?: string;
  /** Whether to wrap in Builder's default div */
  noWrap?: boolean;
  /** Child requirements */
  childRequirements?: {
    message: string;
    query: Record<string, unknown>;
  };
  /** Default children */
  defaultChildren?: Array<{
    '@type': '@builder.io/sdk:Element';
    component: { name: string; options: Record<string, unknown> };
  }>;
}

// -----------------------------------------------------------------------------
// Widget Props Base — Common props injected into every widget
// -----------------------------------------------------------------------------

export interface WidgetBaseProps {
  /** Builder.io attributes (classes, styles) — spread on root element */
  attributes?: Record<string, unknown>;
  /** Children from Builder (for canHaveChildren widgets) */
  children?: React.ReactNode;
  /** Builder content reference */
  builderBlock?: Record<string, unknown>;
  /** Builder state */
  builderState?: {
    state: Record<string, unknown>;
    setState: (patch: Record<string, unknown>) => void;
  };
}

// -----------------------------------------------------------------------------
// Category Metadata
// -----------------------------------------------------------------------------

export interface CategoryMeta {
  id: WidgetCategory;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export const WIDGET_CATEGORIES: CategoryMeta[] = [
  { id: 'layouts', name: 'Layouts', description: 'Page structure and spacing', icon: '📐', order: 1 },
  { id: 'content', name: 'Content', description: 'Text, images, and media', icon: '📝', order: 2 },
  { id: 'controls', name: 'Controls', description: 'Interactive elements', icon: '🎛️', order: 3 },
  { id: 'data', name: 'Data', description: 'Data fetching and binding', icon: '🔌', order: 4 },
  { id: 'logical', name: 'Logical', description: 'Conditions and loops', icon: '🧠', order: 5 },
  { id: 'list', name: 'List', description: 'Collections and repeaters', icon: '📋', order: 6 },
  { id: 'tools', name: 'Tools', description: 'Ready-made functional widgets', icon: '🛠️', order: 7 },
];
