import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Building2, Package, Wrench } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

const industryIcons: Record<string, string> = {
  'Industria Alimenticia': '🍽️',
  'Agroindustrial': '🌾',
  'Industria Minera': '⛏️',
  'Industria Metalúrgica': '🔩',
  'Petróleo y Gas': '⛽',
  'Manufactura': '🏭',
  'Construcción': '🏗️',
  'Transporte': '🚚',
  'Logística': '📦',
}

export const ApplicationsShow = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: globals } = useGlobalData()
  
  const industria = globals?.industrias.find((i) => i.slug === slug)

  if (!industria) {
    return <Navigate to="/applications" replace />
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <Link to="/applications" className="hover:text-white transition-colors">Aplicaciones</Link>
            <span>/</span>
            <span className="text-white">{industria.nombre}</span>
          </div> */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">
              {industryIcons[industria.nombre] || '🏭'}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {industria.nombre}
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl">
            Soluciones especializadas para el sector de {industria.nombre.toLowerCase()}
          </p>
        </div>
      </section>

      {/* Categorías de productos */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#EA0A2A]/10 p-3 rounded-lg">
              <Package size={28} className="text-[#EA0A2A]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
                Productos Recomendados
              </h2>
              <p className="text-gray-600 text-sm">
                Soluciones específicas para tu industria
              </p>
            </div>
          </div>

          {industria.categorias && industria.categorias.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industria.categorias.map((categoria) => (
                <Link
                  key={categoria.id}
                  to={`/products/${categoria.producto?.slug}/${categoria.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1"
                >
                  <div className="p-5">
                    {categoria.producto && (
                      <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-semibold px-2 py-1 rounded-full mb-2">
                        {categoria.producto.nombre}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">
                      {categoria.nombre}
                    </h3>
                    {categoria.descripcion_corta && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {categoria.descripcion_corta}
                      </p>
                    )}
                    <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Ver detalles</span>
                      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Package size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Próximamente agregaremos productos para este sector.</p>
            </div>
          )}
        </div>
      </section>

      {/* Servicios */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#EA0A2A]/10 p-3 rounded-lg">
              <Wrench size={28} className="text-[#EA0A2A]" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold !text-gray-900">
                Servicios Disponibles
              </h2>
              <p className="text-gray-600 text-sm">
                Soporte técnico especializado para tu operación
              </p>
            </div>
          </div>

          {industria.servicios && industria.servicios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industria.servicios.map((servicio) => (
                <Link
                  key={servicio.id}
                  to={`/services/${servicio.nombre.toLowerCase().replace(/\s+/g, '-')}`}
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
                        <Wrench size={48} className="text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

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
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Wrench size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Próximamente agregaremos servicios para este sector.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] rounded-2xl p-8 md:p-12 text-white text-center">
            <Building2 size={48} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Necesitas una solución personalizada?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Nuestro equipo técnico especializado está listo para asesorarte y encontrar la mejor solución para {industria.nombre.toLowerCase()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/59177306576?text=${encodeURIComponent(`Hola, necesito soluciones para ${industria.nombre}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#EA0A2A] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center justify-center gap-2"
              >
                Solicitar Asesoría
                <ArrowRight size={18} />
              </a>
              <Link
                to="/contact"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-white/20"
              >
                Contactar Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}