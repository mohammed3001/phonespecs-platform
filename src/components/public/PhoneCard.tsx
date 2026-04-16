"use client";

import Image from "next/image";
import Link from "next/link";
import { SpecIcon } from "@/components/shared/SpecIcon";

interface PhoneSpec {
  value: string;
  spec: {
    name: string;
    key: string;
    unit: string | null;
    showInCard: boolean;
    isHighlighted: boolean;
    sortOrder: number;
    group: { name: string; slug: string };
  };
}

interface PhoneData {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  reviewScore: number;
  updatedAt: string | Date;
  brand: { name: string; slug: string };
  specs: PhoneSpec[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20" },
  coming_soon: { label: "Coming Soon", color: "text-amber-700 bg-amber-50 ring-amber-600/20" },
  discontinued: { label: "Discontinued", color: "text-gray-600 bg-gray-100 ring-gray-500/20" },
  rumored: { label: "Rumored", color: "text-violet-700 bg-violet-50 ring-violet-600/20" },
};

export default function PhoneCard({ phone, variant = "default" }: { phone: PhoneData; variant?: "default" | "compact" | "featured" }) {
  const keySpecs = phone.specs
    .filter((s) => s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const extraSpecs = phone.specs
    .filter((s) => s.spec.showInCard && !s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const status = statusConfig[phone.marketStatus] || statusConfig.available;

  if (variant === "compact") {
    return (
      <Link href={`/phones/${phone.slug}`} className="block group">
        <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-50 group-hover:to-violet-50 transition-colors overflow-hidden">
              {phone.mainImage ? (
                <Image src={phone.mainImage} alt={phone.name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{phone.name}</h3>
              <p className="text-xs text-gray-500">{phone.brand.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-blue-600 text-sm">
                {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/phones/${phone.slug}`} className="block group">
      <div className={`bg-white rounded-2xl border border-gray-200 hover:border-blue-200 transition-all duration-300 overflow-hidden ${
        variant === "featured" 
          ? "hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1" 
          : "hover:shadow-lg hover:shadow-black/5"
      }`}>
        {/* Header */}
        <div className="p-5">
          <div className="flex gap-4">
            {/* Phone Image */}
            <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-50 group-hover:to-violet-50 transition-colors overflow-hidden ${
              variant === "featured" ? "w-28 h-36" : "w-24 h-32"
            }`}>
              {phone.mainImage ? (
                <Image src={phone.mainImage} alt={phone.name} width={variant === "featured" ? 112 : 96} height={variant === "featured" ? 144 : 128} className="w-full h-full object-contain p-1" />
              ) : (
                <span className={variant === "featured" ? "text-5xl" : "text-4xl"}>📱</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{phone.brand.name}</p>
                  <h3 className={`font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors mt-0.5 ${
                    variant === "featured" ? "text-lg" : "text-base"
                  }`}>
                    {phone.name}
                  </h3>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`text-lg font-bold ${variant === "featured" ? "text-xl" : ""} bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent`}>
                  {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset ${status.color}`}>
                  {status.label}
                </span>
                {phone.reviewScore > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                    <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {phone.reviewScore.toFixed(1)}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-gray-400 mt-2">
                Updated {new Date(phone.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Key Specs */}
        {keySpecs.length > 0 && (
          <div className="px-5 pb-3">
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Key Specs</p>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                {keySpecs.map((s) => (
                  <div key={s.spec.key} className="flex items-center gap-1.5">
                    <SpecIcon specKey={s.spec.key} size={14} className="text-blue-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 font-medium truncate">
                      {s.value}{s.spec.unit ? ` ${s.spec.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Extra Specs */}
        {extraSpecs.length > 0 && (
          <div className="px-5 pb-4">
            <div className="border-t border-gray-100 pt-3">
              <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                {extraSpecs.map((s) => (
                  <div key={s.spec.key} className="flex items-center gap-1.5">
                    <SpecIcon specKey={s.spec.key} size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-[11px] text-gray-500 truncate">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
