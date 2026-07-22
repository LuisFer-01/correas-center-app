import { useGlobalData } from '@/hooks/useGlobalData'
import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'

export const Locations = () => {
  const { data: globals } = useGlobalData()
  const sucursales = globals?.sucursales || []
  const [activeSucursal, setActiveSucursal] = useState<number>(0)

  if (sucursales.length === 0) return null

  const openWhatsApp = (sucursalNombre: string) => {
    const message = `Hola, estoy interesado en información sobre ${sucursalNombre}`
    const url = `https://wa.me/${globals?.whatsapp?.numero || '59177306576'}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            Ubicaciones
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Nuestras Sucursales
          </h2>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">
            Contamos con {sucursales.length} sucursales estratégicamente ubicadas para atenderte mejor
          </p>
        </div>

        {/* Grid interactivo: Lista + Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Lista de sucursales - Columna izquierda */}
          <div className="lg:col-span-1 space-y-3">
            {sucursales.map((sucursal, index) => (
              <button
                key={sucursal.id}
                onClick={() => setActiveSucursal(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                  activeSucursal === index
                    ? 'border-[#EA0A2A] bg-[#EA0A2A]/10 shadow-lg shadow-[#EA0A2A]/20'
                    : 'border-gray-700 bg-gray-800 hover:border-[#EA0A2A]/50 hover:bg-gray-800/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                      activeSucursal === index
                        ? 'bg-[#EA0A2A] text-white'
                        : 'bg-[#EA0A2A]/20 text-[#EA0A2A]'
                    }`}
                  >
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-bold mb-0 ${
                          activeSucursal === index ? 'text-white' : 'text-gray-200'
                        }`}
                      >
                        {sucursal.nombre}
                      </h4>
                      {sucursal.es_principal && (
                        <span className="text-[10px] bg-[#EA0A2A] text-white px-2 py-0.5 rounded-full font-semibold">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {sucursal.direccion}
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone size={12} className="text-[#EA0A2A]" />
                        <span>{sucursal.telefono}</span>
                      </div>
                      {sucursal.horarios && (
                        <div className="flex items-start gap-1.5 text-xs text-gray-400">
                          <Clock size={12} className="text-[#EA0A2A] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{sucursal.horarios}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mapa embebido - Columna derecha (ocupa 2 columnas) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl h-full min-h-[400px] md:min-h-[500px]">
              {sucursales[activeSucursal]?.mapa_incrustado ? (
                <iframe
                  src={sucursales[activeSucursal].mapa_incrustado}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '500px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${sucursales[activeSucursal].nombre}`}
                  className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-800">
                  <div className="text-center p-8">
                    <div className="bg-[#EA0A2A]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin size={40} className="text-[#EA0A2A]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {sucursales[activeSucursal]?.nombre}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Mapa no disponible para esta sucursal
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-center justify-center gap-2">
                        <MapPin size={16} className="text-[#EA0A2A]" />
                        {sucursales[activeSucursal]?.direccion}
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <Phone size={16} className="text-[#EA0A2A]" />
                        {sucursales[activeSucursal]?.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción rápida - Debajo del mapa */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => openWhatsApp(sucursales[activeSucursal]?.nombre || 'nuestra sucursal')}
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            <MessageCircle size={20} />
            Contactar por WhatsApp
          </button>
          <a
            href={`tel:${sucursales[activeSucursal]?.telefono?.replace(/\s/g, '') || ''}`}
            className="inline-flex items-center justify-center gap-2 bg-[#EA0A2A] hover:bg-[#c90825] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
          >
            <Phone size={20} />
            Llamar Ahora
          </a>
        </div>
      </div>
    </section>
  )
}