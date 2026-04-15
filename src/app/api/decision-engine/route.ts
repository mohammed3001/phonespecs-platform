import { NextRequest, NextResponse } from "next/server";
import { findMyPhone } from "@/lib/decision-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetMax, budgetMin, priorities, brandPreference, mustHave } = body;

    if (!budgetMax || !priorities) {
      return NextResponse.json(
        { success: false, error: "budgetMax and priorities are required" },
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
      budgetMax: Number(budgetMax),
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
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
