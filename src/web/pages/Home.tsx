import { SectionSkeleton } from '@/web/components/skeletons/SectionSkeleton'
import React, { Suspense } from 'react'

// Lazy loading con default exports
const Hero = React.lazy(() => import('@/web/components/landing/Hero'))
const ProductSelector = React.lazy(() => import('@/web/components/ProductSelector'))
const Products = React.lazy(() => import('@/web/components/landing/Products'))
const Brands = React.lazy(() => import('@/web/components/landing/Brands'))
const Services = React.lazy(() => import('@/web/components/landing/Services'))
const Industries = React.lazy(() => import('@/web/components/landing/Industries'))
const Infrastructure = React.lazy(() => import('@/web/components/landing/Infrastructure'))
const Differentials = React.lazy(() => import('@/web/components/landing/Differentials'))
const Locations = React.lazy(() => import('@/web/components/landing/Locations'))
const Contact = React.lazy(() => import('@/web/components/landing/Contact'))

export const Home = () => {
  return (
    <>
      {/* Cada componente se carga bajo demanda con su skeleton */}
      <Suspense fallback={<SectionSkeleton cards={1} layout="hero" />}>
        <Hero />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={6} layout="grid" />}>
        <ProductSelector />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={8} layout="grid" />}>
        <Products />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={10} layout="carousel" />}>
        <Brands />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={6} layout="grid" />}>
        <Services />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={6} layout="grid" />}>
        <Industries />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={4} layout="grid" />}>
        <Infrastructure />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={6} layout="grid" />}>
        <Differentials />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={3} layout="grid" />}>
        <Locations />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton title={true} cards={1} layout="grid" />}>
        <Contact />
      </Suspense>
    </>
  )
}