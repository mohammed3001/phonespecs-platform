// =============================================================================
// Widget Registration — Imports and registers all widgets in the registry
// =============================================================================

import { registerWidgets } from '@/lib/builder/registry';

// Layouts
import { sectionDefinition } from './layouts/Section';
import { gridDefinition } from './layouts/Grid';
import { columnsDefinition } from './layouts/Columns';

// Content
import { textBlockDefinition } from './content/TextBlock';
import { imageBlockDefinition } from './content/ImageBlock';

// Controls
import { buttonDefinition } from './controls/Button';
import { textInputDefinition } from './controls/TextInput';

// Data
import { apiFetchDefinition } from './data/ApiFetch';

// Logical
import { conditionDefinition } from './logical/Condition';

// List
import { repeaterDefinition } from './list/Repeater';

// Tools
import { searchWidgetDefinition } from './tools/SearchWidget';
import { navigationMenuDefinition } from './tools/NavigationMenu';

// -----------------------------------------------------------------------------
// Register all widgets
// -----------------------------------------------------------------------------

const allWidgets = [
  // Layouts
  sectionDefinition,
  gridDefinition,
  columnsDefinition,

  // Content
  textBlockDefinition,
  imageBlockDefinition,

  // Controls
  buttonDefinition,
  textInputDefinition,

  // Data
  apiFetchDefinition,

  // Logical
  conditionDefinition,

  // List
  repeaterDefinition,

  // Tools
  searchWidgetDefinition,
  navigationMenuDefinition,
];

/**
 * Call this once to register all widgets in the global registry.
 * Typically called in the Builder catch-all route or layout.
 */
export function initializeWidgets(): void {
  registerWidgets(allWidgets);
}

export {
  // Layouts
  sectionDefinition,
  gridDefinition,
  columnsDefinition,
  // Content
  textBlockDefinition,
  imageBlockDefinition,
  // Controls
  buttonDefinition,
  textInputDefinition,
  // Data
  apiFetchDefinition,
  // Logical
  conditionDefinition,
  // List
  repeaterDefinition,
  // Tools
  searchWidgetDefinition,
  navigationMenuDefinition,
};
