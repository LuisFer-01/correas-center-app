import { useGlobalData } from '@/hooks/useGlobalData'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Industries = () => {
  const { data: globals } = useGlobalData()
  const industrias = globals?.industrias || []

  // Iconos para cada industria
  const industryIcons: Record<string, string> = {
    'Industria Alimenticia': '🍽️',
    'Agroindustrial': '',
    'Industria Minera': '️',
    'Industria Metalúrgica': '🔩',
    'Petróleo y Gas': '⛽',
    'Manufactura': '🏭',
    'Construcción': '🏗️',
    'Transporte': '🚚',
    'Logística': '📦',
  }

  if (industrias.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            Sectores que Atendemos
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Soluciones para Múltiples Industrias
          </h2>
          <p className="text-lg text-gray-600 max-w-1xl mx-auto">
            Experiencia comprobada en los sectores más exigentes de Bolivia
          </p>
        </div>

        {/* Grid de industrias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industrias.map((industria) => (
            <Link
              key={industria.id}
              to={`/applications/${industria.slug}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/20"
            >
              <div className="p-6">
                <div className="text-5xl mb-4">
                  {industryIcons[industria.nombre] || '🏭'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">
                  {industria.nombre}
                </h3>
                <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                  <span>Ver soluciones</span>
                  <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}