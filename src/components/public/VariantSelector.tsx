"use client";

import { useState } from "react";

interface Variant {
  id: string;
  name: string;
  storage: string | null;
  ram: string | null;
  priceUsd: number | null;
  isDefault: boolean;
}

export default function VariantSelector({ variants, defaultPrice }: { variants: Variant[]; defaultPrice: number | null }) {
  const [selectedId, setSelectedId] = useState(() => {
    const def = variants.find((v) => v.isDefault);
    return def?.id || variants[0]?.id || "";
  });

  if (variants.length <= 1) return null;

  const selected = variants.find((v) => v.id === selectedId);

  return (
    <div className="mt-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Variants</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isActive = v.id === selectedId;
          const label = [v.ram, v.storage].filter(Boolean).join(" / ") || v.name;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className={`inline-flex flex-col items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                isActive
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <span className="font-semibold">{label}</span>
              {v.priceUsd && (
                <span className={`text-xs mt-0.5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}>
                  ${v.priceUsd.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected?.priceUsd && selected.priceUsd !== defaultPrice && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Price for {[selected.ram, selected.storage].filter(Boolean).join(" / ")}: <span className="font-semibold text-gray-900 dark:text-white">${selected.priceUsd.toLocaleString()}</span>
        </p>
      )}
    </div>
  );
}
