import prisma from "@/lib/prisma";
import { Icon } from "@iconify/react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchAnalyticsPage() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch analytics data
  const [totalQueries, queries24h, topQueries, zeroResultQueries, avgResponseTime, topClicked, recentQueries] =
    await Promise.all([
      prisma.searchQuery.count(),
      prisma.searchQuery.count({ where: { createdAt: { gte: last24h } } }),
      prisma.$queryRaw<Array<{ normalized_query: string; count: bigint }>>`
        SELECT normalized_query, COUNT(*) as count 
        FROM search_queries 
        WHERE source IN ('web', 'autocomplete')
        AND created_at >= ${last7d}
        GROUP BY normalized_query 
        ORDER BY count DESC 
        LIMIT 20
      `,
      prisma.$queryRaw<Array<{ normalized_query: string; count: bigint }>>`
        SELECT normalized_query, COUNT(*) as count 
        FROM search_queries 
        WHERE result_count = 0 
        AND source IN ('web', 'autocomplete')
        AND created_at >= ${last7d}
        GROUP BY normalized_query 
        ORDER BY count DESC 
        LIMIT 10
      `,
      prisma.$queryRaw<Array<{ avg_ms: number }>>`
        SELECT COALESCE(AVG(response_ms), 0) as avg_ms 
        FROM search_queries 
        WHERE response_ms IS NOT NULL 
        AND created_at >= ${last24h}
      `,
      prisma.$queryRaw<Array<{ clicked_slug: string; count: bigint }>>`
        SELECT clicked_slug, COUNT(*) as count 
        FROM search_queries 
        WHERE clicked_slug IS NOT NULL 
        AND created_at >= ${last7d}
        GROUP BY clicked_slug 
        ORDER BY count DESC 
        LIMIT 10
      `,
      prisma.searchQuery.findMany({
        where: { source: { in: ["web", "autocomplete"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          query: true,
          resultCount: true,
          source: true,
          responseMs: true,
          clickedSlug: true,
          createdAt: true,
        },
      }),
    ]);

  const avgMs = Number((avgResponseTime as Array<{ avg_ms: number }>)[0]?.avg_ms || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor search performance and user behavior</p>
        </div>
        <form action="/api/admin/search/reindex" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Icon icon="mdi:refresh" width={16} />
            Reindex
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="mdi:magnify"
          label="Total Searches"
          value={totalQueries.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon="mdi:clock-outline"
          label="Searches (24h)"
          value={queries24h.toLocaleString()}
          color="emerald"
        />
        <StatCard
          icon="mdi:lightning-bolt"
          label="Avg Response"
          value={`${Math.round(avgMs)}ms`}
          color="amber"
        />
        <StatCard
          icon="mdi:alert-circle-outline"
          label="Zero Results (7d)"
          value={zeroResultQueries.length.toString()}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:trending-up" width={18} className="text-blue-500" />
              Top Queries (7 days)
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topQueries.length > 0 ? (
              topQueries.map((q, i) => (
                <div key={q.normalized_query} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-gray-400 w-6">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-700 font-medium">{q.normalized_query}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {Number(q.count).toLocaleString()} searches
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No search data yet</div>
            )}
          </div>
        </div>

        {/* Zero Result Queries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" width={18} className="text-red-500" />
              Zero-Result Queries (7 days)
            </h2>
            <p className="text-xs text-gray-500 mt-1">Queries users searched but got no results — consider adding content for these</p>
          </div>
          <div className="divide-y divide-gray-50">
            {zeroResultQueries.length > 0 ? (
              zeroResultQueries.map((q) => (
                <div key={q.normalized_query} className="flex items-center gap-3 px-5 py-3">
                  <Icon icon="mdi:magnify-close" width={16} className="text-red-400" />
                  <span className="flex-1 text-sm text-gray-700">{q.normalized_query}</span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    {Number(q.count).toLocaleString()} times
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No zero-result queries</div>
            )}
          </div>
        </div>

        {/* Top Clicked Results */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:cursor-default-click" width={18} className="text-emerald-500" />
              Most Clicked Results (7 days)
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topClicked.length > 0 ? (
              topClicked.map((item) => (
                <div key={item.clicked_slug} className="flex items-center gap-3 px-5 py-3">
                  <Icon icon="mdi:cellphone" width={16} className="text-gray-400" />
                  <Link href={`/phones/${item.clicked_slug}`} className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    {item.clicked_slug}
                  </Link>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {Number(item.count).toLocaleString()} clicks
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No click data yet</div>
            )}
          </div>
        </div>

        {/* Recent Queries */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon="mdi:history" width={18} className="text-violet-500" />
              Recent Queries
            </h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {recentQueries.length > 0 ? (
              recentQueries.map((q) => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Icon
                    icon={q.source === "autocomplete" ? "mdi:text-search" : "mdi:magnify"}
                    width={14}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span className="flex-1 text-sm text-gray-700 truncate">{q.query || "(empty)"}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {q.resultCount} results
                  </span>
                  {q.responseMs && (
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{q.responseMs}ms</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No recent queries</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colorClasses: Record<string, { bg: string; icon: string; ring: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-100" },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon icon={icon} width={20} className={c.icon} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
