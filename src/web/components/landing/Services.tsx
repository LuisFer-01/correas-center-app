import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

// Helper para generar slug desde el nombre
const generateSlug = (nombre: string) => nombre.toLowerCase().replace(/\s+/g, '-')

export const Services = () => {
  const { data: globals } = useGlobalData()
  const servicios = globals?.servicios || []

  if (servicios.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            Nuestros Servicios
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Servicios Técnicos Especializados
          </h2>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">
            Soluciones integrales con soporte técnico experto para mantener tu operación funcionando
          </p>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {servicios.map((servicio) => {
            const slug = generateSlug(servicio.nombre)
            const imageUrl = servicio.imagen
              ? getSupabaseImageUrl(servicio.imagen, 'servicios-imagenes')
              : null

            return (
              <Link
                key={servicio.id}
                to={`/services/${slug}`}
                className="group bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 hover:border-[#EA0A2A]/50 transform hover:-translate-y-1"
              >
                {/* Imagen del servicio */}
                <div className="relative h-48 bg-gradient-to-br from-[#EA0A2A]/10 to-[#EA0A2A]/20 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={servicio.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#EA0A2A]/10 p-4 rounded-full">
                        <Wrench size={48} className="text-[#EA0A2A]" />
                      </div>
                    </div>
                  )}
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#EA0A2A] transition-colors">
                    {servicio.nombre}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {servicio.descripcion}
                  </p>
                  <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Más información</span>
                    <ArrowRight
                      size={16}
                      className="ml-1 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}