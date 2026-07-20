import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Hero = () => {
  const { data: globals } = useGlobalData()
  const heroesFromDB = globals?.heroes || []

  // Convertir datos de BD al formato esperado por el carrusel
  const carouselSlides = heroesFromDB.map((hero: any) => ({
    id: hero.id,
    image: hero.imagen ? getSupabaseImageUrl(hero.imagen, 'secciones-imagenes') : '/hero/default.jpg',
    title: hero.titulo,
    subtitle: hero.subtitulo,
    badge: hero.badge,
    ctaPrimary: {
      text: hero.cta_primary_text,
      href: hero.cta_primary_href,
    },
    ctaSecondary: {
      text: hero.cta_secondary_text,
      href: hero.cta_secondary_href,
    },
  }))

  const [currentSlide, setCurrentSlide] = useState(0)
  const [previousSlide, setPreviousSlide] = useState(0)
  const [contentVisible, setContentVisible] = useState(true)

  useEffect(() => {
    if (carouselSlides.length === 0) return
    const timer = setInterval(() => {
      // Primero difuminar el contenido
      setContentVisible(false)
      // Después de que el contenido se difumine, cambiar slide
      setTimeout(() => {
        setPreviousSlide(currentSlide)
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
      }, 800)
      // Mostrar el nuevo contenido después de que la imagen empiece a transicionar
      setTimeout(() => setContentVisible(true), 2000)
    }, 7000)
    return () => clearInterval(timer)
  }, [currentSlide, carouselSlides.length])

  // Si no hay slides, mostrar fallback
  if (carouselSlides.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Bienvenido a Correas Center
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Soluciones industriales de calidad
          </p>
        </div>
      </section>
    )
  }

  const currentSlideData = carouselSlides[currentSlide]
  
  const handleSlideChange = (index: number) => {
    setContentVisible(false)
    setTimeout(() => {
      setPreviousSlide(currentSlide)
      setCurrentSlide(index)
    }, 800)
    setTimeout(() => setContentVisible(true), 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Fondo con imagen */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/15 to-black/10">
        <img
          src={currentSlideData.image}
          alt="Industrial background"
          className="absolute w-full h-full object-cover transition-opacity duration-[4000ms] ease-in-out"
          style={{ opacity: 1 }}
        />
        {previousSlide !== currentSlide && (
          <img
            src={carouselSlides[previousSlide].image}
            alt=""
            className="absolute w-full h-full object-cover transition-opacity duration-[4000ms] ease-in-out"
            style={{ opacity: 0 }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/15"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          {currentSlideData.badge && (
            <div
              className={`inline-block bg-white/10 border border-white/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm transition-all duration-[1500ms] ease-in-out ${
                contentVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              }`}
            >
              <p className="text-white text-sm font-medium">
                {currentSlideData.badge}
              </p>
            </div>
          )}
          
          {/* CONTENEDOR CON ALTURA FIJA para evitar saltos */}
          <div className="min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] flex flex-col justify-center">
            {/* ✅ CORREGIDO: !text-white fuerza el color blanco sobre los estilos globales de index.css */}
            {/* ✅ CORREGIDO: font-extrabold hace que el texto se vea más grueso y legible */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold !text-white mb-6 leading-tight tracking-tight transition-all duration-[1500ms] ease-in-out ${
                contentVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
              }`}
            >
              {currentSlideData.title}
            </h1>
            
            {/* Subtítulo con difuminación suave */}
            {currentSlideData.subtitle && (
              <p
                className={`text-xl !text-white/90 mb-8 leading-relaxed transition-all duration-[1500ms] ease-in-out delay-200 ${
                  contentVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
                }`}
              >
                {currentSlideData.subtitle}
              </p>
            )}
          </div>
          
          {/* Botones CTA */}
          {(currentSlideData.ctaPrimary?.text || currentSlideData.ctaSecondary?.text) && (
            <div
              className={`flex flex-col sm:flex-row gap-4 mb-12 transition-all duration-[1500ms] ease-in-out delay-300 ${
                contentVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              }`}
            >
              {currentSlideData.ctaPrimary?.text && currentSlideData.ctaPrimary?.href && (
                <a
                  href={currentSlideData.ctaPrimary.href}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#EA0A2A] px-8 py-4 rounded-md hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {currentSlideData.ctaPrimary.text}
                  <ArrowRight size={20} />
                </a>
              )}
              {currentSlideData.ctaSecondary?.text && currentSlideData.ctaSecondary?.href && (
                <a
                  href={currentSlideData.ctaSecondary.href}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm !text-white px-8 py-4 rounded-md hover:bg-white/20 transition-all font-bold text-lg border border-white/30"
                >
                  {currentSlideData.ctaSecondary.text}
                </a>
              )}
            </div>
          )}
          
          {/* Indicadores - solo mostrar si hay más de 1 slide */}
          {carouselSlides.length > 1 && (
            <div
              className={`flex gap-2 mt-8 justify-center sm:justify-start transition-all duration-[1500ms] ease-in-out delay-300 ${
                contentVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
              }`}
            >
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}