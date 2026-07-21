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

export interface Marca {
  id: number
  nombre: string
  slug: string
  logo: string | null
  orden: number
}

export interface PasoWizard {
  id: number
  identificador: string
  titulo: string
  descripcion: string
  fuente_datos: string
  campo_filtro: string | null
  orden: number
}

export interface HeroSlide {
  id: number
  imagen: string | null
  titulo: string | null
  subtitulo: string | null
  descripcion: string | null
  badge: string | null
  cta_primary_text: string | null
  cta_primary_href: string | null
  cta_secondary_text: string | null
  cta_secondary_href: string | null
  orden: number
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
  registro_id: number | null
}

export interface RegistroAbout {
  id: number
  identificador: string
  nombre: string
  descripcion: string | null
  detalles: RegistroContenido[]
}

export interface RegistroContenido {
  id: number
  titulo: string | null
  subtitulo: string | null
  descripcion: string | null
  icono: string | null
  stats: string | null
  orden: number
}

export interface GlobalData {
  empresa: Empresa | null
  sucursales: Sucursal[]
  productos: Producto[]
  productos_populares: Producto[]
  industrias: Industria[]
  servicios: Servicio[]
  marcas: Marca[]
  pasos_wizard: PasoWizard[]
  heroes: HeroSlide[]
  menus: {
    Producto?: Menu[]
    Aplicacion?: Menu[]
    Servicio?: Menu[]
  }
  registros_about: RegistroAbout[]
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

    // 2. Obtener todos los datos en paralelo para optimizar
    const [
      { data: sucursalesData },
      { data: productosData },
      { data: industriasData },
      { data: serviciosData },
      { data: marcasData },
      { data: pasosWizardData },
      { data: menusData },
      { data: footersData },
      { data: heroesData },
      { data: registrosData }
    ] = await Promise.all([
      supabase.from('sucursales').select('*').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('productos').select('id, nombre, slug, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('industrias').select('id, nombre, slug, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('servicios').select('id, nombre, descripcion, imagen').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('marcas').select('id, nombre, slug, logo, orden').eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('pasos_wizard').select('*').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('pasos_wizard').select('*').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('menus').select('id, grupo, tipo_registro, registro_id, ruta, icono, orden, menu_item(id, ruta, orden)').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('footers').select('id, tipo, titulo, url, icono, orden, registro_id').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      // ✅ NUEVO: Consulta a contenido_seccion para el Hero (tipo_seccion_id = 1)
      supabase
        .from('contenido_seccion')
        .select('id, titulo, subtitulo, descripcion, imagen, metadata, orden')
        .eq('empresa_id', empresaId)
        .eq('tipo_seccion_id', 1) // 1 = Hero
        .eq('mostrar', true)
        .eq('estado', 'activo')
        .order('orden', { ascending: true }),
      supabase.from('registros').select('id, identificador, nombre, descripcion, registro_contenido(id, titulo, subtitulo, descripcion, icono, stats, orden)').eq('estado', 'activo').order('orden', { ascending: true })
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

    // ✅ NUEVO: Mapear datos del Hero desde el campo metadata (JSONB)
    // El metadata viene como: { badge_text, cta_primary_text, cta_primary_href, cta_secondary_text, cta_secondary_href }
    const heroes = heroesData?.map((item: any) => {
      const meta = item.metadata || {}
      return {
        id: item.id,
        imagen: item.imagen,
        titulo: item.titulo,
        subtitulo: item.subtitulo,
        descripcion: item.descripcion,
        badge: meta.badge_text || null, // ✅ CORREGIDO: badge_text desde metadata
        cta_primary_text: meta.cta_primary_text || null, // ✅ CORREGIDO: cta_primary_text desde metadata
        cta_primary_href: meta.cta_primary_href || null, // ✅ CORREGIDO: cta_primary_href desde metadata
        cta_secondary_text: meta.cta_secondary_text || null, // ✅ CORREGIDO: cta_secondary_text desde metadata
        cta_secondary_href: meta.cta_secondary_href || null, // ✅ CORREGIDO: cta_secondary_href desde metadata
        orden: item.orden
      }
    }) || []

    const registros_about: RegistroAbout[] = registrosData?.map((registro: any) => ({
      id: registro.id,
      identificador: registro.identificador,
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      detalles: (registro.registro_contenido || []).sort((a: any, b: any) => a.orden - b.orden)
    })) || []

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
      marcas: marcasData || [],
      pasos_wizard: pasosWizardData || [],
      heroes,
      menus: menusAgrupados,
      footer_productos,
      footer_industrias,
      footer_servicios,
      footer_redes_sociales,
      registros_about,
      whatsapp
    }
  }
}