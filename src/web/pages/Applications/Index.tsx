import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Building2, Package, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

// Iconos para cada industria
const industryIcons: Record<string, string> = {
  'Industria Alimenticia': '🍽️',
  'Agroindustrial': '🌾',
  'Industria Minera': '⛏️',
  'Industria Metalúrgica': '',
  'Petróleo y Gas': '⛽',
  'Manufactura': '🏭',
  'Construcción': '🏗️',
  'Transporte': '🚚',
  'Logística': '',
}

export const ApplicationsIndex = () => {
  const { data: globals } = useGlobalData()
  const industrias = globals?.industrias || []

  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Building2 size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Sectores que Atendemos</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Aplicaciones e Industrias
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Experiencia comprobada en los sectores más exigentes de Bolivia
          </p>
        </div>
      </section>

      {/* Grid de industrias */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {industrias.map((industria) => (
              <Link
                key={industria.id}
                to={`/applications/${industria.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1"
              >
                {/* Header con icono */}
                <div className="relative h-48 bg-gradient-to-br from-[#EA0A2A]/5 to-[#EA0A2A]/15 overflow-hidden flex items-center justify-center">
                  {industria.imagen ? (
                    <img
                      src={getSupabaseImageUrl(industria.imagen, 'industrias-imagenes') || ''}
                      alt={industria.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-7xl group-hover:scale-110 transition-transform duration-500">
                      {industryIcons[industria.nombre] || '🏭'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#EA0A2A] transition-colors">
                    {industria.nombre}
                  </h3>

                  {/* Contadores */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Package size={14} className="text-[#EA0A2A]" />
                      <span>{industria.categorias?.length || 0} productos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Wrench size={14} className="text-[#EA0A2A]" />
                      <span>{industria.servicios?.length || 0} servicios</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Ver soluciones</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {industrias.length === 0 && (
            <div className="text-center py-16">
              <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin industrias disponibles</h3>
              <p className="text-gray-500">Próximamente agregaremos más sectores.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            ¿Tu sector no está en la lista?
          </h2>
          <p className="text-gray-600 mb-6">
            Contáctanos y nuestro equipo técnico te ayudará a encontrar la solución perfecta para tu industria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-[#EA0A2A] hover:bg-[#c90825] text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Contactar Ahora
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/59177306576?text=Hola%2C%20necesito%20soluciones%20para%20mi%20industria"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}