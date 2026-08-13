import { Skeleton } from '@/components/ui/skeleton'

interface SectionSkeletonProps {
  title?: string
  cards?: number
  layout?: 'grid' | 'carousel'
}

export const SectionSkeleton = ({ 
  title = 'true', 
  cards = 4, 
  layout = 'grid' 
}: SectionSkeletonProps) => {
  return (
    <section className="py-16 md:py-24 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {title && (
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-5 w-128 mx-auto" />
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