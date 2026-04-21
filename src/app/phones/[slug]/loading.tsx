export default function PhoneDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image skeleton */}
        <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
        
        {/* Info skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
          
          <div className="flex gap-3">
            <div className="h-8 w-24 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse" />
            <div className="h-8 w-32 bg-gray-100 rounded-full animate-pulse" />
          </div>
          
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
          
          {/* Key specs skeleton */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Specs section skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
