import { useGlobalData } from '@/hooks/useGlobalData'
import { getSupabaseImageUrl } from '@/lib/supabase'
import { ChevronDown, Menu, Phone, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export const Navigation = () => {
  const { data: globals, isLoading } = useGlobalData()
  const location = useLocation()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [mobileActiveCategory, setMobileActiveCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const menusProductos = globals?.menus?.Producto || []
  const menusAplicaciones = globals?.menus?.Aplicacion || []
  const menusServicios = globals?.menus?.Servicio || []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const getLogoUrl = () => {
    if (!globals?.empresa?.logo) return null
    return getSupabaseImageUrl(globals.empresa.logo, 'logos-empresas')
  }

  const logoUrl = getLogoUrl()

  const getSubmenusForMenu = (menu: any) => {
    if (!menu.detalle_menus || menu.detalle_menus.length === 0) {
      return []
    }
    return menu.detalle_menus.map((detalle: any) => ({
      id: detalle.id,
      ruta: detalle.ruta,
      orden: detalle.orden,
    }))
  }

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-[#b1001b] z-50 shadow-lg h-16 sm:h-18 md:h-20">
        <div className="animate-pulse flex items-center justify-center h-full">
          <div className="h-8 w-32 bg-white/20 rounded"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#b1001b] z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          {/* LOGO */}
          <Link to="/" className="flex items-center cursor-pointer group flex-shrink-0">
            <div className="relative h-10 w-auto sm:h-12 md:h-14 flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={globals?.empresa?.nombre || 'Correas Center Logo'}
                  className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-[#b1001b] font-bold text-xl">
                  CC
                </div>
              )}
            </div>
            <div className="text-white ml-2 sm:ml-3">
              <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold tracking-tight group-hover:text-gray-200 transition-colors leading-tight">
                {globals?.empresa?.nombre || 'CORREAS CENTER'}
              </h1>
              <p className="text-[10px] sm:text-xs text-red-100 leading-tight">Solución Confiable</p>
            </div>
          </Link>

          {/* MENÚ DESKTOP */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* BUSCADOR */}
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Buscar productos..."
                  className="w-48 xl:w-64 px-3 xl:px-4 py-2 rounded-l-md border-0 bg-[#C0939A] focus:bg-[#D9B0B6] focus:outline-none focus:ring-2 focus:ring-white text-gray-900 placeholder:text-gray-700 transition-colors duration-200 text-sm xl:text-base"
                />
                <button type="submit" className="bg-white text-[#ea0a2cf8] px-3 xl:px-4 py-2 rounded-r-md hover:bg-gray-100 transition-colors">
                  <Search size={24} />
                </button>
              </form>
              {showSuggestions && (
                <div className="absolute top-full left-0 w-64 xl:w-80 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {searchQuery.length === 0 ? (
                    <>
                      <p className="px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Productos populares</p>
                      {globals?.productos_populares && globals.productos_populares.length > 0 ? (
                        globals.productos_populares.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.nombre)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#EA0A2A] transition-colors"
                          >
                            {product.nombre}
                          </button>
                        ))
                      ) : (
                        <p className="px-4 py-2 text-sm text-gray-500">No hay productos populares</p>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Buscando: <span className="font-semibold text-[#EA0A2A]">"{searchQuery}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PRODUCTOS - MEGA MENÚ */}
            <div className="relative" onMouseEnter={() => setShowProducts(true)} onMouseLeave={() => { setShowProducts(false); setActiveCategory(null) }}>
              <button className="flex items-center gap-1 text-white hover:text-gray-200 transition-colors py-2 font-medium">
                Productos
                <ChevronDown size={18} className={`transition-transform duration-200 ${showProducts ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-0 w-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 p-6 -translate-x-1/4 transition-all duration-300 max-h-[85vh] overflow-y-auto ${showProducts ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}>
                <div className="grid grid-cols-2 gap-4">
                  {menusProductos.map((menu, index) => {
                    const producto = globals?.productos.find((p) => p.id === menu.campo_id)
                    if (!producto) return null
                    const submenus = getSubmenusForMenu(menu)
                    
                    return (
                      <div key={menu.id} className="relative">
                        <div
                          className="flex items-center justify-between cursor-pointer group pb-2 border-b-2 border-[#EA0A2A]"
                          onClick={() => setActiveCategory(activeCategory === index ? null : index)}
                        >
                          <Link to={menu.ruta} className="flex items-center gap-2 font-bold text-[#EA0A2A] text-sm uppercase tracking-wide hover:underline">
                            {menu.icon && <span className="text-[#EA0A2A]">{menu.icon}</span>}
                            {producto.nombre}
                          </Link>
                          {submenus.length > 0 && (
                            <ChevronDown size={16} className={`text-[#EA0A2A] transition-transform duration-300 ${activeCategory === index ? 'rotate-180' : ''}`} />
                          )}
                        </div>
                        {submenus.length > 0 && (
                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeCategory === index ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                              <ul className="space-y-1">
                                {submenus.map((submenu) => (
                                  <li key={submenu.id}>
                                    <Link
                                      to={submenu.ruta}
                                      className="flex items-center gap-2 text-gray-700 hover:text-[#EA0A2A] text-sm block py-1.5 px-3 rounded hover:bg-white transition-all"
                                    >
                                      {menu.icon && <span className="text-[#EA0A2A]/60">{menu.icon}</span>}
                                      {submenu.ruta.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* APLICACIONES */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white hover:text-gray-200 transition-colors py-2 font-medium">
                Aplicaciones
                <ChevronDown size={18} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 w-64 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {menusAplicaciones.map((menu) => {
                  const industria = globals?.industrias.find((i) => i.id === menu.campo_id)
                  if (!industria) return null
                  return (
                    <Link
                      key={menu.id}
                      to={menu.ruta}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#EA0A2A] transition-colors"
                    >
                      {menu.icon && <span className="text-[#EA0A2A]">{menu.icon}</span>}
                      <span>{industria.nombre}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* SERVICIOS */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white hover:text-gray-200 transition-colors py-2 font-medium">
                Servicios
                <ChevronDown size={18} className="transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 w-72 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {menusServicios.map((menu) => {
                  const servicio = globals?.servicios.find((s) => s.id === menu.campo_id)
                  if (!servicio) return null
                  return (
                    <Link
                      key={menu.id}
                      to={menu.ruta}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#EA0A2A] transition-colors"
                    >
                      {menu.icon && <span className="text-[#EA0A2A]">{menu.icon}</span>}
                      <span>{servicio.nombre}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <Link to="/about" className="text-white hover:text-gray-200 transition-colors font-medium">Acerca de</Link>
            <Link to="/contact" className="text-white hover:text-gray-200 transition-colors font-medium">Contacto</Link>
          </div>

          {/* BOTÓN HAMBURGUESA */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed top-16 sm:top-18 right-0 bottom-0 w-[85%] max-w-sm bg-[#b1001b] shadow-2xl lg:hidden z-50 overflow-y-auto animate-slide-in">
            <div className="px-4 py-4 space-y-4">
              {/* Buscador móvil */}
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 px-4 py-3 rounded-l-md border-0 bg-[#C0939A] focus:bg-[#D9B0B6] focus:outline-none text-gray-900 placeholder:text-gray-700 text-sm"
                />
                <button type="submit" className="bg-white text-[#EA0A2A] px-4 py-3 rounded-r-md">
                  <Search size={20} />
                </button>
              </form>
              
              <div className="border-t border-white/20"></div>
              
              {/* Productos acordeón */}
              <div className="space-y-1">
                <p className="text-white font-bold text-xs uppercase tracking-wider px-2 py-2">Productos</p>
                {menusProductos.map((menu, index) => {
                  const producto = globals?.productos.find((p) => p.id === menu.campo_id)
                  if (!producto) return null
                  const submenus = getSubmenusForMenu(menu)
                  
                  return (
                    <div key={menu.id} className="rounded-md overflow-hidden">
                      <button
                        onClick={() => setMobileActiveCategory(mobileActiveCategory === index ? null : index)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          {menu.icon && <span>{menu.icon}</span>}
                          {producto.nombre}
                        </span>
                        {submenus.length > 0 && (
                          <ChevronDown size={16} className={`text-white/80 transition-transform duration-300 ${mobileActiveCategory === index ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      {submenus.length > 0 && (
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileActiveCategory === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-black/20 pl-4 py-2 space-y-1">
                            <Link
                              to={menu.ruta}
                              className="block text-white/90 hover:text-white hover:bg-white/10 py-2 px-3 text-sm rounded transition-all font-semibold"
                            >
                              Ver todo →
                            </Link>
                            {submenus.map((submenu) => (
                              <Link
                                key={submenu.id}
                                to={submenu.ruta}
                                className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 py-2 px-3 text-sm rounded transition-all"
                              >
                                {menu.icon && <span className="text-white/60">{menu.icon}</span>}
                                <span>• {submenu.ruta.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="border-t border-white/20"></div>
              
              {/* Aplicaciones */}
              <div className="space-y-1">
                <p className="text-white font-bold text-xs uppercase tracking-wider px-2 py-2">Aplicaciones</p>
                {menusAplicaciones.map((menu) => {
                  const industria = globals?.industrias.find((i) => i.id === menu.campo_id)
                  if (!industria) return null
                  return (
                    <Link
                      key={menu.id}
                      to={menu.ruta}
                      className="flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2.5 rounded-md transition-colors text-sm"
                    >
                      {menu.icon && <span>{menu.icon}</span>}
                      <span>{industria.nombre}</span>
                    </Link>
                  )
                })}
              </div>
              
              <div className="border-t border-white/20"></div>
              
              {/* Servicios */}
              <div className="space-y-1">
                <p className="text-white font-bold text-xs uppercase tracking-wider px-2 py-2">Servicios</p>
                {menusServicios.map((menu) => {
                  const servicio = globals?.servicios.find((s) => s.id === menu.campo_id)
                  if (!servicio) return null
                  return (
                    <Link
                      key={menu.id}
                      to={menu.ruta}
                      className="flex items-center gap-3 text-white hover:bg-white/10 px-3 py-2.5 rounded-md transition-colors text-sm"
                    >
                      {menu.icon && <span>{menu.icon}</span>}
                      <span>{servicio.nombre}</span>
                    </Link>
                  )
                })}
              </div>
              
              <div className="border-t border-white/20"></div>
              
              <div className="space-y-1">
                <Link to="/about" className="block text-white hover:bg-white/10 px-3 py-3 rounded-md transition-colors text-sm font-medium">Acerca de</Link>
                <Link to="/contact" className="block text-white hover:bg-white/10 px-3 py-3 rounded-md transition-colors text-sm font-medium">Contacto</Link>
              </div>
              
              <a
                href={`tel:+${globals?.whatsapp?.numero || '59177306576'}`}
                className="flex items-center justify-center gap-2 bg-white text-[#EA0A2A] px-4 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone size={18} /> Llamar ahora
              </a>
            </div>
          </div>
        </>
      )}
      
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </nav>
  )
}