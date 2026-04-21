import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fullReindex } from "@/lib/search";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await fullReindex();
    return NextResponse.json({
      success: true,
      data: result,
      message: `Reindexed ${result.phones} phones and ${result.brands} brands`,
    });
  } catch (error) {
    console.error("Reindex error:", error);
    return NextResponse.json(
      { success: false, error: "Reindex failed. Meilisearch may be unavailable." },
      { status: 503 }
    );
  }
}
