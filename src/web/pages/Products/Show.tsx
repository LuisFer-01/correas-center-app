import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Package } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

export const ProductShow = () => {
  const { slug } = useParams<{ slug: string }>()
  const { data: globals } = useGlobalData()
  
  const producto = globals?.productos.find((p) => p.slug === slug)

  if (!producto) {
    return <Navigate to="/products" replace />
  }

  return (
    <>
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20 overflow-hidden">
        {producto.imagen && (
          <div className="absolute inset-0">
            <img src={getSupabaseImageUrl(producto.imagen, 'productos-imagenes') || ''} alt={producto.nombre} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800/90 to-gray-900"></div>
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Package size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">{producto.nombre}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{producto.nombre}</h1>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">Explora todas las categorías y subcategorías disponibles de {producto.nombre.toLowerCase()}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#EA0A2A] transition-colors font-medium">
              ← Volver a todos los productos
            </Link>
          </div>
          
          {/* Marcas del producto (Nuevo) */}
          {producto.marcas && producto.marcas.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Marcas disponibles para este producto</h3>
              <div className="flex flex-wrap gap-4">
                {producto.marcas.map((marca: any) => (
                  <div key={marca.id} className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    {marca.logo ? (
                      <img src={getSupabaseImageUrl(marca.logo, 'marcas-logos') || ''} alt={marca.nombre} className="h-8 w-auto object-contain" />
                    ) : (
                      <span className="font-bold text-gray-700">{marca.nombre}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {producto.categorias?.map((categoria: any) => (
              <Link
                key={categoria.id}
                to={`/products/${producto.slug}/${categoria.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">{categoria.nombre}</h3>
                  {categoria.uso && (
                    <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-semibold px-2 py-1 rounded-full mb-2">{categoria.uso}</div>
                  )}
                  {categoria.descripcion_corta && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{categoria.descripcion_corta}</p>
                  )}
                  <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Ver detalles</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {(!producto.categorias || producto.categorias.length === 0) && (
            <div className="text-center py-16">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sin categorías disponibles</h3>
              <p className="text-gray-500">Próximamente agregaremos más categorías para este producto.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}