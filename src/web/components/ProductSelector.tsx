import { useGlobalData } from '@/hooks/useGlobalData'
import { ArrowRight, Check, ChevronLeft, Filter, RotateCcw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const ProductSelector = () => {
  const { data: globals } = useGlobalData()
  const pasosWizard = globals?.pasos_wizard || []
  const { industrias, productos } = globals || {}
  
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [isAnimating, setIsAnimating] = useState(false)

  // Generar opciones dinámicamente según el paso
  const getOptionsForStep = (paso: any) => {
    switch (paso.fuente_datos) {
      case 'industrias':
        return industrias || []
      case 'productos':
        return productos || []
      case 'categorias':
        // Filtrar categorías por el producto seleccionado
        if (paso.campo_filtro === 'producto_id' && selections.producto) {
          return selections.producto.categorias || []
        }
        return []
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

  const handleSelect = (option: any) => {
    if (!currentPaso) return
    
    setSelections({
      ...selections,
      [currentPaso.identificador]: option,
    })

    setTimeout(() => {
      if (currentStep < pasosWizard.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 400)
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const newSelections = { ...selections }
      delete newSelections[currentPaso.identificador]
      setSelections(newSelections)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setSelections({})
  }

  const isComplete = pasosWizard.every((paso: any) => selections[paso.identificador])

  if (pasosWizard.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-[#EA0A2A] font-semibold">Herramienta Interactiva</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Encuentra el Producto Perfecto
          </h2>
          <p className="text-lg text-gray-600 max-w-1xl mx-auto">
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
          {!isComplete && currentPaso ? (
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}>
                {currentOptions.map((option: any) => {
                  const isSelected = selections[currentPaso.identificador]?.id === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option)}
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
                            {option.nombre}
                          </h4>
                          {option.descripcion_corta && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {option.descripcion_corta}
                            </p>
                          )}
                          {option.uso && (
                            <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {option.uso}
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
                    No hay opciones disponibles para este paso.
                  </p>
                </div>
              )}

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
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-500 hover:text-[#EA0A2A] transition-all hover:bg-[#EA0A2A]/5"
                >
                  <RotateCcw size={18} />
                  Reiniciar
                </button>
              </div>
            </div>
          ) : (
            /* Resultado Final */
            <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] rounded-2xl shadow-2xl p-8 md:p-12 text-white">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Check size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  ¡Producto Recomendado!
                </h3>
                <p className="text-white/90">
                  Basado en tus selecciones, te recomendamos:
                </p>
              </div>

              {/* Resumen de selecciones */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                <div className="space-y-3">
                  {pasosWizard.map((paso: any) => (
                    <div key={paso.id} className="flex items-center gap-3">
                      <span className="text-white/70 text-sm capitalize min-w-[100px]">
                        {paso.identificador}:
                      </span>
                      <span className="font-semibold bg-white/20 px-3 py-1 rounded-full">
                        {selections[paso.identificador]?.nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              {selections.producto && selections.categoria && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to={`/products/${selections.producto.slug}/${selections.categoria.slug}`}
                    className="bg-white text-[#EA0A2A] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    Ver Detalles del Producto
                    <ArrowRight size={20} />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-all border border-white/20 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Buscar Otro Producto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}