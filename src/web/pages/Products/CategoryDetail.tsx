import { getSupabaseImageUrl, supabase } from '@/lib/supabase'
import { AlertTriangle, ArrowRight, CheckCircle2, FlaskConical, Layers, Ruler, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
// Mantén tu importación de TechnicalSheetDownload si ya lo tienes creado
// import TechnicalSheetDownload from '@/components/TechnicalSheet'

export const CategoryDetail = () => {
  const { productSlug, categorySlug } = useParams<{ productSlug: string, categorySlug: string }>()
  const [categoria, setCategoria] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('todos')

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('categorias')
        .select(`
          id, 
          nombre, 
          slug, 
          imagen, 
          descripcion, 
          descripcion_corta, 
          uso,
          categoria_atributo(
            valor_personalizado,
            atributo:atributos_tecnico(
              id, 
              nombre, 
              descripcion, 
              valor_numerico, 
              unidad_medida,
              tipo_atributo:tipo_atributo(id, nombre, slug, icono)
            )
          )
        `)
        .eq('slug', categorySlug)
        .single()

      if (!error && data) {
        setCategoria(data)
      }
      setLoading(false)
    }

    if (categorySlug) fetchCategory()
  }, [categorySlug])

  if (loading) {
    return (
      <>
        <div className="py-20 text-center text-gray-500">Cargando detalles de la categoría...</div>
      </>
    )
  }

  if (!categoria) {
    return <Navigate to={`/products/${productSlug}`} replace />
  }

  // Agrupar atributos por tipo de atributo (ej: "Características", "Composición", "Medidas")
  const atributosAgrupados: Record<string, any[]> = {}
  categoria.categoria_atributo?.forEach((ca: any) => {
    const tipoNombre = ca.atributo?.tipo_atributo?.nombre || 'General'
    if (!atributosAgrupados[tipoNombre]) {
      atributosAgrupados[tipoNombre] = []
    }
    
    // Formatear el valor a mostrar
    let valorMostrar = ca.valor_personalizado?.toString()
    if (!valorMostrar && ca.atributo?.valor_numerico) {
      valorMostrar = `${ca.atributo.valor_numerico} ${ca.atributo.unidad_medida || ''}`.trim()
    }

    atributosAgrupados[tipoNombre].push({
      id: ca.atributo?.id,
      nombre: ca.atributo?.nombre,
      descripcion: ca.atributo?.descripcion,
      valor: valorMostrar,
      icono: ca.atributo?.tipo_atributo?.icono
    })
  })

  // Generar tabs dinámicos basados en los tipos de atributos encontrados
  const tabs = Object.keys(atributosAgrupados).map((key, index) => ({
    id: key.toLowerCase().replace(/\s+/g, '-'),
    label: key,
    icon: index === 0 ? Wrench : (key.toLowerCase().includes('compos') ? FlaskConical : (key.toLowerCase().includes('medid') ? Ruler : Layers)),
    count: atributosAgrupados[key].length
  }))

  if (tabs.length === 0) {
    tabs.push({ id: 'general', label: 'Información General', icon: Layers, count: 0 })
  }

  return (
    <>
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20 overflow-hidden">
        {categoria.imagen && (
          <div className="absolute inset-0">
            <img src={getSupabaseImageUrl(categoria.imagen, 'categorias-imagenes') || ''} alt={categoria.nombre} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800/90 to-gray-900"></div>
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
            <Link to="/products" className="hover:text-white transition-colors">Productos</Link>
            <span>/</span>
            <Link to={`/products/${productSlug}`} className="hover:text-white transition-colors capitalize">{productSlug?.replace(/-/g, ' ')}</Link>
            <span>/</span>
            <span className="text-white">{categoria.nombre}</span>
          </div> */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{categoria.nombre}</h1>
          {categoria.descripcion_corta && <p className="text-lg text-gray-300 max-w-3xl">{categoria.descripcion_corta}</p>}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to={`/products/${productSlug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EA0A2A] transition-colors font-medium">
              ← Volver a {productSlug?.replace(/-/g, ' ')}
            </Link>
          </div>

          {categoria.descripcion && (
            <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción General</h2>
              <p className="text-gray-700 leading-relaxed">{categoria.descripcion}</p>
            </div>
          )}

          {tabs.length > 0 && (
            <div className="border-b border-gray-200 mb-8">
              <div className="flex flex-wrap gap-0 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-[#EA0A2A] text-[#EA0A2A]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#EA0A2A]/10 text-[#EA0A2A]' : 'bg-gray-100 text-gray-500'}`}>
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {tabs.map((tab) => (
                activeTab === tab.id && (
                  <div key={tab.id} className="space-y-4">
                    {atributosAgrupados[tab.label]?.length > 0 ? (
                      atributosAgrupados[tab.label].map((attr: any) => (
                        <div key={attr.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-[#EA0A2A]/20 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="bg-[#EA0A2A]/10 p-2 rounded-lg flex-shrink-0">
                              <CheckCircle2 size={20} className="text-[#EA0A2A]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-bold text-gray-900">{attr.nombre}</h3>
                                {attr.valor && (
                                  <span className="text-sm font-semibold text-[#EA0A2A] bg-[#EA0A2A]/10 px-3 py-1 rounded-full">
                                    {attr.valor}
                                  </span>
                                )}
                              </div>
                              {attr.descripcion && <p className="text-sm text-gray-600">{attr.descripcion}</p>}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No hay información registrada en esta sección.</p>
                    )}
                  </div>
                )
              ))}

              <div className="mt-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-red-800 mb-1">Información Importante</h4>
                    <p className="text-sm text-red-700 leading-relaxed">
                      Los datos mostrados arriba son <strong>características generales</strong> de esta categoría.
                      Pueden existir variaciones en las especificaciones técnicas según la marca del producto.
                      Para obtener información detallada por marca, por favor contáctanos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#EA0A2A] to-[#c90825] rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">¿Necesitas cotización?</h3>
                <p className="text-white/90 text-sm mb-4">Solicita información detallada sobre {categoria.nombre}</p>
                <a
                  href={`https://wa.me/59177306576?text=${encodeURIComponent(`Hola, necesito información sobre la categoría: ${categoria.nombre}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-white text-[#EA0A2A] px-4 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors"
                >
                  Solicitar por WhatsApp
                </a>
              </div>
              
              {/* Aquí va tu componente TechnicalSheetDownload si lo tienes */}
              {/* <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Descargar Información</h3>
                <TechnicalSheetDownload producto={{ nombre: productSlug }} categoria={categoria} />
              </div> */}

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Otros Productos</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/products" className="text-sm text-gray-600 hover:text-[#EA0A2A] transition-colors flex items-center gap-2">
                      <ArrowRight size={14} /> Ver todos los productos
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}