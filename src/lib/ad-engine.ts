import prisma from "./prisma";

interface AdServeRequest {
  slotSlug: string;
  pageType: string;
  pageUrl?: string;
  phoneId?: string;
  brandId?: string;
  deviceType?: string;
  country?: string;
  userFingerprint?: string;
}

interface ServedAd {
  campaignId: string;
  creativeId: string;
  slotId: string;
  title: string | null;
  description: string | null;
  image: string | null;
  clickUrl: string | null;
  phone: { name: string; slug: string; mainImage: string | null } | null;
  campaignType: string;
  sponsoredLabel: string;
}

interface AdServeResult {
  ad: ServedAd | null;
  fallbackHtml: string | null;
  slotId: string | null;
}

/**
 * Core ad serving engine. Resolves the best ad for a given slot
 * respecting targeting, budget, priority, and frequency caps.
 */
export async function serveAd(request: AdServeRequest): Promise<AdServeResult> {
  // 1. Find the ad slot
  const slot = await prisma.adSlot.findFirst({
    where: {
      slug: request.slotSlug,
      pageType: request.pageType,
      isActive: true,
    },
  });

  if (!slot) {
    return { ad: null, fallbackHtml: null, slotId: null };
  }

  // 2. Find eligible campaigns
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: "active",
      OR: [
        { startDate: null },
        { startDate: { lte: todayStr } },
      ],
    },
    include: {
      creatives: {
        where: { isActive: true },
        include: {
          phone: { select: { name: true, slug: true, mainImage: true } },
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  // 3. Resolve brand/phone slugs for targeting (so targeting can use slugs or IDs)
  let requestBrandSlug: string | undefined;
  let requestPhoneSlug: string | undefined;
  if (request.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: request.brandId }, select: { slug: true, name: true } });
    if (brand) requestBrandSlug = brand.slug;
  }
  if (request.phoneId) {
    const phone = await prisma.phone.findUnique({ where: { id: request.phoneId }, select: { slug: true } });
    if (phone) requestPhoneSlug = phone.slug;
  }

  // Filter by budget, targeting, date, and frequency
  const eligibleAds: Array<{
    campaign: typeof campaigns[0];
    creative: typeof campaigns[0]["creatives"][0];
    score: number;
  }> = [];

  for (const campaign of campaigns) {
    // Check end date
    if (campaign.endDate && campaign.endDate < todayStr) continue;

    // Check total budget
    if (campaign.budgetTotal && campaign.spentTotal >= campaign.budgetTotal) continue;

    // Check daily budget
    if (campaign.budgetDaily) {
      const todaySpent = await getDailySpend(campaign.id, todayStr);
      if (todaySpent >= campaign.budgetDaily) continue;
    }

    // Check frequency cap
    if (campaign.frequencyCap && request.userFingerprint) {
      const impressionCount = await prisma.adImpression.count({
        where: {
          campaignId: campaign.id,
          userFingerprint: request.userFingerprint,
          createdAt: { gte: new Date(todayStr) },
        },
      });
      if (impressionCount >= campaign.frequencyCap) continue;
    }

    // Check targeting (pass both IDs and slugs so targeting can use either format)
    if (campaign.targeting) {
      if (!matchesTargeting(campaign.targeting, request, requestBrandSlug, requestPhoneSlug)) continue;
    }

    // Score each creative
    for (const creative of campaign.creatives) {
      let score = campaign.priority * 10;

      // Boost if creative targets the specific phone being viewed
      if (creative.phoneId && creative.phoneId === request.phoneId) {
        score += 50;
      }

      // Boost by bid amount
      if (campaign.bidAmount) {
        score += campaign.bidAmount;
      }

      eligibleAds.push({ campaign, creative, score });
    }
  }

  if (eligibleAds.length === 0) {
    return { ad: null, fallbackHtml: slot.fallbackHtml, slotId: slot.id };
  }

  // 4. Select the best ad (highest score with weighted randomization)
  eligibleAds.sort((a, b) => b.score - a.score);

  // Take top 3 candidates and do weighted random selection
  const topCandidates = eligibleAds.slice(0, 3);
  const totalScore = topCandidates.reduce((sum, c) => sum + c.score, 0);
  let random = Math.random() * totalScore;
  let selected = topCandidates[0];

  for (const candidate of topCandidates) {
    random -= candidate.score;
    if (random <= 0) {
      selected = candidate;
      break;
    }
  }

  const sponsoredLabels: Record<string, string> = {
    banner: "Sponsored",
    sponsored_product: "Sponsored Product",
    native: "Promoted",
    brand_spotlight: "Brand Spotlight",
  };

  return {
    ad: {
      campaignId: selected.campaign.id,
      creativeId: selected.creative.id,
      slotId: slot.id,
      title: selected.creative.title,
      description: selected.creative.description,
      image: selected.creative.image,
      clickUrl: selected.creative.clickUrl,
      phone: selected.creative.phone,
      campaignType: selected.campaign.type,
      sponsoredLabel: sponsoredLabels[selected.campaign.type] || "Sponsored",
    },
    fallbackHtml: null,
    slotId: slot.id,
  };
}

/**
 * Record an ad impression.
 */
