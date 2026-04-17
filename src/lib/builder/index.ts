// =============================================================================
// Builder Module — Barrel export
// =============================================================================

export { registerWidget, registerWidgets, getAllWidgets, getWidget, getWidgetsByCategory, getBuilderComponents, hasWidget, clearRegistry } from './registry';
export { BUILDER_API_KEY, BUILDER_PAGE_MODEL, isBuilderConfigured } from './client';
export { spacing, typography, colors, radii, shadows, breakpoints, paddingClass, textColorClass, bgColorClass, borderColorClass, widgetDefaults } from './design-tokens';
export type { SpacingToken, TypographyToken, ColorToken, RadiusToken, ShadowToken, BreakpointToken } from './design-tokens';
export type { WidgetDefinition, WidgetCategory, WidgetBaseProps, BuilderInput, BuilderInputType, WidgetAction, WidgetPermission, VisibilityRule, CategoryMeta } from './types';
export { WIDGET_CATEGORIES } from './types';
