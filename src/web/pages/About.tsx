import { useGlobalData } from '@/hooks/useGlobalData'
import { Award, Calendar, CheckCircle2, Clock, Crown, Eye, Heart, MapPin, Package, Target, Users, Zap } from 'lucide-react'
import { useState } from 'react'

export const About = () => {
  const { data: globals } = useGlobalData()
  const registros = globals?.registros_about || []
  const empresa = globals?.empresa

  const [activeTab, setActiveTab] = useState<'estadisticas' | 'filosofia' | 'timeline' | 'porque'>('estadisticas')

  // Mapeo de iconos de Lucide
  const lucideIconMap: Record<string, any> = {
    'Clock': Clock,
    'Users': Users,
    'Award': Award,
    'CheckCircle2': CheckCircle2,
    'Eye': Eye,
    'Target': Target,
    'Heart': Heart,
    'Calendar': Calendar,
    'MapPin': MapPin,
    'Package': Package,
    'Zap': Zap,
    'Crown': Crown,
  }

  // Helper para obtener registro por identificador
  const getRegistro = (identificador: string) => {
    return registros.find((r) => r.identificador === identificador)
  }

  // Obtener secciones
  const header = getRegistro('header')
  const introduccion = getRegistro('introduccion')
  const estadisticas = getRegistro('estadisticas')
  const filosofia = getRegistro('filosofia')
  const porqueElegirnos = getRegistro('porque_elegirnos')
  const timeline = getRegistro('timeline')

  const getIcon = (icono: string) => {
    return lucideIconMap[icono] || Award
  }

  // Definición de tabs
  const tabs = [
    {
      id: 'estadisticas' as const,
      label: 'Estadísticas',
      icon: Award,
      description: 'Cifras que respaldan nuestra trayectoria',
      hasContent: estadisticas && estadisticas.detalles && estadisticas.detalles.length > 0,
    },
    {
      id: 'filosofia' as const,
      label: 'Filosofía',
      icon: Eye,
      description: 'Visión, Misión y Valores',
      hasContent: filosofia && filosofia.detalles && filosofia.detalles.length > 0,
    },
    {
      id: 'timeline' as const,
      label: 'Historia',
      icon: Calendar,
      description: 'Nuestro recorrido',
      hasContent: timeline && timeline.detalles && timeline.detalles.length > 0,
    },
    {
      id: 'porque' as const,
      label: '¿Por qué elegirnos?',
      icon: CheckCircle2,
      description: 'Nuestras fortalezas',
      hasContent: porqueElegirnos && porqueElegirnos.detalles && porqueElegirnos.detalles.length > 0,
    },
  ].filter(tab => tab.hasContent)

  return (
    <>
      {/* Header de página */}
      <section className="relative bg-gradient-to-br from-[#030213] via-[#1a1a2e] to-[#030213] py-20 md:py-28 overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EA0A2A] rounded-full filter blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EA0A2A] rounded-full filter blur-[120px]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-5 py-2.5 mb-6 backdrop-blur-sm">
            <Award size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">
              {header?.nombre || 'Sobre Nosotros'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {empresa?.nombre || 'Correas Center'}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-1xl mx-28 leading-relaxed">
            {header?.descripcion || 'Líderes en soluciones industriales, hidráulicas, neumáticas y transmisión de potencia en Bolivia'}
          </p>
        </div>
      </section>

      {/* Introducción */}
      {introduccion && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-[#030213] mb-6">
                {introduccion.nombre}
              </h2>
              <div
                className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: introduccion.descripcion || '' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Tabs de contenido */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs Navigation */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-2.5 px-5 md:px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-[#EA0A2A] text-white shadow-lg shadow-[#EA0A2A]/30 scale-105'
                        : 'bg-white text-gray-600 hover:bg-[#EA0A2A]/10 hover:text-[#EA0A2A] border border-gray-200 hover:border-[#EA0A2A]/30'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#EA0A2A]'} />
                    <span className="text-sm md:text-base">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contenido de Tabs */}
          <div className="min-h-[400px]">
            {/* TAB: Estadísticas */}
            {activeTab === 'estadisticas' && estadisticas && (
              <div className="animate-fadeIn">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#030213] mb-3">
                    {estadisticas.nombre}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {estadisticas.descripcion}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {estadisticas.detalles.map((detalle: any, index: number) => {
                    const IconComponent = getIcon(detalle.icono)
                    return (
                      <div
                        key={detalle.id}
                        className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="bg-gradient-to-br from-[#EA0A2A]/10 to-[#EA0A2A]/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent size={36} className="text-[#EA0A2A]" />
                        </div>
                        <h4 className="text-3xl font-bold text-[#030213] mb-3 text-center">
                          {detalle.titulo}
                        </h4>
                        <p className="text-gray-600 text-center font-medium">
                          {detalle.subtitulo}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: Filosofía */}
            {activeTab === 'filosofia' && filosofia && (
              <div className="animate-fadeIn">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#030213] mb-3">
                    {filosofia.nombre}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {filosofia.descripcion}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {filosofia.detalles.map((detalle: any, index: number) => {
                    const Icon = getIcon(detalle.icono)
                    return (
                      <div
                        key={detalle.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] p-10 flex items-center justify-center">
                          <Icon size={64} className="text-white group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="p-8">
                          <h4 className="text-2xl font-bold text-[#030213] mb-4">
                            {detalle.titulo}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {detalle.descripcion}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: Timeline */}
            {activeTab === 'timeline' && timeline && (
              <div className="animate-fadeIn">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#030213] mb-3">
                    {timeline.nombre}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {timeline.descripcion}
                  </p>
                </div>
                <div className="relative">
                  {/* Línea vertical central */}
                  <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#EA0A2A] to-[#EA0A2A]/20 rounded-full"></div>
                  <div className="space-y-8 md:space-y-12">
                    {timeline.detalles.map((detalle: any, index: number) => {
                      const Icon = getIcon(detalle.icono)
                      const isEven = index % 2 === 0
                      return (
                        <div key={detalle.id} className="relative">
                          {/* Punto en la línea central */}
                          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#EA0A2A] rounded-full border-4 border-white shadow-lg z-10"></div>
                          <div className={`md:flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            <div className={`md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#EA0A2A]/30">
                                <div className={`flex items-center gap-4 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                                  <div className="bg-gradient-to-br from-[#EA0A2A]/10 to-[#EA0A2A]/5 p-3 rounded-xl">
                                    <Icon size={28} className="text-[#EA0A2A]" />
                                  </div>
                                  <div>
                                    <h4 className="text-3xl font-bold text-[#EA0A2A]">
                                      {detalle.titulo}
                                    </h4>
                                    <p className="text-sm font-semibold text-gray-700">
                                      {detalle.subtitulo}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                  {detalle.descripcion}
                                </p>
                              </div>
                            </div>
                            <div className="hidden md:block md:w-1/2"></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Por Qué Elegirnos */}
            {activeTab === 'porque' && porqueElegirnos && (
              <div className="animate-fadeIn">
                <div className="text-center mb-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#030213] mb-3">
                    {porqueElegirnos.nombre}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {porqueElegirnos.descripcion}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {porqueElegirnos.detalles.map((detalle: any, index: number) => {
                    const Icon = getIcon(detalle.icono)
                    return (
                      <div
                        key={detalle.id}
                        className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#EA0A2A]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-[#EA0A2A]/10 to-[#EA0A2A]/5 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Icon size={24} className="text-[#EA0A2A]" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[#030213] mb-2">
                              {detalle.titulo}
                            </h4>
                            <p className="text-gray-600 leading-relaxed text-sm">
                              {detalle.descripcion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}