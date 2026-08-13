import { useGlobalData } from '@/hooks/useGlobalData'
import { Brands } from '@/web/components/landing/Brands'
import { Contact } from '@/web/components/landing/Contact'
import { Differentials } from '@/web/components/landing/Differentials'
import { Hero } from '@/web/components/landing/Hero'
import { Industries } from '@/web/components/landing/Industries'
import { Infrastructure } from '@/web/components/landing/Infrastructure'
import { Locations } from '@/web/components/landing/Locations'
import { Products } from '@/web/components/landing/Products'
import { Services } from '@/web/components/landing/Services'
import { ProductSelector } from '@/web/components/ProductSelector'
import { SectionSkeleton } from '@/web/components/skeletons/SectionSkeleton'

export const Home = () => {
  const { isLoading } = useGlobalData()

  // ✅ NUEVO: Mostrar skeletons mientras carga
  if (isLoading) {
    return (
      <>
        {/* Hero Skeleton */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-gray-900 to-gray-800 animate-pulse">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="h-8 w-48 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="h-16 w-128 bg-white/10 rounded mx-auto mb-6" />
            <div className="h-6 w-96 bg-white/10 rounded mx-auto" />
          </div>
        </section>

        {/* ProductSelector Skeleton */}
        <SectionSkeleton title={'true'} cards={6} layout="grid" />

        {/* Products Skeleton */}
        <SectionSkeleton title={'true'} cards={8} layout="grid" />

        {/* Brands Skeleton */}
        <SectionSkeleton title={'true'} cards={10} layout="carousel" />

        {/* Services Skeleton */}
        <SectionSkeleton title={'true'} cards={6} layout="grid" />

        {/* Industries Skeleton */}
        <SectionSkeleton title={'true'} cards={6} layout="grid" />

        {/* Infrastructure Skeleton */}
        <SectionSkeleton title={'true'} cards={4} layout="grid" />

        {/* Differentials Skeleton */}
        <SectionSkeleton title={'true'} cards={6} layout="grid" />

        {/* Locations Skeleton */}
        <SectionSkeleton title={'true'} cards={3} layout="grid" />

        {/* Contact Skeleton */}
        <SectionSkeleton title={'true'} cards={1} layout="grid" />
      </>
    )
  }

  return (
    <>
      <Hero />
      <ProductSelector />
      <Products />
      <Brands />
      <Services />
      <Industries />
      <Infrastructure />
      <Differentials />
      <Locations />
      <Contact />
    </>
  )
}