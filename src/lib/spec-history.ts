import prisma from "./prisma";

interface SpecChangeInput {
  phoneSpecId: string;
  oldValue: string;
  newValue: string;
  oldNumeric?: number | null;
  newNumeric?: number | null;
  source?: string | null;
  reason?: string | null;
  changedById?: string | null;
}

/**
 * Record a spec value change in the history table.
 * Called whenever a PhoneSpec value is updated.
 */
export async function recordSpecChange(input: SpecChangeInput) {
  // Don't record if values are identical
  if (input.oldValue === input.newValue) return null;

  try {
    return await prisma.phoneSpecHistory.create({
      data: {
        phoneSpecId: input.phoneSpecId,
        oldValue: input.oldValue,
        newValue: input.newValue,
        oldNumeric: input.oldNumeric ?? null,
        newNumeric: input.newNumeric ?? null,
        source: input.source || null,
        reason: input.reason || null,
        changedById: input.changedById || null,
      },
    });
  } catch (error) {
    console.error("Failed to record spec change:", error);
  }
}

/**
 * Get spec change history for a phone.
 */
export async function getPhoneSpecHistory(phoneId: string, limit = 50) {
  return prisma.phoneSpecHistory.findMany({
    where: {
      phoneSpec: { phoneId },
    },
    include: {
      phoneSpec: {
        include: {
          spec: { select: { name: true, key: true } },
        },
      },
      changedBy: { select: { name: true, email: true } },
    },
    orderBy: { changedAt: "desc" },
    take: limit,
  });
}
