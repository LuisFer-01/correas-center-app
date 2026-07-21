import { useGlobalData } from '@/hooks/useGlobalData'
import { Award, CheckCircle2, Factory, Truck, Users } from 'lucide-react'

export const Infrastructure = () => {
  const { data: globals } = useGlobalData()
  const caracteristicas = globals?.infraestructura_caracteristicas || []
  const capacidades = globals?.infraestructura_capacidades || []

  if (caracteristicas.length === 0 && capacidades.length === 0) return null

  const getIcon = (icono: string | null) => {
    const map: Record<string, any> = {
      'Factory': Factory,
      'Truck': Truck,
      'Users': Users,
      'Award': Award,
      'CheckCircle2': CheckCircle2,
    }
    return map[icono || ''] || Factory
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/10 rounded-full px-4 py-2 mb-4">
            <Factory size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-[#EA0A2A] font-semibold">Nuestra Infraestructura</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Capacidades de Producción y Servicio
          </h2>
          <p className="text-lg text-gray-600 max-w-1xl mx-auto">
            Infraestructura moderna y equipo técnico especializado para brindarte el mejor servicio
          </p>
        </div>

        {caracteristicas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {caracteristicas.map((feature) => {
              const IconComponent = getIcon(feature.icono)
              return (
                <div
                  key={feature.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-[#EA0A2A]/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="bg-[#EA0A2A]/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#EA0A2A] transition-colors">
                    <IconComponent size={28} className="text-[#EA0A2A] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {feature.descripcion}
                  </p>
                  {feature.stats && (
                    <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-sm font-bold px-3 py-1 rounded-full">
                      {feature.stats}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {capacidades.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Nuestras Capacidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacidades.map((capability) => {
                const IconComponent = getIcon(capability.icono)
                return (
                  <div
                    key={capability.id}
                    className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                  >
                    <div className="bg-[#EA0A2A] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent size={18} className="text-white" />
                    </div>
                    <span className="text-white font-medium">
                      {capability.nombre}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}