import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ArrowRight, Grid3X3, Layers, List, Package, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const ProductsIndex = () => {
  const { data: globals } = useGlobalData()
  const productos = globals?.productos || []
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMarca, setSelectedMarca] = useState<string>('')
  const [selectedUso, setSelectedUso] = useState<string>('')
  const [orderBy, setOrderBy] = useState<string>('orden')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => { setIsVisible(true) }, [])

  // Extraer marcas únicas de todos los productos
  const marcasUnicas = useMemo(() => {
    const marcasMap = new Map<string, { id: number, nombre: string }>()
    productos.forEach((producto: any) => {
      producto.marcas?.forEach((marca: any) => {
        if (!marcasMap.has(marca.id)) {
          marcasMap.set(marca.id, { id: marca.id, nombre: marca.nombre })
        }
      })
    })
    return Array.from(marcasMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [productos])

  // Extraer usos únicos
  const usosUnicos = useMemo(() => {
    const usos = new Set<string>()
    productos.forEach((producto: any) => {
      // Como un producto tiene múltiples categorías, revisamos sus categorías para el uso
      producto.categorias?.forEach((cat: any) => {
        if (cat.uso) usos.add(cat.uso)
      })
    })
    return Array.from(usos).sort()
  }, [productos])

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = [...productos]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      resultado = resultado.filter((p: any) =>
        p.nombre.toLowerCase().includes(term) ||
        p.categorias?.some((c: any) => c.uso?.toLowerCase().includes(term)) ||
        p.marcas?.some((m: any) => m.nombre.toLowerCase().includes(term))
      )
    }

    if (selectedMarca) {
      resultado = resultado.filter((p: any) => p.marcas?.some((m: any) => m.id === Number(selectedMarca)))
    }

    if (selectedUso) {
      resultado = resultado.filter((p: any) => p.categorias?.some((c: any) => c.uso === selectedUso))
    }

    switch (orderBy) {
      case 'nombre_asc':
        resultado.sort((a: any, b: any) => a.nombre.localeCompare(b.nombre))
        break
      case 'nombre_desc':
        resultado.sort((a: any, b: any) => b.nombre.localeCompare(a.nombre))
        break
      case 'categorias':
        resultado.sort((a: any, b: any) => (b.categorias?.length || 0) - (a.categorias?.length || 0))
        break
      case 'orden':
      default:
        resultado.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
        break
    }
    return resultado
  }, [productos, searchTerm, selectedMarca, selectedUso, orderBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMarca('')
    setSelectedUso('')
    setOrderBy('orden')
  }

  const hasActiveFilters = searchTerm || selectedMarca || selectedUso || orderBy !== 'orden'

  return (
    <>
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#EA0A2A]/20 border border-[#EA0A2A]/30 rounded-full px-4 py-2 mb-6">
            <Package size={16} className="text-[#EA0A2A]" />
            <span className="text-sm text-white font-semibold">Catálogo Completo</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Nuestros Productos</h1>
          <p className="text-lg text-gray-300 max-w-1xl mx-auto">Explora nuestro amplio catálogo de productos industriales de las mejores marcas internacionales</p>
        </div>
      </section>

      <section className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos, marcas, usos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
            )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${hasActiveFilters ? 'bg-[#EA0A2A] text-white border-[#EA0A2A]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#EA0A2A]'}`}
              >
                <SlidersHorizontal size={16} /> Filtros
                {hasActiveFilters && <span className="bg-white text-[#EA0A2A] text-xs font-bold px-1.5 py-0.5 rounded-full">{[searchTerm, selectedMarca, selectedUso].filter(Boolean).length}</span>}
              </button>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all cursor-pointer"
              >
                <option value="orden">Orden predeterminado</option>
                <option value="nombre_asc">Nombre (A-Z)</option>
                <option value="nombre_desc">Nombre (Z-A)</option>
                <option value="categorias">Más categorías</option>
              </select>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-[#EA0A2A] text-white' : 'bg-white text-gray-500 hover:text-[#EA0A2A]'}`} title="Vista cuadrícula">
                  <Grid3X3 size={16} />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 transition-all border-l border-gray-300 ${viewMode === 'list' ? 'bg-[#EA0A2A] text-white' : 'bg-white text-gray-500 hover:text-[#EA0A2A]'}`} title="Vista lista">
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-3 pt-3 border-t border-gray-100`}>
            <div className="flex flex-wrap gap-3 items-center">
              <select value={selectedMarca} onChange={(e) => setSelectedMarca(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all">
                <option value="">Todas las marcas</option>
                {marcasUnicas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nombre}</option>)}
              </select>
              <select value={selectedUso} onChange={(e) => setSelectedUso(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white focus:border-[#EA0A2A] focus:ring-2 focus:ring-[#EA0A2A]/20 transition-all">
                <option value="">Todos los usos</option>
                {usosUnicos.map((uso) => <option key={uso} value={uso}>{uso}</option>)}
              </select>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedMarca && (
                    <span className="inline-flex items-center gap-1 bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-medium px-2.5 py-1 rounded-full">
                      {marcasUnicas.find(m => m.id === Number(selectedMarca))?.nombre}
                      <button onClick={() => setSelectedMarca('')} className="hover:text-[#c90825]"><X size={12} /></button>
                    </span>
                  )}
                  {selectedUso && (
                    <span className="inline-flex items-center gap-1 bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-medium px-2.5 py-1 rounded-full">
                      {selectedUso}
                      <button onClick={() => setSelectedUso('')} className="hover:text-[#c90825]"><X size={12} /></button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-[#EA0A2A] font-medium underline">Limpiar filtros</button>
                </div>
              )}
              <div className="ml-auto text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{productosFiltrados.length}</span> de {productos.length} productos
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {productosFiltrados.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8' : 'space-y-4'}>
              {productosFiltrados.map((producto: any, index: number) => (
                viewMode === 'grid' ? (
                  <Link key={producto.id} to={`/products/${producto.slug}`} className={`group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#EA0A2A]/30 transform hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${index * 50}ms` }}>
                    <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {producto.imagen ? (
                        <img src={getSupabaseImageUrl(producto.imagen, 'productos-imagenes') || ''} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Package size={64} className="text-gray-300" /></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 right-3 bg-[#EA0A2A] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Layers size={12} /> {producto.categorias?.length || 0}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#EA0A2A] transition-colors">{producto.nombre}</h3>
                      {producto.categorias?.[0]?.uso && (
                        <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-semibold px-2 py-1 rounded-full mb-2">{producto.categorias[0].uso}</div>
                      )}
                      {producto.marcas && producto.marcas.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">Marcas disponibles</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {producto.marcas.slice(0, 8).map((marca: any) => (
                              <div key={marca.id} className="w-14 h-10 flex items-center justify-center bg-white rounded-md border border-gray-200 overflow-hidden hover:border-[#EA0A2A] hover:shadow-md transition-all" title={marca.nombre}>
                                {marca.logo ? (
                                  <img src={getSupabaseImageUrl(marca.logo, 'marcas-logos') || ''} alt={marca.nombre} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-600 text-center leading-tight px-1">{marca.nombre.substring(0, 4)}</span>
                                )}
                              </div>
                            ))}
                            {producto.marcas.length > 8 && <div className="w-14 h-10 flex items-center justify-center bg-[#EA0A2A] text-white rounded-md text-xs font-bold">+{producto.marcas.length - 8}</div>}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium">{producto.categorias?.length || 0} {producto.categorias?.length === 1 ? 'categoría' : 'categorías'}</span>
                        <ArrowRight size={18} className="text-[#EA0A2A] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ) : (
                  <Link key={producto.id} to={`/products/${producto.slug}`} className={`group flex gap-4 md:gap-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#EA0A2A]/30 p-4 md:p-6 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: `${index * 30}ms` }}>
                    <div className="relative w-32 md:w-48 h-32 md:h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {producto.imagen ? (
                        <img src={getSupabaseImageUrl(producto.imagen, 'productos-imagenes') || ''} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"><Package size={48} className="text-gray-300" /></div>
                      )}
                      <div className="absolute top-2 right-2 bg-[#EA0A2A] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Layers size={10} /> {producto.categorias?.length || 0}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#EA0A2A] transition-colors">{producto.nombre}</h3>
                        <ArrowRight size={20} className="text-[#EA0A2A] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </div>
                      {producto.categorias?.[0]?.uso && (
                        <div className="inline-block bg-[#EA0A2A]/10 text-[#EA0A2A] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">{producto.categorias[0].uso}</div>
                      )}
                      {producto.marcas && producto.marcas.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Marcas:</span>
                          {producto.marcas.slice(0, 6).map((marca: any) => (
                            <div key={marca.id} className="w-12 h-8 flex items-center justify-center bg-white rounded border border-gray-200 overflow-hidden" title={marca.nombre}>
                              {marca.logo ? (
                                <img src={getSupabaseImageUrl(marca.logo, 'marcas-logos') || ''} alt={marca.nombre} className="w-full h-full object-contain p-0.5" />
                              ) : (
                                <span className="text-[9px] font-bold text-gray-600">{marca.nombre.substring(0, 4)}</span>
                              )}
                            </div>
                          ))}
                          {producto.marcas.length > 6 && <span className="text-xs text-[#EA0A2A] font-bold">+{producto.marcas.length - 6}</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 mb-6">Intenta ajustar los filtros o el término de búsqueda</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="inline-flex items-center gap-2 bg-[#EA0A2A] hover:bg-[#c90825] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105">
                  <X size={18} /> Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}