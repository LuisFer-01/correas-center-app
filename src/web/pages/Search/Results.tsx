import { useSearch } from '@/hooks/useSearch'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Layers, Package, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export const Results = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const { data, isLoading } = useSearch(query)

  const productos = data?.productos || []
  const categorias = data?.categorias || []
  const total = data?.total || 0

  return (
    <>
      {/* Header de página */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Search size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Resultados de Búsqueda</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Resultados para "{query}"
          </h1>
          <p className="text-lg text-white">
            {total > 0 ? (
              <>
                Se encontraron{' '}
                <span className="font-bold text-[#EA0A2A]">{total}</span> resultados
              </>
            ) : (
              'No se encontraron resultados'
            )}
          </p>
        </div>
      </section>

      {/* Estado de carga */}
      {isLoading && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Productos encontrados */}
      {!isLoading && productos.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#EA0A2A]/10 p-3 rounded-lg">
                <Package size={28} className="text-[#EA0A2A]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Productos</h2>
                <p className="text-gray-600 text-sm">
                  {productos.length} {productos.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <Link
                  key={producto.id}
                  to={`/products/${producto.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {producto.imagen ? (
                      <img
                        src={getSupabaseImageUrl(producto.imagen, 'productos-imagenes') || ''}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package size={64} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">
                      {producto.nombre}
                    </h3>
                    <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Ver detalles</span>
                      <ArrowRight
                        size={16}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías encontradas */}
      {!isLoading && categorias.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-[#EA0A2A]/10 p-3 rounded-lg">
                <Layers size={28} className="text-[#EA0A2A]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Categorías</h2>
                <p className="text-gray-600 text-sm">
                  {categorias.length} {categorias.length === 1 ? 'categoría encontrada' : 'categorías encontradas'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categorias.map((categoria) => (
                <Link
                  key={categoria.id}
                  to={`/products/${categoria.producto?.slug}/${categoria.slug}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1 p-6"
                >
                  {categoria.producto && (
                    <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-semibold px-2 py-1 rounded-full mb-3">
                      {categoria.producto.nombre}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">
                    {categoria.nombre}
                  </h3>
                  {categoria.descripcion_corta && (
                    <p className="text-sm text-gray-600 mb-4">{categoria.descripcion_corta}</p>
                  )}
                  <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Ver detalles</span>
                    <ArrowRight
                      size={16}
                      className="ml-1 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sin resultados */}
      {!isLoading && total === 0 && query && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Search size={64} className="text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              No encontramos resultados para "{query}"
            </h2>
            <p className="text-gray-600 mb-8">
              Intenta con otros términos o explora nuestro catálogo completo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-[#EA0A2A] hover:bg-[#c90825] text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Ver Todos los Productos
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Contactar Ahora
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}