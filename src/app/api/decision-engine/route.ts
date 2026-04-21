import { NextRequest, NextResponse } from "next/server";
import { findMyPhone } from "@/lib/decision-engine";

/**
 * Budget tier presets — aligned with the wizard UI.
 * API accepts either a tier name OR raw budgetMin/budgetMax numbers.
 */
const BUDGET_TIERS: Record<string, { min: number; max: number }> = {
  budget: { min: 0, max: 300 },
  "mid-range": { min: 300, max: 500 },
  "upper-mid": { min: 500, max: 800 },
  flagship: { min: 800, max: 1100 },
  premium: { min: 1100, max: 2000 },
  any: { min: 0, max: 5000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetTier, budgetMax: rawBudgetMax, budgetMin: rawBudgetMin, priorities, brandPreference, mustHave } = body;

    // Resolve budget from tier name or raw values
    let budgetMin: number;
    let budgetMax: number;

    if (budgetTier && typeof budgetTier === "string") {
      const tier = BUDGET_TIERS[budgetTier.toLowerCase()];
      if (!tier) {
        return NextResponse.json(
          { success: false, error: `Invalid budgetTier '${budgetTier}'. Valid tiers: ${Object.keys(BUDGET_TIERS).join(", ")}` },
          { status: 400 }
        );
      }
      budgetMin = tier.min;
      budgetMax = tier.max;
    } else if (rawBudgetMax) {
      budgetMax = Number(rawBudgetMax);
      budgetMin = rawBudgetMin ? Number(rawBudgetMin) : 0;
    } else {
      return NextResponse.json(
        { success: false, error: "Either budgetTier or budgetMax is required. Valid tiers: " + Object.keys(BUDGET_TIERS).join(", ") },
        { status: 400 }
      );
    }

    if (!priorities) {
      return NextResponse.json(
        { success: false, error: "priorities object is required" },
        { status: 400 }
      );
    }

    // Validate priorities
    const validPriorities = ["camera", "battery", "performance", "display", "value"];
    for (const key of validPriorities) {
      if (typeof priorities[key] !== "number" || priorities[key] < 0 || priorities[key] > 5) {
        return NextResponse.json(
          { success: false, error: `Priority '${key}' must be a number between 0 and 5` },
          { status: 400 }
        );
      }
    }

    const result = await findMyPhone({
      budgetMax,
      budgetMin: budgetMin || undefined,
      priorities: {
        camera: priorities.camera,
        battery: priorities.battery,
        performance: priorities.performance,
        display: priorities.display,
        value: priorities.value,
      },
      brandPreference: brandPreference || undefined,
      mustHave: mustHave || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Decision engine error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to find recommendations" },
      { status: 500 }
    );
  }
}
