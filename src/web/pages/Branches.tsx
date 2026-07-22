import { useGlobalData } from '@/hooks/useGlobalData'
import { Building2, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'

export const Branches = () => {
  const { data: globals, isLoading } = useGlobalData()
  const sucursales = globals?.sucursales || []
  const whatsapp = globals?.whatsapp || {
    numero: '59177306576',
    mensaje: 'Hola, necesito información sobre sus productos y servicios'
  }

  const [expandedLocation, setExpandedLocation] = useState<number | null>(null)

  const handleWhatsAppContact = (sucursal: any) => {
    const mensaje = `Hola, necesito información sobre la sucursal *${sucursal.nombre}* ubicada en ${sucursal.direccion}. ¿Podrían brindarme más detalles?`
    const url = `https://wa.me/${whatsapp.numero}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  const toggleMap = (index: number) => {
    setExpandedLocation(expandedLocation === index ? null : index)
  }

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-10 w-96 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-5 w-72 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-20 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Building2 size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Nuestras Ubicaciones</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Sucursales
          </h1>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">
            Cobertura estratégica para atenderte mejor en todo Bolivia
          </p>
        </div>
      </section>

      {/* Grid de sucursales */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {sucursales.map((sucursal, index) => (
              <div
                key={sucursal.id}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-[#EA0A2A] transition-all duration-300"
              >
                <div className="p-6">
                  {/* Header de la sucursal */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {sucursal.nombre}
                      {sucursal.es_principal && (
                        <span className="ml-2 text-sm font-normal text-[#EA0A2A]">
                          (Principal)
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-[#EA0A2A] flex-shrink-0 mt-1" size={20} />
                      <p className="text-gray-700 text-sm">{sucursal.direccion}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-[#EA0A2A] flex-shrink-0" size={20} />
                      <a
                        href={`tel:${sucursal.telefono.replace(/\s/g, '')}`}
                        className="text-gray-700 text-sm hover:text-[#EA0A2A] transition-colors"
                      >
                        {sucursal.telefono}
                      </a>
                    </div>
                    {sucursal.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="text-[#EA0A2A] flex-shrink-0" size={20} />
                        <a
                          href={`mailto:${sucursal.email}`}
                          className="text-gray-700 text-sm hover:text-[#EA0A2A] transition-colors"
                        >
                          {sucursal.email}
                        </a>
                      </div>
                    )}
                    {sucursal.horarios && (
                      <div className="flex items-start gap-3">
                        <Clock className="text-[#EA0A2A] flex-shrink-0 mt-1" size={20} />
                        <p className="text-gray-700 text-sm">{sucursal.horarios}</p>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    {sucursal.mapa_incrustado && (
                      <button
                        onClick={() => toggleMap(index)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#EA0A2A] text-white px-4 py-3 rounded-md hover:bg-[#c90825] transition-all font-semibold text-sm"
                      >
                        {expandedLocation === index ? 'Ocultar Mapa' : 'Ver Ubicación'}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${expandedLocation === index ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => handleWhatsAppContact(sucursal)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-md hover:bg-[#128C7E] transition-all font-semibold text-sm"
                    >
                      Contactar
                      <MessageCircle size={16} />
                    </button>
                  </div>
                </div>

                {/* Mapa expandido */}
                {expandedLocation === index && sucursal.mapa_incrustado && (
                  <div className="border-t border-gray-200">
                    <div className="h-64 w-full">
                      <iframe
                        src={sucursal.mapa_incrustado}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Mapa de ${sucursal.nombre}`}
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {sucursales.length === 0 && (
            <div className="text-center py-16">
              <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin sucursales disponibles</h3>
              <p className="text-gray-500">Próximamente agregaremos más ubicaciones.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}