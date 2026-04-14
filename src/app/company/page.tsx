import Link from "next/link";

export default function CompanyPortalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/company" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">Company Portal</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">View Site</Link>
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Company & Brand Portal</h1>
          <p className="text-lg text-green-100 mb-8">
            Manage your brand presence, run advertising campaigns, and engage with your customers on MobilePlatform.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-xl font-medium hover:bg-green-50 transition-colors"
          >
            Sign In to Your Portal
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "📊", title: "Dashboard & Analytics", desc: "Track your brand's performance, phone views, and engagement metrics in real-time." },
            { icon: "🎯", title: "Advertising Campaigns", desc: "Create and manage sponsored campaigns with CPM, CPC, or flat-rate pricing models." },
            { icon: "🏪", title: "Showroom Management", desc: "Add and manage your showroom locations with working hours, maps, and contact info." },
            { icon: "💬", title: "Review Responses", desc: "Respond to customer reviews and questions directly from your portal." },
            { icon: "📱", title: "Phone Updates", desc: "Suggest updates to your phone specifications and keep your product info accurate." },
            { icon: "📈", title: "Campaign Reports", desc: "Detailed reporting on impressions, clicks, CTR, and ROI for your ad campaigns." },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-3">{feature.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your brand?</h2>
          <p className="text-gray-400 mb-8">Contact us to set up your company account and start managing your presence on MobilePlatform.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-500 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
