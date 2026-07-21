import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Products = () => {
  const { data: globals } = useGlobalData()
  const productos = globals?.productos || []

  // Mostramos solo los primeros 8 productos en el landing
  const productosDestacados = productos.slice(0, 8)

  if (productosDestacados.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[#EA0A2A] font-semibold text-sm uppercase tracking-wider mb-2">
            Nuestros Productos
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Soluciones Completas para tu Industria
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Amplio catálogo de productos industriales de las mejores marcas internacionales
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {productosDestacados.map((producto: any) => {
            // Obtener la primera categoría para mostrar su descripción corta o uso
            const primeraCategoria = producto.categorias?.[0]
            
            return (
              <Link
                key={producto.id}
                to={`/products/${producto.slug}`}
                className="group bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 hover:border-[#EA0A2A]/50 transform hover:-translate-y-1"
              >
                {/* Imagen del producto - ✅ FONDO BLANCO */}
                <div className="relative h-48 bg-white overflow-hidden">
                  {producto.imagen ? (
                    <img
                      src={getSupabaseImageUrl(producto.imagen, 'productos-imagenes') || ''}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Package size={48} className="text-gray-400" />
                      </div>
                    </div>
                  )}
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge de cantidad de categorías */}
                  {producto.categorias && producto.categorias.length > 0 && (
                    <div className="absolute top-3 right-3 bg-[#EA0A2A] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      {producto.categorias.length} {producto.categorias.length === 1 ? 'Cat.' : 'Cats.'}
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#EA0A2A] transition-colors">
                    {producto.nombre}
                  </h3>
                  
                  {/* ✅ DESCRIPCIÓN CORTA CON FALLBACK */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {primeraCategoria?.descripcion_corta || 'Productos de alta calidad para tu industria'}
                  </p>

                  {/* Link de acción */}
                  <div className="flex items-center text-[#EA0A2A] font-semibold text-sm group-hover:gap-2 transition-all mt-2">
                    <span>Ver subcategorías</span>
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Botón ver todos */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#EA0A2A] hover:bg-[#c90825] text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 group shadow-lg shadow-[#EA0A2A]/20"
          >
            Ver Todos los Productos
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}