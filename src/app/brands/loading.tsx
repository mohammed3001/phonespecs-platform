export default function BrandsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl animate-pulse mx-auto" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
