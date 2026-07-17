import { supabase } from '@/lib/supabase'

// Interfaces basadas estrictamente en supabase_script_03.sql
export interface Empresa {
  id: number
  nombre: string
  logo: string | null
}

export interface Sucursal {
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
}

export interface Producto {
  id: number
  nombre: string
  slug: string
  imagen: string | null
}

export interface Industria {
  id: number
  nombre: string
  slug: string
  imagen: string | null
}

export interface Servicio {
  id: number
  nombre: string
  descripcion: string | null
  imagen: string | null
}

export interface MenuItem {
  id: number
  ruta: string
  orden: number
}

export interface Menu {
  id: number
  grupo: string
  tipo_registro: string
  registro_id: number
  ruta: string
  icono: string | null
  orden: number
  menu_item: MenuItem[]
}

export interface FooterItem {
  id: number
  tipo: string
  titulo: string | null
  url: string | null
  icono: string | null
  orden: number
}

export interface GlobalData {
  empresa: Empresa | null
  sucursales: Sucursal[]
  productos: Producto[]
  productos_populares: Producto[]
  industrias: Industria[]
  servicios: Servicio[]
  menus: {
    Producto?: Menu[]
    Aplicacion?: Menu[]
    Servicio?: Menu[]
  }
  footer_productos: FooterItem[]
  footer_industrias: FooterItem[]
  footer_servicios: FooterItem[]
  footer_redes_sociales: FooterItem[]
  whatsapp: {
    numero: string
    mensaje: string
  }
}

export const globalsService = {
  async getGlobalData(): Promise<GlobalData> {
    // 1. Obtener empresa principal activa
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nombre, logo')
      .eq('estado', 'activo')
      .limit(1)
      .single()

    if (empresaError && empresaError.code !== 'PGRST116') throw empresaError

    const empresaId = empresaData?.id || 1

    // 2. Obtener sucursales, productos, industrias y servicios en paralelo para optimizar
    const [
      { data: sucursalesData },
      { data: productosData },
      { data: industriasData },
      { data: serviciosData },
      { data: menusData },
      { data: footersData }
    ] = await Promise.all([
      supabase.from('sucursales').select('*').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('productos').select('id, nombre, slug, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('industrias').select('id, nombre, slug, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('servicios').select('id, nombre, descripcion, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('menus').select('id, grupo, tipo_registro, registro_id, ruta, icono, orden, menu_item(id, ruta, orden)').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('footers').select('id, tipo, titulo, url, icono, orden').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true })
    ])

    // 3. Agrupar menús por grupo (Producto, Aplicacion, Servicio)
    const menusAgrupados: GlobalData['menus'] = {}
    menusData?.forEach((menu: Menu) => {
      const grupoKey = menu.grupo as keyof GlobalData['menus']
      if (!menusAgrupados[grupoKey]) {
        menusAgrupados[grupoKey] = []
      }
      menusAgrupados[grupoKey]!.push(menu)
    })

    // 4. Filtrar footers por tipo
    const footer_productos = footersData?.filter(f => f.tipo === 'producto') || []
    const footer_industrias = footersData?.filter(f => f.tipo === 'industria') || []
    const footer_servicios = footersData?.filter(f => f.tipo === 'servicio') || []
    const footer_redes_sociales = footersData?.filter(f => f.tipo === 'red_social') || []

    // 5. Productos populares (los primeros 6)
    const productos_populares = productosData?.slice(0, 6) || []

    // 6. WhatsApp (Hardcodeado por ahora o desde tabla de configuración si existe)
    const whatsapp = {
      numero: '59177306576', 
      mensaje: 'Hola, necesito información sobre sus productos y servicios'
    }

    return {
      empresa: empresaData || null,
      sucursales: sucursalesData || [],
      productos: productosData || [],
      productos_populares,
      industrias: industriasData || [],
      servicios: serviciosData || [],
      menus: menusAgrupados,
      footer_productos,
      footer_industrias,
      footer_servicios,
      footer_redes_sociales,
      whatsapp
    }
  }
}