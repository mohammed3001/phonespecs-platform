'use client';

// =============================================================================
// RenderBuilderContent — Client component that renders Builder.io content
// =============================================================================

import { Content, isPreviewing, isEditing, type BuilderContent } from '@builder.io/sdk-react';
import { BUILDER_API_KEY } from '@/lib/builder/client';
import { getBuilderComponents } from '@/lib/builder/registry';

interface RenderBuilderContentProps {
  /** Builder.io content JSON (fetched server-side) */
  content: BuilderContent | null;
  /** Builder.io model name */
  model: string;
  /** Additional data to pass to Builder state */
  data?: Record<string, unknown>;
}

/**
 * Client-side wrapper that renders Builder.io content with all registered widgets.
 * Must be a client component because Builder's <Content> uses browser APIs.
 */
export function RenderBuilderContent({
  content,
  model,
  data,
}: RenderBuilderContentProps) {
  // If no content and not in preview/edit mode, show nothing
  if (!content && !isPreviewing() && !isEditing()) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Builder SDK Input types are overly strict with enum unions
  const components = getBuilderComponents() as any;

  return (
    <Content
      content={content}
      apiKey={BUILDER_API_KEY}
      model={model}
      customComponents={components}
      data={data}
    />
  );
}
