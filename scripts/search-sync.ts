/**
 * CLI script to sync PostgreSQL data to Meilisearch.
 * Usage: npx tsx scripts/search-sync.ts
 */
import { fullReindex } from "../src/lib/search-sync";

async function main() {
  console.log("🔍 MobilePlatform Search Sync");
  console.log("=============================");
  
  try {
    const result = await fullReindex();
    console.log(`\n✅ Sync complete!`);
    console.log(`   Phones: ${result.phones}`);
    console.log(`   Brands: ${result.brands}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
