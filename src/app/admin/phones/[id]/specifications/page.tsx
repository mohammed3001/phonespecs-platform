"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface SpecDefinition {
  id: string;
  name: string;
  key: string;
  unit: string | null;
  dataType: string;
  subSection: string | null;
  sortOrder: number;
}

interface SpecGroup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  definitions: SpecDefinition[];
}

interface PhoneInfo {
  id: string;
  name: string;
  slug: string;
}

export default function PhoneSpecificationsPage() {
  const params = useParams();
  const phoneId = params.id as string;

  const [phone, setPhone] = useState<PhoneInfo | null>(null);
  const [groups, setGroups] = useState<SpecGroup[]>([]);
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pros/Cons state
  const [pros, setPros] = useState<string[]>([""]);
  const [cons, setCons] = useState<string[]>([""]);
  const [savingProsCons, setSavingProsCons] = useState(false);

  useEffect(() => {
    // Load specs and pros/cons in parallel
    Promise.all([
      fetch(`/api/admin/phones/${phoneId}/specs`).then((r) => r.json()),
      fetch(`/api/admin/phones/${phoneId}/pros-cons`).then((r) => r.json()),
    ])
      .then(([specsData, prosConsData]) => {
        if (specsData.success) {
          setPhone(specsData.data.phone);
          setGroups(specsData.data.groups);
          // Map specId -> value
          const vals: Record<string, string> = {};
          for (const [specId, sv] of Object.entries(specsData.data.specValues as Record<string, { value: string }>)) {
            vals[specId] = sv.value;
          }
          setSpecValues(vals);
        }
        if (prosConsData.success) {
          setPros(prosConsData.data.pros.length > 0 ? prosConsData.data.pros : [""]);
          setCons(prosConsData.data.cons.length > 0 ? prosConsData.data.cons : [""]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [phoneId]);

  const handleSpecChange = (specId: string, value: string) => {
    setSpecValues((prev) => ({ ...prev, [specId]: value }));
  };

  const handleSaveSpecs = async () => {
    setSaving(true);
    setMessage(null);

    const specs = Object.entries(specValues)
      .filter(([, value]) => value && value.trim() !== "")
      .map(([specId, value]) => {
        const numericValue = parseFloat(value);
        return {
          specId,
          value,
          numericValue: isNaN(numericValue) ? null : numericValue,
        };
      });

    try {
      const res = await fetch(`/api/admin/phones/${phoneId}/specs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specs }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Specifications saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save specs" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProsCons = async () => {
    setSavingProsCons(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/phones/${phoneId}/pros-cons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pros: pros.filter((p) => p.trim() !== ""),
          cons: cons.filter((c) => c.trim() !== ""),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Pros & Cons saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save pros/cons" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSavingProsCons(false);
    }
  };

  const addPro = () => setPros([...pros, ""]);
  const addCon = () => setCons([...cons, ""]);
  const removePro = (i: number) => setPros(pros.filter((_, idx) => idx !== i));
  const removeCon = (i: number) => setCons(cons.filter((_, idx) => idx !== i));
  const updatePro = (i: number, val: string) => {
    const updated = [...pros];
    updated[i] = val;
    setPros(updated);
  };
  const updateCon = (i: number, val: string) => {
    const updated = [...cons];
    updated[i] = val;
    setCons(updated);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Full Specifications</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {phone?.name} Full Specifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Edit all specification fields section by section
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/phones/${phoneId}/images`}
            className="px-4 py-2 bg-gray-100 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            📷 Images
          </Link>
          <button
            onClick={handleSaveSpecs}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Specifications"}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-700"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Specification Sections */}
      {groups.map((group) => {
        // Group definitions by subSection
        const noSubSection = group.definitions.filter((d) => !d.subSection);
        const subSections: Record<string, SpecDefinition[]> = {};
        for (const def of group.definitions) {
          if (def.subSection) {
            if (!subSections[def.subSection]) subSections[def.subSection] = [];
            subSections[def.subSection].push(def);
          }
        }
        const hasSubSections = Object.keys(subSections).length > 0;

        return (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-900 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{group.sortOrder}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {group.definitions.length} fields
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Fields without subSection */}
              {noSubSection.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {noSubSection.map((def) => (
                    <div key={def.id}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        {def.name}
                        {def.unit && <span className="text-gray-400 ml-1">({def.unit})</span>}
                      </label>
                      <input
                        type="text"
                        value={specValues[def.id] || ""}
                        onChange={(e) => handleSpecChange(def.id, e.target.value)}
                        placeholder={`Enter ${def.name.toLowerCase()}...`}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SubSection groups */}
              {hasSubSections && Object.entries(subSections).map(([subName, defs]) => (
                <div key={subName} className={noSubSection.length > 0 ? "mt-6" : ""}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider">
                      {subName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3 border-l-2 border-blue-100">
                    {defs.map((def) => (
                      <div key={def.id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {def.name}
                          {def.unit && <span className="text-gray-400 ml-1">({def.unit})</span>}
                        </label>
                        <input
                          type="text"
                          value={specValues[def.id] || ""}
                          onChange={(e) => handleSpecChange(def.id, e.target.value)}
                          placeholder={`Enter ${def.name.toLowerCase()}...`}
                          className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Pros & Cons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 text-sm">±</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pros & Cons</h2>
          </div>
          <button
            onClick={handleSaveProsCons}
            disabled={savingProsCons}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {savingProsCons ? "Saving..." : "Save Pros & Cons"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pros */}
          <div>
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              Pros
            </h3>
            <div className="space-y-2">
              {pros.map((pro, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updatePro(i, e.target.value)}
                    placeholder="Enter a pro..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {pros.length > 1 && (
                    <button
                      onClick={() => removePro(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPro}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Pro
              </button>
            </div>
          </div>

          {/* Cons */}
          <div>
            <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
              Cons
            </h3>
            <div className="space-y-2">
              {cons.map((con, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateCon(i, e.target.value)}
                    placeholder="Enter a con..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {cons.length > 1 && (
                    <button
                      onClick={() => removeCon(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addCon}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Con
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t shadow-lg -mx-6 px-6 py-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {Object.values(specValues).filter((v) => v && v.trim() !== "").length} of{" "}
          {groups.reduce((sum, g) => sum + g.definitions.length, 0)} fields filled
        </p>
        <button
          onClick={handleSaveSpecs}
          disabled={saving}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
        >
          {saving ? "Saving..." : "Save All Specifications"}
        </button>
      </div>
    </div>
  );
}
