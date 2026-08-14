
interface SectionSkeletonProps {
  title?: boolean | string
  cards?: number
  layout?: 'grid' | 'carousel' | 'hero'
}

export const SectionSkeleton = ({ 
  title = true, 
  cards = 4, 
  layout = 'grid' 
}: SectionSkeletonProps) => {
  if (layout === 'hero') {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="h-8 w-48 bg-white/10 rounded-full mx-auto mb-6" />
          <div className="h-16 w-128 bg-white/10 rounded mx-auto mb-6" />
          <div className="h-6 w-96 bg-white/10 rounded mx-auto" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {title && (
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-10 w-96 bg-gray-200 rounded mx-auto mb-4" />
            <div className="h-5 w-128 bg-gray-200 rounded mx-auto" />
          </div>
        )}
        
        {/* Cards */}
        {layout === 'carousel' ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: cards }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: cards }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64" />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}