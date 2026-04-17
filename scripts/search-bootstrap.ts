/**
 * Search Bootstrap Script
 * 
 * Run this script to configure indexes and perform a full reindex.
 * Usage: npx tsx scripts/search-bootstrap.ts
 */

import { fullReindex } from "../src/lib/search";

async function main() {
  console.log("=== Search Bootstrap ===\n");
  
  try {
    const result = await fullReindex();
    console.log(`\nBootstrap complete:`);
    console.log(`  Phones indexed: ${result.phones}`);
    console.log(`  Brands indexed: ${result.brands}`);
    console.log(`\nSearch is now ready.`);
  } catch (error) {
    console.error("Bootstrap failed:", error);
    process.exit(1);
  }
}

main();
