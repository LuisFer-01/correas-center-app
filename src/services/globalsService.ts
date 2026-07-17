import { supabase } from '@/lib/supabase'

export interface GlobalData {
  empresa: {
    id: number
    nombre: string
    logo: string | null
  } | null
  sucursales: Array<{
    id: number
    nombre: string
    direccion: string
    telefono: string
    email: string | null
    horarios: string | null
    mapa_incrustado: string | null
    latitud: number | null
    longitud: number | null
    es_principal: boolean
  }>
  productos: Array<{
    id: number
    nombre: string
    slug: string
    imagen: string | null
  }>
  productos_populares: Array<{
    id: number
    nombre: string
    slug: string
  }>
  industrias: Array<{
    id: number
    nombre: string
    slug: string
    imagen: string | null
  }>
  servicios: Array<{
    id: number
    nombre: string
    descripcion: string | null
    imagen: string | null
  }>
  menus: {
    Producto?: Array<{
      id: number
      grupo: string
      campo_id: number
      ruta: string
      icon: string | null
      orden: number
      detalle_menus?: Array<{
        id: number
        ruta: string
        orden: number
      }>
    }>
    Aplicacion?: Array<{
      id: number
      grupo: string
      campo_id: number
      ruta: string
      icon: string | null
      orden: number
    }>
    Servicio?: Array<{
      id: number
      grupo: string
      campo_id: number
      ruta: string
      icon: string | null
      orden: number
    }>
  }
  footer_productos: Array<{
    id: number
    tipo: string
    campo_id: number
    producto?: {
      id: number
      nombre: string
      slug: string
    }
  }>
  footer_industrias: Array<{
    id: number
    tipo: string
    campo_id: number
    industria?: {
      id: number
      nombre: string
      slug: string
    }
  }>
  footer_servicios: Array<{
    id: number
    tipo: string
    campo_id: number
    servicio?: {
      id: number
      nombre: string
    }
  }>
  footer_redes_sociales: Array<{
    id: number
    tipo: string
    titulo: string | null
    url: string | null
    icono: string | null
    orden: number
  }>
  whatsapp: {
    numero: string
    mensaje: string
  }
}

export const globalsService = {
  async getGlobalData(): Promise<GlobalData> {
    // Obtener empresa principal activa
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nombre, logo')
      .eq('estado', 'activo')
      .limit(1)
      .single()

    if (empresaError) throw empresaError

    // Obtener sucursales activas ordenadas
    const { data: sucursalesData, error: sucursalesError } = await supabase
      .from('sucursales')
      .select('id, nombre, direccion, telefono, email, horarios, mapa_incrustado, latitud, longitud, es_principal')
      .eq('empresa_id', empresaData?.id || 1)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    if (sucursalesError) throw sucursalesError

    // Obtener productos activos
    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, slug, imagen')
      .eq('empresa_id', empresaData?.id || 1)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    if (productosError) throw productosError

    // Obtener productos populares (los primeros 6 productos)
    const productosPopulares = productosData?.slice(0, 6) || []

    // Obtener industrias activas
    const { data: industriasData, error: industriasError } = await supabase
      .from('industrias')
      .select('id, nombre, slug, imagen')
      .eq('empresa_id', empresaData?.id || 1)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    if (industriasError) throw industriasError

    // Obtener servicios activos
    const { data: serviciosData, error: serviciosError } = await supabase
      .from('servicios')
      .select('id, nombre, descripcion, imagen')
      .eq('empresa_id', empresaData?.id || 1)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    if (serviciosError) throw serviciosError

    // Obtener menús agrupados por grupo con sus detalles
    const { data: menusData, error: menusError } = await supabase
      .from('menus')
      .select(`
        id,
        grupo,
        campo_id,
        ruta,
        icon,
        orden,
        detalle_menus (
          id,
          ruta,
          orden
        )
      `)
      .eq('empresa_id', empresaData?.id || 1)
      .eq('mostrar', true)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    if (menusError) throw menusError

    // Agrupar menús por grupo
    const menusAgrupados: GlobalData['menus'] = {}
    menusData?.forEach((menu: any) => {
      const grupoKey = menu.grupo === 'Producto' ? 'Producto' : 
                       menu.grupo === 'Aplicacion' ? 'Aplicacion' : 'Servicio'
      
      if (!menusAgrupados[grupoKey]) {
        menusAgrupados[grupoKey] = []
      }
      
      menusAgrupados[grupoKey]!.push({
        id: menu.id,
        grupo: menu.grupo,
        campo_id: menu.campo_id,
        ruta: menu.ruta,
        icon: menu.icon,
        orden: menu.orden,
        detalle_menus: menu.detalle_menus || []
      })
    })

    // Obtener items para footer de productos
    const { data: footerProductosData } = await supabase
      .from('footers')
      .select(`
        id,
        tipo,
        campo_id,
        producto:productos!campo_id (
          id,
          nombre,
          slug
        )
      `)
      .eq('empresa_id', empresaData?.id || 1)
      .eq('tipo', 'producto')
      .eq('mostrar', true)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })
      .limit(8)

    // Obtener items para footer de industrias
    const { data: footerIndustriasData } = await supabase
      .from('footers')
      .select(`
        id,
        tipo,
        campo_id,
        industria:industrias!campo_id (
          id,
          nombre,
          slug
        )
      `)
      .eq('empresa_id', empresaData?.id || 1)
      .eq('tipo', 'industria')
      .eq('mostrar', true)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })
      .limit(6)

    // Obtener items para footer de servicios
    const { data: footerServiciosData } = await supabase
      .from('footers')
      .select(`
        id,
        tipo,
        campo_id,
        servicio:servicios!campo_id (
          id,
          nombre
        )
      `)
      .eq('empresa_id', empresaData?.id || 1)
      .eq('tipo', 'servicio')
      .eq('mostrar', true)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })
      .limit(4)

    // Obtener redes sociales
    const { data: footerRedesData } = await supabase
      .from('footers')
      .select('id, tipo, titulo, url, icono, orden')
      .eq('empresa_id', empresaData?.id || 1)
      .eq('tipo', 'red_social')
      .eq('mostrar', true)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    // WhatsApp (hardcodeado por ahora o desde configuración)
    const whatsapp = {
      numero: '59177306576', // Teléfono principal de la empresa
      mensaje: 'Hola, necesito información sobre sus productos y servicios'
    }

    return {
      empresa: empresaData || null,
      sucursales: sucursalesData || [],
      productos: productosData || [],
      productos_populares: productosPopulares,
      industrias: industriasData || [],
      servicios: serviciosData || [],
      menus: menusAgrupados,
      footer_productos: footerProductosData || [],
      footer_industrias: footerIndustriasData || [],
      footer_servicios: footerServiciosData || [],
      footer_redes_sociales: footerRedesData || [],
      whatsapp
    }
  }
}