"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CategoryScore {
  score: number;
  max: number;
  details: string[];
}

interface ScoredPhone {
  phone: {
    id: string;
    name: string;
    slug: string;
    brandName: string;
    brandSlug: string;
    price: number | null;
    priceDisplay: string | null;
    mainImage: string | null;
    marketStatus: string;
  };
  totalScore: number;
  categoryScores: {
    camera: CategoryScore;
    battery: CategoryScore;
    performance: CategoryScore;
    display: CategoryScore;
    value: CategoryScore;
  };
  matchReasons: string[];
  warnings: string[];
  rank: number;
}

interface DecisionResult {
  recommendations: ScoredPhone[];
  totalCandidates: number;
  filteredOut: number;
}

const STEPS = ["budget", "priorities", "brand", "results"] as const;
type Step = (typeof STEPS)[number];

const BUDGET_PRESETS = [
  { label: "Under $300", min: 0, max: 300 },
  { label: "$300 – $500", min: 300, max: 500 },
  { label: "$500 – $800", min: 500, max: 800 },
  { label: "$800 – $1,100", min: 800, max: 1100 },
  { label: "$1,100+", min: 1100, max: 2000 },
  { label: "Any Budget", min: 0, max: 5000 },
];

const PRIORITY_OPTIONS = [
  {
    key: "camera" as const,
    label: "Camera",
    icon: "📷",
    description: "Photo & video quality, features",
  },
  {
    key: "battery" as const,
    label: "Battery",
    icon: "🔋",
    description: "Battery life & charging speed",
  },
  {
    key: "performance" as const,
    label: "Performance",
    icon: "⚡",
    description: "Speed, RAM, storage capacity",
  },
  {
    key: "display" as const,
    label: "Display",
    icon: "📱",
    description: "Screen quality & refresh rate",
  },
  {
    key: "value" as const,
    label: "Value",
    icon: "💰",
    description: "Best specs for the price",
  },
];

const categoryColors: Record<string, string> = {
  camera: "bg-purple-500",
  battery: "bg-green-500",
  performance: "bg-red-500",
  display: "bg-blue-500",
  value: "bg-amber-500",
};

