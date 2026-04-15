import prisma from "./prisma";

interface AuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        changes: input.changes || null,
        beforeState: input.beforeState ? JSON.stringify(input.beforeState) : null,
        afterState: input.afterState ? JSON.stringify(input.afterState) : null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw — audit logging should never break the main flow
  }
}

/**
 * Compute a human-readable diff summary between two objects.
 * Returns a string like "name: 'Old' → 'New', price: 100 → 200"
 */
export function computeChangeSummary(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fieldsToTrack?: string[]
): string {
  const changes: string[] = [];
  const keys = fieldsToTrack || Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  for (const key of keys) {
    const oldVal = before[key];
    const newVal = after[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push(`${key}: ${formatValue(oldVal)} → ${formatValue(newVal)}`);
    }
  }

  return changes.join(", ") || "No changes detected";
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "string") return `"${val.length > 50 ? val.slice(0, 50) + "…" : val}"`;
  return String(val);
}