export async function recordImpression(data: {
  campaignId: string;
  creativeId: string;
  slotId?: string;
  userFingerprint?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  pageUrl?: string;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [impression] = await Promise.all([
    prisma.adImpression.create({ data }),
    // Update daily stats
    prisma.adDailyStat.upsert({
      where: {
        campaignId_creativeId_date: {
          campaignId: data.campaignId,
          creativeId: data.creativeId,
          date: todayStr,
        },
      },
      update: { impressions: { increment: 1 } },
      create: {
        campaignId: data.campaignId,
        creativeId: data.creativeId,
        date: todayStr,
        impressions: 1,
      },
    }),
  ]);

  // Update campaign spent for CPM billing
  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId },
    select: { pricingModel: true, bidAmount: true },
  });

  if (campaign?.pricingModel === "cpm" && campaign.bidAmount) {
    // CPM = cost per 1000 impressions
    const costPerImpression = campaign.bidAmount / 1000;
    await prisma.campaign.update({
      where: { id: data.campaignId },
      data: { spentTotal: { increment: costPerImpression } },
    });
    await prisma.adDailyStat.update({
      where: {
        campaignId_creativeId_date: {
          campaignId: data.campaignId,
          creativeId: data.creativeId,
          date: todayStr,
        },
      },
      data: { spent: { increment: costPerImpression } },
    });
  }

  return impression;
}

/**
 * Record an ad click.
 */
export async function recordClick(data: {
  campaignId: string;
  creativeId: string;
  slotId?: string;
  userFingerprint?: string;
  ipAddress?: string;
  country?: string;
  deviceType?: string;
  pageUrl?: string;
  clickUrl?: string;
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [click] = await Promise.all([
    prisma.adClick.create({ data }),
    prisma.adDailyStat.upsert({
      where: {
        campaignId_creativeId_date: {
          campaignId: data.campaignId,
          creativeId: data.creativeId,
          date: todayStr,
        },
      },
      update: { clicks: { increment: 1 } },
      create: {
        campaignId: data.campaignId,
        creativeId: data.creativeId,
        date: todayStr,
        clicks: 1,
      },
    }),
  ]);

  // Update campaign spent for CPC billing
  const campaign = await prisma.campaign.findUnique({
    where: { id: data.campaignId },
    select: { pricingModel: true, bidAmount: true },
  });

  if (campaign?.pricingModel === "cpc" && campaign.bidAmount) {
    await prisma.campaign.update({
      where: { id: data.campaignId },
      data: { spentTotal: { increment: campaign.bidAmount } },
    });
    await prisma.adDailyStat.update({
      where: {
        campaignId_creativeId_date: {
          campaignId: data.campaignId,
          creativeId: data.creativeId,
          date: todayStr,
        },
      },
      data: { spent: { increment: campaign.bidAmount } },
    });
  }

  return click;
}

/**
 * Get today's spend for a campaign.
 */
async function getDailySpend(campaignId: string, date: string): Promise<number> {
  const stats = await prisma.adDailyStat.findMany({
    where: { campaignId, date },
    select: { spent: true },
  });
  return stats.reduce((sum, s) => sum + s.spent, 0);
}

/**
 * Match campaign targeting against request context.
 * Targeting is a JSON string: { brands?: string[], phones?: string[], devices?: string[], countries?: string[], pageTypes?: string[] }
 */
function matchesTargeting(
  targetingStr: string,
  request: AdServeRequest,
  brandSlug?: string,
  phoneSlug?: string,
): boolean {
  try {
    const targeting = JSON.parse(targetingStr);

    // Brand targeting — match by ID or slug/name
    if (targeting.brands?.length > 0 && request.brandId) {
      const brandMatches = targeting.brands.some((b: string) =>
        b === request.brandId || (brandSlug && b.toLowerCase() === brandSlug.toLowerCase())
      );
      if (!brandMatches) return false;
    }

    // Phone targeting — match by ID or slug
    if (targeting.phones?.length > 0 && request.phoneId) {
      const phoneMatches = targeting.phones.some((p: string) =>
        p === request.phoneId || (phoneSlug && p.toLowerCase() === phoneSlug.toLowerCase())
      );
      if (!phoneMatches) return false;
    }

    // Device targeting
    if (targeting.devices?.length > 0 && request.deviceType) {
      if (!targeting.devices.includes(request.deviceType)) return false;
    }

    // Country targeting
    if (targeting.countries?.length > 0 && request.country) {
      if (!targeting.countries.includes(request.country)) return false;
    }

    // Page type targeting
    if (targeting.pageTypes?.length > 0) {
      if (!targeting.pageTypes.includes(request.pageType)) return false;
    }

    return true;
  } catch {
    return true; // Invalid targeting JSON = no restrictions
  }
}

/**
 * Get campaign analytics for admin dashboard.
 */
export async function getCampaignAnalytics(campaignId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const dailyStats = await prisma.adDailyStat.findMany({
    where: {
      campaignId,
      date: { gte: startDateStr },
    },
    include: {
      creative: { select: { title: true, image: true } },
    },
    orderBy: { date: "asc" },
  });

  const totals = dailyStats.reduce(
    (acc, stat) => ({
      impressions: acc.impressions + stat.impressions,
      clicks: acc.clicks + stat.clicks,
      spent: acc.spent + stat.spent,
    }),
    { impressions: 0, clicks: 0, spent: 0 }
  );

  const ctr = totals.impressions > 0
    ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
    : "0.00";

  return {
    totals: { ...totals, ctr: parseFloat(ctr) },
    daily: dailyStats,
  };
}
