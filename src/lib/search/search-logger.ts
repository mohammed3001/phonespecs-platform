/**
 * Search Logger
 *
 * Structured logging for all search operations.
 * Provides consistent log format with operation context.
 *
 * All logs follow the pattern: [Search:{operation}] message {context}
 */

export type SearchOperation =
  | "query"
  | "autocomplete"
  | "index"
  | "reindex"
  | "delete"
  | "config"
  | "health";

export type LogLevel = "info" | "warn" | "error";

interface LogContext {
  operation: SearchOperation;
  index?: string;
  documentId?: string;
  durationMs?: number;
  documentCount?: number;
  error?: unknown;
  [key: string]: unknown;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

function formatContext(ctx: LogContext): string {
  const parts: string[] = [];
  if (ctx.index) parts.push(`index=${ctx.index}`);
  if (ctx.documentId) parts.push(`docId=${ctx.documentId}`);
  if (ctx.durationMs !== undefined) parts.push(`duration=${ctx.durationMs}ms`);
  if (ctx.documentCount !== undefined) parts.push(`docs=${ctx.documentCount}`);
  if (ctx.error) parts.push(`error="${formatError(ctx.error)}"`);

  // Include any extra keys
  for (const [key, value] of Object.entries(ctx)) {
    if (["operation", "index", "documentId", "durationMs", "documentCount", "error"].includes(key)) continue;
    if (value !== undefined && value !== null) {
      parts.push(`${key}=${typeof value === "string" ? `"${value}"` : value}`);
    }
  }

  return parts.length > 0 ? ` {${parts.join(", ")}}` : "";
}

function log(level: LogLevel, message: string, ctx: LogContext): void {
  const prefix = `[Search:${ctx.operation}]`;
  const contextStr = formatContext(ctx);
  const logMessage = `${prefix} ${message}${contextStr}`;

  switch (level) {
    case "info":
      console.log(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "error":
      console.error(logMessage);
      break;
  }
}

export const searchLogger = {
  info(message: string, ctx: LogContext): void {
    log("info", message, ctx);
  },

  warn(message: string, ctx: LogContext): void {
    log("warn", message, ctx);
  },

  error(message: string, ctx: LogContext): void {
    log("error", message, ctx);
  },

  /** Log a successful search query */
  querySuccess(query: string, totalHits: number, durationMs: number, fallback = false): void {
    log("info", `Search completed: "${query}" → ${totalHits} hits`, {
      operation: "query",
      durationMs,
      query,
      totalHits,
      ...(fallback && { fallback: true }),
    });
  },

  /** Log a search query failure */
  queryFailure(query: string, error: unknown): void {
    log("error", `Search failed: "${query}"`, {
      operation: "query",
      error,
      query,
    });
  },

  /** Log a successful indexing operation */
  indexSuccess(index: string, documentId: string, action: "upsert" | "delete"): void {
    log("info", `Document ${action}ed`, {
      operation: action === "delete" ? "delete" : "index",
      index,
      documentId,
    });
  },

  /** Log an indexing failure (non-fatal) */
  indexFailure(index: string, documentId: string, action: string, error: unknown): void {
    log("error", `Document ${action} failed (non-fatal, DB is source of truth)`, {
      operation: "index",
      index,
      documentId,
      error,
    });
  },

  /** Log a full reindex operation */
  reindexComplete(phones: number, brands: number, durationMs: number): void {
    log("info", `Full reindex complete`, {
      operation: "reindex",
      durationMs,
      documentCount: phones + brands,
      phones,
      brands,
    });
  },

  /** Log a reindex failure */
  reindexFailure(error: unknown): void {
    log("error", `Full reindex failed`, {
      operation: "reindex",
      error,
    });
  },

  /** Log Meilisearch unavailability */
  serviceUnavailable(operation: SearchOperation, error: unknown): void {
    log("warn", `Meilisearch unavailable — using fallback`, {
      operation,
      error,
    });
  },
};
