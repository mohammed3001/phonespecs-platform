import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, generateBreadcrumbJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import DecisionEngineWizard from "@/components/public/DecisionEngineWizard";

export const metadata: Metadata = {
  title: "Find My Phone - Personalized Phone Recommendations | MobilePlatform",
  description: "Answer a few questions about your budget, priorities, and preferences to get personalized smartphone recommendations powered by our decision engine.",
  alternates: {
    canonical: `${getSiteUrl()}/find-my-phone`,
  },
  openGraph: {
    title: "Find My Phone - Personalized Recommendations | MobilePlatform",
    description: "Get personalized smartphone recommendations based on your budget, camera needs, battery requirements, and more.",
    url: `${getSiteUrl()}/find-my-phone`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find My Phone | MobilePlatform",
    description: "Answer a few questions to get personalized phone recommendations.",
  },
};

export default async function FindMyPhonePage() {
  const brands = await prisma.brand.findMany({
    where: {
      phones: { some: { isPublished: true } },
    },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Find My Phone", href: "/find-my-phone" },
        ]),
      ]} />
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Find My Phone" },
          ]} />
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Find Your Perfect Phone
          </h1>
          <p className="text-blue-200/80 mt-4 text-lg max-w-2xl mx-auto">
            Answer 3 quick questions and our decision engine will find the best smartphone for your needs — no guesswork, just data.
          </p>
        </div>
      </section>

      {/* Wizard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <DecisionEngineWizard brands={brands} />
      </main>

      {/* How It Works */}
      <section className="bg-white border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Set Your Budget</h3>
              <p className="text-sm text-gray-500">Choose a price range that fits your needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Set Priorities</h3>
              <p className="text-sm text-gray-500">Rate what matters most — camera, battery, performance, display, or value</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🏆</div>
              <h3 className="font-bold text-gray-900 mb-2">Get Matches</h3>
              <p className="text-sm text-gray-500">See ranked recommendations with detailed scores and explanations</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
