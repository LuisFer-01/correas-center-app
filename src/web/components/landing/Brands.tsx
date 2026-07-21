import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export const Brands = () => {
  const { data: globals } = useGlobalData()
  const marcasFromDB = globals?.marcas || []
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (marcasFromDB.length === 0) return
    
    const interval = setInterval(() => {
      setOffset((prevOffset) => {
        const newOffset = prevOffset + 1
        const totalWidth = marcasFromDB.length * 224 // 200px + 24px gap
        return newOffset >= totalWidth ? 0 : newOffset
      })
    }, 30) // Se mueve cada 30ms para suavidad
    
    return () => clearInterval(interval)
  }, [marcasFromDB.length])

  // Duplicar las marcas para crear el efecto infinito
  const duplicatedMarcas = [...marcasFromDB, ...marcasFromDB, ...marcasFromDB]

  if (marcasFromDB.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#EA0A2A]/10 rounded-full px-4 py-2 mb-4">
            <p className="text-[#EA0A2A] font-semibold text-sm">MARCAS LÍDERES</p>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Representamos las Mejores Marcas Internacionales
          </h2>
          <p className="text-xl text-gray-600 max-w-1xl mx-auto">
            Calidad garantizada con productos de fabricantes reconocidos mundialmente
          </p>
        </div>

        {/* Carrusel Infinito */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-75 ease-linear"
              style={{ transform: `translateX(-${offset}px)` }}
            >
              {duplicatedMarcas.map((marca, index) => (
                <div
                  key={`${marca.id}-${index}`}
                  className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 hover:border-[#EA0A2A] hover:shadow-lg transition-all duration-300 p-4"
                >
                  {marca.logo ? (
                    <img
                      src={getSupabaseImageUrl(marca.logo, 'marcas-logos') || ''}
                      alt={marca.nombre}
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-700 hover:text-[#EA0A2A] transition-colors">
                        {marca.nombre}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Gradientes laterales para efecto de desvanecimiento */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#EA0A2A] to-[#C10923] p-8 rounded-xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-12 bg-white"></div>
            <p className="text-white font-bold text-lg">FABRICANTE AUTORIZADO</p>
            <div className="h-1 w-12 bg-white"></div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Licencia Exclusiva SKF para Bolivia
          </h3>
          <p className="text-white/90 text-lg">
            Únicos autorizados para fabricar sellos y retenes SKF en el país
          </p>
        </div>
      </div>
    </section>
  )
}