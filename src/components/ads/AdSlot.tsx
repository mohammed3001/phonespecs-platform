"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface AdData {
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

interface AdSlotProps {
  slotSlug: string;
  pageType: string;
  phoneId?: string;
  brandId?: string;
  className?: string;
  variant?: "banner" | "sidebar" | "inline" | "native";
}

export default function AdSlot({
  slotSlug,
  pageType,
  phoneId,
  brandId,
  className = "",
  variant = "banner",
}: AdSlotProps) {
  const [ad, setAd] = useState<AdData | null>(null);
  const [fallbackHtml, setFallbackHtml] = useState<string | null>(null);
  const [impressionTracked, setImpressionTracked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      slot: slotSlug,
      pageType,
      pageUrl: window.location.pathname,
    });
    if (phoneId) params.set("phoneId", phoneId);
    if (brandId) params.set("brandId", brandId);

    fetch(`/api/ads/serve?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.ad) {
          setAd(data.data.ad);
        } else if (data.success && data.data?.fallbackHtml) {
          setFallbackHtml(data.data.fallbackHtml);
        }
      })
      .catch(() => {});
  }, [slotSlug, pageType, phoneId, brandId]);

  // Track impression when ad becomes visible
  useEffect(() => {
    if (!ad || impressionTracked) return;

    const trackImpression = () => {
      fetch("/api/ads/impression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: ad.campaignId,
          creativeId: ad.creativeId,
          slotId: ad.slotId,
          pageUrl: window.location.pathname,
          deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
        }),
      }).catch(() => {});
      setImpressionTracked(true);
    };

    // Use Intersection Observer for viewability tracking
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trackImpression();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const el = document.getElementById(`ad-slot-${slotSlug}`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [ad, impressionTracked, slotSlug]);

  const handleClick = useCallback(() => {
    if (!ad) return;

    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: ad.campaignId,
        creativeId: ad.creativeId,
        slotId: ad.slotId,
        clickUrl: ad.clickUrl,
        pageUrl: window.location.pathname,
      }),
    }).catch(() => {});
  }, [ad]);

  if (!ad && !fallbackHtml) return null;

  if (fallbackHtml) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
      />
    );
  }

  if (!ad) return null;

  if (variant === "native" || ad.campaignType === "sponsored_product") {
    return (
      <div
        id={`ad-slot-${slotSlug}`}
        className={`relative border border-blue-100 bg-blue-50/30 rounded-xl overflow-hidden ${className}`}
      >
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {ad.sponsoredLabel}
          </span>
        </div>

        {ad.clickUrl ? (
          <a
            href={ad.clickUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="block p-4 hover:bg-blue-50/50 transition-colors"
          >
            <NativeAdContent ad={ad} />
          </a>
        ) : ad.phone ? (
          <Link
            href={`/phones/${ad.phone.slug}`}
            onClick={handleClick}
            className="block p-4 hover:bg-blue-50/50 transition-colors"
          >
            <NativeAdContent ad={ad} />
          </Link>
        ) : (
          <div className="p-4">
            <NativeAdContent ad={ad} />
          </div>
        )}
      </div>
    );
  }

  // Banner variant
  return (
    <div
      id={`ad-slot-${slotSlug}`}
      className={`relative bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg overflow-hidden ${className}`}
    >
      <div className="absolute top-1 right-1 z-10">
        <span className="text-[9px] font-medium text-gray-400 bg-white/80 px-1.5 py-0.5 rounded">
          {ad.sponsoredLabel}
        </span>
      </div>

      {ad.clickUrl ? (
        <a
          href={ad.clickUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block"
        >
          <BannerAdContent ad={ad} />
        </a>
      ) : (
        <BannerAdContent ad={ad} />
      )}
    </div>
  );
}

function NativeAdContent({ ad }: { ad: AdData }) {
  return (
    <div className="flex items-center gap-4">
      {(ad.image || ad.phone?.mainImage) && (
        <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg flex items-center justify-center p-1">
          <img
            src={ad.image || ad.phone?.mainImage || ""}
            alt={ad.title || ad.phone?.name || "Sponsored"}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {ad.title || ad.phone?.name}
        </p>
        {ad.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {ad.description}
          </p>
        )}
      </div>
    </div>
  );
}

function BannerAdContent({ ad }: { ad: AdData }) {
  return (
    <div className="flex items-center justify-center p-3 min-h-[60px]">
      {ad.image ? (
        <img
          src={ad.image}
          alt={ad.title || "Sponsored"}
          className="max-h-[90px] object-contain"
          loading="lazy"
        />
      ) : (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{ad.title}</p>
          {ad.description && (
            <p className="text-xs text-gray-500 mt-1">{ad.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
