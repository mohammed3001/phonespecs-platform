export default function BrandDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-4 w-48 bg-white dark:bg-gray-800/10 rounded animate-pulse mb-8" />
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-gray-800/10 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-8 w-48 bg-white dark:bg-gray-800/10 rounded-lg animate-pulse" />
              <div className="h-4 w-96 bg-white dark:bg-gray-800/5 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800/5 rounded-xl p-4 space-y-2">
                <div className="h-7 w-16 bg-white dark:bg-gray-800/10 rounded animate-pulse" />
                <div className="h-3 w-20 bg-white dark:bg-gray-800/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 p-4 space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
