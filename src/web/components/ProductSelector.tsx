import { useGlobalData } from '@/hooks/useGlobalData'
import { ArrowRight, Check, ChevronLeft, Filter, MessageCircle, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export const ProductSelector = () => {
  const { data: globals } = useGlobalData()
  const pasosWizard = globals?.pasos_wizard || []
  const { industrias, productos } = globals || {}

  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Configuración de WhatsApp
  const WHATSAPP_NUMBER = '59177306576'
  const MAX_PRODUCTOS = 7

  // Obtener opciones según el paso
  const getOptionsForStep = (paso: any) => {
    switch (paso.fuente_datos) {
      case 'industrias':
        return industrias || []
      case 'productos':
        return productos || []
      default:
        return []
    }
  }

  const currentPaso = pasosWizard[currentStep]
  const currentOptions = currentPaso ? getOptionsForStep(currentPaso) : []

  // Animación al cambiar de paso
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Manejar selección de industria (paso 0)
  const handleIndustriaSelect = (industria: any) => {
    setSelections({
      ...selections,
      [currentPaso.identificador]: industria,
    })
    setTimeout(() => {
      if (currentStep < pasosWizard.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 400)
  }

  // Manejar selección de productos (paso 1) - Múltiple
  const handleProductoToggle = (producto: any) => {
    const currentProductos = selections[currentPaso.identificador] || []
    const isSelected = currentProductos.some((p: any) => p.id === producto.id)

    let nuevosProductos
    if (isSelected) {
      // Remover producto
      nuevosProductos = currentProductos.filter((p: any) => p.id !== producto.id)
    } else {
      // Agregar producto (si no excede el límite)
      if (currentProductos.length >= MAX_PRODUCTOS) {
        alert(`Solo puedes seleccionar un máximo de ${MAX_PRODUCTOS} productos`)
        return
      }
      nuevosProductos = [...currentProductos, producto]
    }

    setSelections({
      ...selections,
      [currentPaso.identificador]: nuevosProductos,
    })
  }

  // Avanzar al resultado final
  const handleFinalizar = () => {
    const productosSeleccionados = selections[pasosWizard[1]?.identificador] || []
    if (productosSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para continuar')
      return
    }
    setShowResult(true)
  }

  // Volver al paso anterior
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Reiniciar wizard
  const handleReset = () => {
    setCurrentStep(0)
    setSelections({})
    setShowResult(false)
  }

  // Generar mensaje de WhatsApp
  const generarMensajeWhatsApp = () => {
    const industria = selections[pasosWizard[0]?.identificador]
    const productosSeleccionados = selections[pasosWizard[1]?.identificador] || []

    const nombresProductos = productosSeleccionados.map((p: any) => `• ${p.nombre}`).join('\n')

    const mensaje = `Hola, soy de la industria *${industria?.nombre || 'No especificada'}* y me interesa obtener información sobre los siguientes productos:\n\n${nombresProductos}\n\nQuedo atento a su respuesta. Gracias.`

    return encodeURIComponent(mensaje)
  }

  // Redirigir a WhatsApp
  const handleConsultarWhatsApp = () => {
    const mensaje = generarMensajeWhatsApp()
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`
    window.open(url, '_blank')
  }

  // Verificar si hay pasos configurados
  if (pasosWizard.length < 2) {
    return null
  }

  // Vista de resultado final
  if (showResult) {
    const industria = selections[pasosWizard[0]?.identificador]
    const productosSeleccionados = selections[pasosWizard[1]?.identificador] || []

    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Check size={40} className="text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">
                ¡Perfecto!
              </h3>
              <p className="text-white/90 text-lg">
                Hemos recopilado tu información. Ahora contáctanos para recibir asesoría personalizada.
              </p>
            </div>

            {/* Resumen de selecciones */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8">
              <h4 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles size={20} />
                Resumen de tu selección
              </h4>
              
              <div className="space-y-4">
                {/* Industria */}
                <div className="flex items-start gap-3 pb-4 border-b border-white/20">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Filter size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1">Industria</p>
                    <p className="font-semibold text-lg">{industria?.nombre || 'No especificada'}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Check size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-2">
                      Productos seleccionados ({productosSeleccionados.length})
                    </p>
                    <div className="space-y-2">
                      {productosSeleccionados.map((producto: any) => (
                        <div 
                          key={producto.id} 
                          className="bg-white/20 rounded-lg px-3 py-2 text-sm"
                        >
                          {producto.nombre}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConsultarWhatsApp}
                className="flex-1 bg-white text-[#EA0A2A] px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 hover:scale-105 shadow-lg"
              >
                <MessageCircle size={20} />
                Consultar información
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Buscar Otro Producto
              </button>
            </div>

            {/* Nota */}
            <p className="text-center text-white/70 text-sm mt-6">
              Serás redirigido a WhatsApp para enviar tu consulta
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Vista del wizard (pasos 0 y 1)
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-[#EA0A2A] font-semibold">
              Herramienta Interactiva
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Encuentra el Producto Perfecto
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Responde {pasosWizard.length} preguntas simples y te recomendaremos la mejor solución
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-3">
            {pasosWizard.map((paso: any, index: number) => (
              <div key={paso.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-[#EA0A2A] text-white scale-100'
                        : index === currentStep
                        ? 'bg-[#EA0A2A] text-white scale-110 ring-4 ring-[#EA0A2A]/20'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? <Check size={20} /> : index + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    index <= currentStep ? 'text-[#EA0A2A]' : 'text-gray-400'
                  }`}>
                    {paso.identificador.charAt(0).toUpperCase() + paso.identificador.slice(1)}
                  </span>
                </div>
                {index < pasosWizard.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentStep ? 'bg-[#EA0A2A]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="max-w-5xl mx-auto">
          {currentPaso && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
              {/* Título del paso */}
              <div className={`text-center mb-8 transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {currentPaso.titulo}
                </h3>
                <p className="text-gray-600">
                  {currentPaso.descripcion}
                </p>
              </div>

              {/* Opciones */}
              <div className={`transition-all duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}>
                {/* PASO 0: Selección de Industria (única) */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentOptions.map((industria: any) => {
                      const isSelected = selections[currentPaso.identificador]?.id === industria.id
                      return (
                        <button
                          key={industria.id}
                          onClick={() => handleIndustriaSelect(industria)}
                          className={`group p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                            isSelected
                              ? 'border-[#EA0A2A] bg-[#EA0A2A]/5 scale-105'
                              : 'border-gray-200 hover:border-[#EA0A2A]/50 hover:scale-102'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'border-[#EA0A2A] bg-[#EA0A2A]'
                                  : 'border-gray-300 group-hover:border-[#EA0A2A]'
                              }`}
                            >
                              {isSelected && <Check size={14} className="text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#EA0A2A] transition-colors">
                                {industria.nombre}
                              </h4>
                              {industria.descripcion && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {industria.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* PASO 1: Selección de Productos (múltiple) */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    {/* Contador de selección */}
                    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Productos seleccionados: 
                        <span className={`font-bold ml-2 ${(selections[currentPaso.identificador] || []).length >= MAX_PRODUCTOS ? 'text-red-600' : 'text-[#EA0A2A]'}`}>
                          {(selections[currentPaso.identificador] || []).length} / {MAX_PRODUCTOS}
                        </span>
                      </span>
                      {(selections[currentPaso.identificador] || []).length > 0 && (
                        <button
                          onClick={() => setSelections({
                            ...selections,
                            [currentPaso.identificador]: []
                          })}
                          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                        >
                          Limpiar selección
                        </button>
                      )}
                    </div>

                    {/* Grid de productos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentOptions.map((producto: any) => {
                        const isSelected = (selections[currentPaso.identificador] || []).some((p: any) => p.id === producto.id)
                        return (
                          <button
                            key={producto.id}
                            onClick={() => handleProductoToggle(producto)}
                            className={`group p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                              isSelected
                                ? 'border-[#EA0A2A] bg-[#EA0A2A]/5 scale-102'
                                : 'border-gray-200 hover:border-[#EA0A2A]/50'
                            } ${(selections[currentPaso.identificador] || []).length >= MAX_PRODUCTOS && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={(selections[currentPaso.identificador] || []).length >= MAX_PRODUCTOS && !isSelected}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected
                                    ? 'border-[#EA0A2A] bg-[#EA0A2A]'
                                    : 'border-gray-300 group-hover:border-[#EA0A2A]'
                                }`}
                              >
                                {isSelected && <Check size={14} className="text-white" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#EA0A2A] transition-colors">
                                  {producto.nombre}
                                </h4>
                                {producto.descripcion_corta && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {producto.descripcion_corta}
                                  </p>
                                )}
                                {producto.uso && (
                                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {producto.uso}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Estado vacío */}
                    {currentOptions.length === 0 && (
                      <div className="text-center py-12">
                        <Filter size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No hay productos disponibles en este momento.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Controles de navegación */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </button>
                
                {/* Botón Siguiente (solo en paso 1) */}
                {currentStep === 1 && (
                  <button
                    onClick={handleFinalizar}
                    disabled={(selections[currentPaso.identificador] || []).length === 0}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold bg-[#EA0A2A] text-white hover:bg-[#c90825] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    Siguiente
                    <ArrowRight size={20} />
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-500 hover:text-[#EA0A2A] transition-all hover:bg-[#EA0A2A]/5"
                >
                  <RotateCcw size={18} />
                  Reiniciar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}