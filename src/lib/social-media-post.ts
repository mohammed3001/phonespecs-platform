import prisma from "@/lib/prisma";
import { calculateSpecScore } from "@/lib/spec-score";

interface SpecData {
  key: string;
  name: string;
  value: string;
  unit: string | null;
  groupSlug: string;
}

function specEmoji(key: string, groupSlug: string): string {
  if (key.includes("display") || key.includes("screen")) return "🔲";
  if (key.includes("camera") || key.includes("resolution")) return "📷";
  if (key.includes("battery") || key.includes("capacity")) return "🔋";
  if (key.includes("storage") || key.includes("memory") || key.includes("ram")) return "💾";
  if (key.includes("processor") || key.includes("chipset") || key.includes("cpu")) return "⚡";
  if (key.includes("charging")) return "🔌";
  if (key.includes("wifi") || key.includes("wlan")) return "📶";
  if (key.includes("bluetooth")) return "🔵";
  if (key.includes("fingerprint") || key.includes("security")) return "🔒";
  if (key.includes("water") || key.includes("ip_rating")) return "💧";
  if (key.includes("weight")) return "⚖️";
  if (key.includes("dimension")) return "📐";
  if (groupSlug === "display") return "🖥️";
  if (groupSlug === "camera") return "📸";
  if (groupSlug === "battery") return "🔋";
  if (groupSlug === "performance") return "🚀";
  if (groupSlug === "connectivity") return "🌐";
  return "▫️";
}

function buildSocialMediaText(
  phoneName: string,
  brandName: string,
  price: string | null,
  specScore: number,
  specs: SpecData[],
): Record<string, string> {
  const priceText = price || "Price TBA";
  const scoreText = specScore > 0 ? `⭐ Spec Score: ${specScore}%` : "";
  const hashtags = `#${brandName.replace(/\s+/g, "")} #${phoneName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")} #Smartphone #MobileSpecs`;

  const specLines = specs.map(
    (s) => `${specEmoji(s.key, s.groupSlug)} ${s.name}: ${s.value}${s.unit ? ` ${s.unit}` : ""}`
  );

  const general = [
    `📱 ${phoneName}`,
    `💰 ${priceText}`,
    scoreText,
    "",
    `📋 Specifications:`,
    ...specLines,
    "",
    hashtags,
  ].filter(Boolean).join("\n");

  const facebook = [
    `📱 ${phoneName} — Full Specs`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `💰 Price: ${priceText}`,
    scoreText,
    "",
    `📋 Specifications:`,
    ...specLines,
    "",
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🔗 Full review & comparison available`,
    "",
    hashtags,
  ].filter(Boolean).join("\n");

  const twitterSpecs = specs.slice(0, 5).map(
    (s) => `${specEmoji(s.key, s.groupSlug)} ${s.name}: ${s.value}${s.unit ? ` ${s.unit}` : ""}`
  );
  const twitter = [
    `📱 ${phoneName}`,
    `💰 ${priceText}`,
    "",
    ...twitterSpecs,
    "",
    scoreText,
    "",
    hashtags,
  ].filter(Boolean).join("\n");

  const instagram = [
    `📱 ${phoneName}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `💰 ${priceText}`,
    scoreText,
    "",
    ...specLines,
    "",
    `━━━━━━━━━━━━━━━━━━━━━`,
    `💬 What do you think? Comment below! 👇`,
    "",
    ".",
    ".",
    ".",
    hashtags,
    "#TechReview #PhoneSpecs #TechNews #GadgetReview #SmartphoneReview",
  ].filter(Boolean).join("\n");

  return { general, facebook, twitter, instagram };
}

/**
 * Generate and save social media post text for a phone.
 * Called automatically when a phone is created or specs are updated.
 */
export async function generateAndSaveSocialMediaPost(phoneId: string): Promise<void> {
  try {
    const phone = await prisma.phone.findUnique({
      where: { id: phoneId },
      include: {
        brand: { select: { name: true } },
        specs: {
          include: {
            spec: {
              include: { group: { select: { slug: true } } },
            },
          },
          where: { spec: { showInCard: true } },
        },
      },
    });

    if (!phone) return;

    // Get all specs for score calculation
    const allSpecs = await prisma.phoneSpec.findMany({
      where: { phoneId },
      include: {
        spec: { include: { group: true } },
      },
    });

    const specScore = calculateSpecScore(
      allSpecs.map((s) => ({
        key: s.spec.key,
        value: s.value,
        numericValue: s.numericValue,
        group: s.spec.group,
      }))
    );

    const specsForPost: SpecData[] = phone.specs
      .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
      .map((s) => ({
        key: s.spec.key,
        name: s.spec.name,
        value: s.value,
        unit: s.spec.unit,
        groupSlug: s.spec.group.slug,
      }));

    const price = phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : null);

    const posts = buildSocialMediaText(
      phone.name,
      phone.brand.name,
      price,
      specScore.overall,
      specsForPost,
    );

    // Store as JSON with all formats
    await prisma.phone.update({
      where: { id: phoneId },
      data: { socialMediaPost: JSON.stringify(posts) },
    });
  } catch (error) {
    console.error("Failed to generate social media post:", error);
  }
}
