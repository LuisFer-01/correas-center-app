import { useGlobalData } from '@/hooks/useGlobalData'
import { Award, Clock, Headphones, MapPin, Package, Users } from 'lucide-react'

export const Differentials = () => {
  const { data: globals } = useGlobalData()
  const diferenciales = globals?.diferenciales || []

  if (diferenciales.length === 0) return null

  const getIcon = (icono: string | null) => {
    const map: Record<string, any> = {
      'Clock': Clock,
      'Award': Award,
      'Package': Package,
      'Headphones': Headphones, // Nota: en Lucide v1+ es Headphones, no HeadphonesIcon
      'MapPin': MapPin,
      'Users': Users,
    }
    return map[icono || ''] || Award
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            ¿Por Qué Elegirnos?
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tu Socio Estratégico en Soluciones Industriales
          </h2>
          <p className="text-lg text-gray-600 max-w-1xl mx-auto">
            Compromiso, calidad y experiencia al servicio de tu industria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {diferenciales.map((feature) => {
            const IconComponent = getIcon(feature.icono)
            return (
              <div
                key={feature.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#EA0A2A]/20 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#EA0A2A]/10 p-3 rounded-lg group-hover:bg-[#EA0A2A] transition-colors">
                    <IconComponent size={32} className="text-[#EA0A2A] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {feature.titulo}
                    </h3>
                    <p className="text-sm text-[#EA0A2A] font-semibold">
                      {feature.subtitulo}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  {feature.descripcion}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}