export default function DecisionEngineWizard({ brands }: { brands: Array<{ name: string; slug: string }> }) {
  const [step, setStep] = useState<Step>("budget");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(5000);
  const [priorities, setPriorities] = useState({
    camera: 3,
    battery: 3,
    performance: 3,
    display: 3,
    value: 3,
  });
  const [brandPreference, setBrandPreference] = useState("");
  const [results, setResults] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);

  const currentStepIndex = STEPS.indexOf(step);

  const handleBudgetSelect = (index: number, min: number, max: number) => {
    setSelectedBudget(index);
    setBudgetMin(min);
    setBudgetMax(max);
  };

  const handlePriorityChange = (key: keyof typeof priorities, value: number) => {
    setPriorities((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStep("results");

    try {
      const res = await fetch("/api/decision-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetMax,
          budgetMin,
          priorities,
          brandPreference: brandPreference || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (error) {
      console.error("Decision engine error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const handleNext = () => {
    if (step === "brand") {
      handleSubmit();
    } else {
      const idx = STEPS.indexOf(step);
      if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    }
  };

  const handleRestart = () => {
    setStep("budget");
    setResults(null);
    setSelectedBudget(null);
    setBudgetMin(0);
    setBudgetMax(5000);
    setPriorities({ camera: 3, battery: 3, performance: 3, display: 3, value: 3 });
    setBrandPreference("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      {step !== "results" && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i <= currentStepIndex
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${
                  i <= currentStepIndex ? "text-gray-900 dark:text-white" : "text-gray-400"
                }`}>
                  {s === "budget" ? "Budget" : s === "priorities" ? "Priorities" : "Brand"}
                </span>
                {i < 2 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    i < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Budget */}
      {step === "budget" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What&apos;s your budget?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Select a price range that works for you</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BUDGET_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleBudgetSelect(i, preset.min, preset.max)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedBudget === i
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20/50"
                }`}
              >
                <span className={`text-lg font-bold ${
                  selectedBudget === i ? "text-blue-700" : "text-gray-900 dark:text-white"
                }`}>
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={selectedBudget === null}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Priorities */}
      {step === "priorities" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What matters most to you?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Rate each category from 0 (don&apos;t care) to 5 (top priority)</p>
          </div>
          <div className="space-y-4">
            {PRIORITY_OPTIONS.map((opt) => (
              <div key={opt.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{opt.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 w-8 text-center">
                    {priorities[opt.key]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">0</span>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={priorities[opt.key]}
                    onChange={(e) => handlePriorityChange(opt.key, Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-400 w-4">5</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Brand */}
      {step === "brand" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Any brand preference?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Optional — skip if you&apos;re open to any brand</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setBrandPreference("")}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                brandPreference === ""
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <span className="text-2xl">🌐</span>
              <p className="text-sm font-semibold mt-1 text-gray-700 dark:text-gray-200">Any Brand</p>
            </button>
            {brands.map((brand) => (
              <button
                key={brand.slug}
                onClick={() => setBrandPreference(brand.slug)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  brandPreference === brand.slug
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                <span className="text-2xl">{brand.name.charAt(0)}</span>
                <p className="text-sm font-semibold mt-1 text-gray-700 dark:text-gray-200">{brand.name}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-violet-700 transition-colors flex items-center gap-2"
            >
              Find My Phone
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === "results" && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">Analyzing phones...</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Scoring against your preferences</p>
            </div>
          ) : results ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Perfect Matches</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {results.recommendations.length} phone{results.recommendations.length !== 1 ? "s" : ""} matched
                  {results.filteredOut > 0 && ` (${results.filteredOut} filtered out)`}
                </p>
              </div>

              {results.recommendations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <span className="text-4xl">🤷</span>
                  <p className="text-gray-600 dark:text-gray-300 font-semibold mt-3">No phones match your criteria</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your budget or brand preference</p>
                  <button
                    onClick={handleRestart}
                    className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                  >
                    Start Over
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.recommendations.map((rec) => (
                    <div
                      key={rec.phone.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                        rec.rank === 1
                          ? "border-blue-300 ring-2 ring-blue-100"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {rec.rank === 1 && (
                        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-1.5 text-white text-xs font-bold text-center uppercase tracking-wider">
                          Best Match
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {rec.phone.mainImage ? (
                              <Image src={rec.phone.mainImage} alt={rec.phone.name} width={56} height={56} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-3xl">📱</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-gray-400 font-medium">{rec.phone.brandName}</p>
                                <Link
                                  href={`/phones/${rec.phone.slug}`}
                                  className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                                >
                                  {rec.phone.name}
                                </Link>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                                  {rec.totalScore}
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase font-semibold">Match Score</div>
                              </div>
                            </div>

                            <div className="mt-1 text-lg font-bold text-blue-600">
                              {rec.phone.priceDisplay || (rec.phone.price ? `$${rec.phone.price.toLocaleString()}` : "TBA")}
                            </div>

                            {/* Category Scores */}
                            <div className="grid grid-cols-5 gap-2 mt-4">
                              {(["camera", "battery", "performance", "display", "value"] as const).map((cat) => (
                                <div key={cat} className="text-center">
                                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                    {rec.categoryScores[cat].score}
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                    <div
                                      className={`h-full rounded-full ${categoryColors[cat]}`}
                                      style={{ width: `${rec.categoryScores[cat].score}%` }}
                                    />
                                  </div>
                                  <div className="text-[9px] text-gray-400 mt-0.5 capitalize">{cat}</div>
                                </div>
                              ))}
                            </div>

                            {/* Match Reasons */}
                            {rec.matchReasons.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {rec.matchReasons.map((reason, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Warnings */}
                            {rec.warnings.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {rec.warnings.map((warning, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-full"
                                  >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    {warning}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-4">
                              <Link
                                href={`/phones/${rec.phone.slug}`}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </Link>
                              <Link
                                href={`/compare?phones=${rec.phone.slug}`}
                                className="px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Compare
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Start Over
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Something went wrong. Please try again.</p>
              <button
                onClick={handleRestart}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
