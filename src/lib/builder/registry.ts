// =============================================================================
// Widget Registry — Central registry for all Page Builder widgets
// =============================================================================

import type { WidgetDefinition, WidgetCategory } from './types';

// -----------------------------------------------------------------------------
// Registry State
// -----------------------------------------------------------------------------

const widgetMap = new Map<string, WidgetDefinition>();

// -----------------------------------------------------------------------------
// Registration
// -----------------------------------------------------------------------------

/**
 * Register a widget in the global registry.
 * Throws if a widget with the same id is already registered.
 */
export function registerWidget<P extends Record<string, unknown>>(
  definition: WidgetDefinition<P>
): void {
  if (widgetMap.has(definition.id)) {
    console.warn(
      `[WidgetRegistry] Widget "${definition.id}" is already registered. Skipping duplicate.`
    );
    return;
  }
  widgetMap.set(definition.id, definition as unknown as WidgetDefinition);
}

/**
 * Register multiple widgets at once.
 */
export function registerWidgets(definitions: WidgetDefinition[]): void {
  for (const def of definitions) {
    registerWidget(def);
  }
}

// -----------------------------------------------------------------------------
// Lookup
// -----------------------------------------------------------------------------

/**
 * Get a widget definition by id.
 */
export function getWidget(id: string): WidgetDefinition | undefined {
  return widgetMap.get(id);
}

/**
 * Get all registered widgets.
 */
export function getAllWidgets(): WidgetDefinition[] {
  return Array.from(widgetMap.values());
}

/**
 * Get all widgets in a specific category.
 */
export function getWidgetsByCategory(category: WidgetCategory): WidgetDefinition[] {
  return getAllWidgets().filter((w) => w.category === category);
}

/**
 * Get all widgets matching given tags.
 */
export function getWidgetsByTags(tags: string[]): WidgetDefinition[] {
  return getAllWidgets().filter(
    (w) => w.tags && w.tags.some((t) => tags.includes(t))
  );
}

/**
 * Check if a widget exists in the registry.
 */
export function hasWidget(id: string): boolean {
  return widgetMap.has(id);
}

// -----------------------------------------------------------------------------
// Builder.io Integration — Convert registry to Builder custom components
// -----------------------------------------------------------------------------

/**
 * Recursively convert our BuilderInput[] to Builder SDK Input[] format.
 */
function mapInputs(inputs: import('./types').BuilderInput[]): Array<{
  name: string;
  friendlyName?: string;
  type: string;
  defaultValue?: unknown;
  required?: boolean;
  helperText?: string;
  enum?: Array<string | { label: string; value: string | number }>;
  subFields?: ReturnType<typeof mapInputs>;
  regex?: { pattern: string; message: string };
  showIf?: string;
  onChange?: string;
}> {
  return inputs.map((input) => ({
    name: input.name,
    friendlyName: input.friendlyName,
    type: input.type,
    defaultValue: input.defaultValue,
    required: input.required,
    helperText: input.helperText,
    enum: input.enum,
    subFields: input.subFields ? mapInputs(input.subFields) : undefined,
    regex: input.regex,
    showIf: input.showIf,
    onChange: input.onChange,
  }));
}

/**
 * Convert all registered widgets to Builder.io customComponents format.
 * Used in <Content customComponents={getBuilderComponents()} />
 */
export function getBuilderComponents() {
  return getAllWidgets().map((widget) => ({
    component: widget.component,
    name: widget.name,
    canHaveChildren: widget.canHaveChildren ?? false,
    inputs: mapInputs(widget.inputs),
    defaultStyles: widget.defaultStyles,
    image: widget.icon,
    docsLink: widget.docsLink,
    noWrap: widget.noWrap,
    models: widget.models,
    screenshot: widget.screenshot,
    defaultChildren: widget.defaultChildren,
    childRequirements: widget.childRequirements,
  }));
}

// -----------------------------------------------------------------------------
// Debug / Development
// -----------------------------------------------------------------------------

/**
 * Print registry summary to console (development only).
 */
export function debugRegistry(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const categories = new Map<WidgetCategory, string[]>();
  for (const widget of getAllWidgets()) {
    const list = categories.get(widget.category) ?? [];
    list.push(widget.name);
    categories.set(widget.category, list);
  }

  console.log('[WidgetRegistry] Registered widgets:');
  categories.forEach((names, category) => {
    console.log(`  ${category}: ${names.join(', ')}`);
  });
  console.log(`  Total: ${widgetMap.size} widgets`);
}

// -----------------------------------------------------------------------------
// Reset (for testing)
// -----------------------------------------------------------------------------

/**
 * Clear all registered widgets. Only use in tests.
 */
export function clearRegistry(): void {
  widgetMap.clear();
}
