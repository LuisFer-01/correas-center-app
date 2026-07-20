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

// Correcion de doble footer y doble menu en la pagina de inicio
export const Home = () => {
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