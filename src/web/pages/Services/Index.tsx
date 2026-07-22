import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

// Helper para generar slug desde el nombre
const generateSlug = (nombre: string) => nombre.toLowerCase().replace(/\s+/g, '-')

export const ServicesIndex = () => {
  const { data: globals, isLoading } = useGlobalData()
  const servicios = globals?.servicios || []

  if (isLoading) {
    return (
      <>
        <div className="py-20 text-center text-gray-500">Cargando servicios...</div>
      </>
    )
  }

  return (
    <>
      {/* Header de página */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white">Servicios</span>
          </div> */}
          <div className="flex items-start gap-5">
            <div className="bg-[#EA0A2A] p-6 rounded-xl">
              <Wrench size={50} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl lg:text-5xl font-bold text-white mb-1">
                Nuestros Servicios
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl">
                Soluciones integrales con soporte técnico experto para mantener tu operación funcionando
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de servicios */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {servicios.map((servicio) => {
              const slug = generateSlug(servicio.nombre)
              return (
                <Link
                  key={servicio.id}
                  to={`/services/${slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1"
                >
                  {/* Imagen del servicio */}
                  <div className="relative h-48 bg-gradient-to-br from-[#EA0A2A]/5 to-[#EA0A2A]/15 overflow-hidden">
                    {servicio.imagen ? (
                      <img
                        src={getSupabaseImageUrl(servicio.imagen, 'servicios-imagenes') || ''}
                        alt={servicio.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#EA0A2A] to-[#c90825]">
                        <Wrench size={56} className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#EA0A2A] transition-colors">
                      {servicio.nombre}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {servicio.descripcion}
                    </p>
                    <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Más información</span>
                      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {servicios.length === 0 && (
            <div className="text-center py-16">
              <Wrench size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin servicios disponibles</h3>
              <p className="text-gray-500">Próximamente agregaremos más servicios.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}