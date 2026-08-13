import { Skeleton } from '@/components/ui/skeleton'

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list'
}

export const ProductCardSkeleton = ({ viewMode = 'grid' }: ProductCardSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <div className="group flex gap-4 md:gap-6 bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-6 animate-pulse">
        {/* Imagen */}
        <div className="relative w-40 md:w-56 h-40 md:h-44 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200" />
        
        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
      {/* Imagen */}
      <div className="relative h-52 bg-gray-200" />
      
      {/* Contenido */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-10 w-14" />
          <Skeleton className="h-10 w-14" />
          <Skeleton className="h-10 w-14" />
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}