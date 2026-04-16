/**
 * Lightweight environment variable validation.
 * Logs warnings on startup for missing or insecure configuration.
 * Does NOT block the app — just surfaces issues in server logs.
 */

const REQUIRED_VARS = [
  { key: "DATABASE_URL", label: "Database connection" },
  { key: "NEXTAUTH_SECRET", label: "Auth session encryption" },
] as const;

const RECOMMENDED_VARS = [
  { key: "NEXT_PUBLIC_SITE_URL", label: "Canonical site URL (SEO)" },
  { key: "NEXTAUTH_URL", label: "Auth callback URL" },
] as const;

const OPTIONAL_VARS = [
  { key: "MEILISEARCH_URL", label: "Search engine" },
  { key: "MEILISEARCH_MASTER_KEY", label: "Search engine auth" },
  { key: "REDIS_URL", label: "Job queue (BullMQ)" },
] as const;

let checked = false;

export function checkEnv() {
  if (checked) return;
  checked = true;

  const issues: string[] = [];

  // Required
  for (const { key, label } of REQUIRED_VARS) {
    if (!process.env[key]) {
      issues.push(`❌ MISSING ${key} — ${label} (required)`);
    }
  }

  // Insecure NEXTAUTH_SECRET
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && (secret === "your-secret-key-here" || secret.length < 16)) {
    issues.push(`⚠️  NEXTAUTH_SECRET is insecure — generate with: openssl rand -base64 32`);
  }

  // Recommended
  for (const { key, label } of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      issues.push(`⚠️  MISSING ${key} — ${label} (recommended)`);
    }
  }

  // Optional (info only)
  for (const { key, label } of OPTIONAL_VARS) {
    if (!process.env[key]) {
      issues.push(`ℹ️  MISSING ${key} — ${label} (optional)`);
    }
  }

  if (issues.length > 0) {
    console.log("\n┌─────────────────────────────────────────────────");
    console.log("│ MobilePlatform — Environment Check");
    console.log("├─────────────────────────────────────────────────");
    for (const issue of issues) {
      console.log(`│ ${issue}`);
    }
    console.log("└─────────────────────────────────────────────────\n");
  }
}
