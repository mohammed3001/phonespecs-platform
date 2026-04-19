"use client";

import { useState, useRef } from "react";
import { SpecIcon } from "@/components/shared/SpecIcon";

interface QuickSpec {
  key: string;
  name: string;
  value: string;
  unit: string | null;
  groupName: string;
  groupSlug: string;
}

interface QuickSpecsDropdownProps {
  specs: QuickSpec[];
  phoneName: string;
  brandName: string;
  price: string | null;
  specScore: number;
  preGeneratedPost: string | null;
}

export default function QuickSpecsDropdown({
  specs,
  phoneName,
  brandName,
  price,
  specScore,
  preGeneratedPost,
}: QuickSpecsDropdownProps) {
  // Parse pre-generated posts if available
  const preGenerated: Record<string, string> | null = (() => {
    if (!preGeneratedPost) return null;
    try { return JSON.parse(preGeneratedPost); } catch { return null; }
  })();
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  type CopyFormat = "general" | "facebook" | "instagram" | "twitter";
  const [, setCopyFormat] = useState<CopyFormat>("general");
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  // Group specs by category
  const grouped: Record<string, { name: string; specs: QuickSpec[] }> = {};
  for (const s of specs) {
    if (!grouped[s.groupSlug]) {
      grouped[s.groupSlug] = { name: s.groupName, specs: [] };
    }
    grouped[s.groupSlug].specs.push(s);
  }

  // Spec emoji mapping for social media
  const specEmoji = (key: string, groupSlug: string): string => {
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
  };

  const generateSocialText = (format: CopyFormat): string => {
    const specLines = specs.map(
      (s) => `${specEmoji(s.key, s.groupSlug)} ${s.name}: ${s.value}${s.unit ? ` ${s.unit}` : ""}`
    );

    const hashtags = `#${brandName.replace(/\s+/g, "")} #${phoneName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "")} #Smartphone #MobileSpecs`;
    const priceText = price || "Price TBA";
    const scoreText = specScore > 0 ? `⭐ Spec Score: ${specScore}%` : "";

    switch (format) {
      case "twitter":
        // Twitter: compact, 280 char limit
        const twitterSpecs = specs.slice(0, 5).map(
          (s) => `${specEmoji(s.key, s.groupSlug)} ${s.name}: ${s.value}${s.unit ? ` ${s.unit}` : ""}`
        );
        return [
          `📱 ${phoneName}`,
          `💰 ${priceText}`,
          "",
          ...twitterSpecs,
          "",
          scoreText,
          "",
          hashtags,
        ].filter(Boolean).join("\n");

      case "facebook":
        return [
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

      case "instagram":
        return [
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

      default:
        return [
          `📱 ${phoneName}`,
          `💰 ${priceText}`,
          scoreText,
          "",
          `📋 Specifications:`,
          ...specLines,
          "",
          hashtags,
        ].filter(Boolean).join("\n");
    }
  };

  const handleCopy = async (format: CopyFormat) => {
    // Use pre-generated text from DB if available, otherwise generate client-side
    const text = preGenerated?.[format] || generateSocialText(format);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyFormat(format);
      setShowFormatMenu(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setShowFormatMenu(false);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatOptions = [
    { key: "general" as const, label: "General", icon: "📋", desc: "Plain format" },
    { key: "facebook" as const, label: "Facebook", icon: "📘", desc: "Detailed post" },
    { key: "instagram" as const, label: "Instagram", icon: "📸", desc: "With hashtags" },
    { key: "twitter" as const, label: "X / Twitter", icon: "𝕏", desc: "Compact" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header — toggle dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Quick Specs</h3>
          <span className="text-xs text-gray-400 font-medium">{specs.length} specs</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800">
          {/* Specs list grouped by category */}
          <div className="mt-3 space-y-4">
            {Object.entries(grouped).map(([groupSlug, { name, specs: groupSpecs }]) => (
              <div key={groupSlug}>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{name}</p>
                <div className="space-y-2">
                  {groupSpecs.map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <SpecIcon specKey={s.key} size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right truncate max-w-[140px]">
                        {s.value}{s.unit ? ` ${s.unit}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Copy for Social Media */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="relative" ref={formatMenuRef}>
              <button
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  copied
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800"
                    : "bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-700 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-800 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Copy for Social Media
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Format selector dropdown */}
              {showFormatMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
                  {formatOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleCopy(opt.key)}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
