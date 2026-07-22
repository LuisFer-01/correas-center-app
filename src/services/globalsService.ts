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

export interface Marca {
  id: number
  nombre: string
  slug: string
  logo: string | null
  orden: number
}

export interface Producto {
  id: number
  nombre: string
  slug: string
  imagen: string | null
  orden: number
  categorias?: Array<{
    id: number
    nombre: string
    slug: string
    descripcion_corta: string | null
    uso: string | null
  }>
  marcas: Marca[]
}

export interface IndustriaAsignacion {
  id: number
  industria_id: number
  tipo_registro: string
  registro_id: number
  orden: number
}

export interface Industria {
  id: number
  nombre: string
  slug: string
  imagen: string | null
  orden: number
  categorias?: Array<{
    id: number
    nombre: string
    slug: string
    descripcion_corta: string | null
    producto?: {
      id: number
      nombre: string
      slug: string
    }
  }>
  servicios?: Array<{
    id: number
    nombre: string
    descripcion: string | null
    imagen: string | null
  }>
}

export interface Servicio {
  id: number
  nombre: string
  descripcion: string | null
  imagen: string | null
  orden: number
}

export interface Categoria {
  id: number
  nombre: string
  slug: string
  imagen: string | null
  uso: string | null
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

export interface InfraestructuraCaracteristica {
  id: number
  titulo: string
  descripcion: string
  icono: string | null
  stats: string | null
  orden: number
}

export interface InfraestructuraCapacidad {
  id: number
  nombre: string
  icono: string | null
  orden: number
}

export interface Differential {
  id: number
  titulo: string
  subtitulo: string
  descripcion: string
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
  marcas: Marca[]
  infraestructura_caracteristicas: InfraestructuraCaracteristica[]
  infraestructura_capacidades: InfraestructuraCapacidad[]
  diferenciales: Differential[]
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

    if (empresaError && empresaError.code !== 'PGRST116') {
      console.error('Error al obtener empresa:', empresaError)
    }

    const empresaId = empresaData?.id || 1

    // 2. Obtener todos los datos en paralelo para optimizar
    const [
      { data: sucursalesData, error: errorSucursales },
      { data: productosData, error: errorProductos },
      { data: industriasData, error: errorIndustrias },
      { data: industriaAsignacionesData, error: errorAsignaciones },
      { data: serviciosData, error: errorServicios },
      { data: marcasData, error: errorMarcas },
      { data: infraCaracteristicasData, error: errorInfraCaracteristicas },
      { data: infraCapacidadesData, error: errorInfraCapacidades },
      { data: diferencialesData, error: errorDiferenciales },
      { data: pasosWizardData, error: errorWizard },
      { data: menusData, error: errorMenus },
      { data: footersData, error: errorFooters },
      { data: heroesData, error: errorHeroes },
      { data: registrosData, error: errorRegistros }
    ] = await Promise.all([
      supabase.from('sucursales').select('id, nombre, direccion, telefono, email, horarios, mapa_incrustado, latitud, longitud, es_principal, orden').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('productos').select(`id, nombre, slug, imagen, orden, categorias!inner(id, nombre, slug, descripcion_corta, uso), producto_marca!inner(marca:marcas(id, nombre, slug, logo))`).eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('industrias').select('id, nombre, slug, imagen, orden').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      // ✅ NUEVO: Obtener asignaciones de industrias
      supabase.from('industria_asignacion').select('id, industria_id, tipo_registro, registro_id, orden').eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('servicios').select('id, nombre, descripcion, imagen, orden').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('marcas').select('id, nombre, slug, logo, orden').eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('contenido_seccion').select('id, titulo, subtitulo, descripcion, icono, metadata, orden').eq('empresa_id', empresaId).eq('tipo_seccion_id', 5).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('contenido_seccion').select('id, titulo, icono, orden').eq('empresa_id', empresaId).eq('tipo_seccion_id', 4).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('contenido_seccion').select('id, titulo, subtitulo, descripcion, icono, orden').eq('empresa_id', empresaId).eq('tipo_seccion_id', 2).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('pasos_wizard').select('id, identificador, titulo, descripcion, fuente_datos, campo_filtro, orden').eq('empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('menus').select('id, grupo, tipo_registro, registro_id, ruta, icono, orden, menu_item(id, ruta, orden)').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('footers').select('id, tipo, titulo, url, icono, orden, registro_id').eq('empresa_id', empresaId).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('contenido_seccion').select('id, titulo, subtitulo, descripcion, imagen, metadata, orden').eq('empresa_id', empresaId).eq('tipo_seccion_id', 1).eq('mostrar', true).eq('estado', 'activo').order('orden', { ascending: true }),
      supabase.from('registros').select('id, identificador, nombre, descripcion, registro_contenido(id, titulo, subtitulo, descripcion, icono, stats, orden)').eq('registro_contenido.empresa_id', empresaId).eq('estado', 'activo').order('orden', { ascending: true })
    ])

    // Log de errores para depuración
    if (errorSucursales || errorProductos || errorIndustrias || errorAsignaciones || errorServicios || errorMarcas || errorInfraCaracteristicas || errorInfraCapacidades || errorDiferenciales || errorWizard || errorMenus || errorFooters || errorHeroes || errorRegistros) {
      console.warn('Algunas consultas de globalsService tuvieron errores:', {
        errorSucursales, errorProductos, errorIndustrias, errorAsignaciones, errorServicios, errorMarcas, errorInfraCaracteristicas, errorInfraCapacidades, errorDiferenciales, errorWizard, errorMenus, errorFooters, errorHeroes, errorRegistros
      })
    }

    // 3. Agrupar menús por grupo
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

    // 5. Procesar productos
    const productosProcesados = (productosData || []).map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      imagen: p.imagen,
      orden: p.orden,
      categorias: p.categorias || [],
      marcas: Array.from(new Map(p.producto_marca?.map((pm: any) => [pm.marca.id, pm.marca])).values())
    }))

    // 6. ✅ NUEVO: Procesar industrias con sus asignaciones
    const industriasProcesadas = (industriasData || []).map((industria: any) => {
      // Filtrar asignaciones para esta industria
      const asignaciones = industriaAsignacionesData?.filter((a: any) => a.industria_id === industria.id) || []
      
      // Separar por tipo_registro
      const categoriasAsignadas = asignaciones
        .filter((a: any) => a.tipo_registro === 'categoria')
        .map((a: any) => {
          // Buscar la categoría en productosProcesados
          for (const producto of productosProcesados) {
            const categoria = producto.categorias?.find((c: any) => c.id === a.registro_id)
            if (categoria) {
              return {
                ...categoria,
                producto: {
                  id: producto.id,
                  nombre: producto.nombre,
                  slug: producto.slug
                }
              }
            }
          }
          return null
        })
        .filter(Boolean)

      const serviciosAsignados = asignaciones
        .filter((a: any) => a.tipo_registro === 'servicio')
        .map((a: any) => {
          return serviciosData?.find((s: any) => s.id === a.registro_id) || null
        })
        .filter(Boolean)

      return {
        ...industria,
        categorias: categoriasAsignadas,
        servicios: serviciosAsignados
      }
    })

    // 7. Mapear datos del Hero
    const heroes = heroesData?.map((item: any) => {
      const meta = item.metadata || {}
      return {
        id: item.id,
        imagen: item.imagen,
        titulo: item.titulo,
        subtitulo: item.subtitulo,
        descripcion: item.descripcion,
        badge: meta.badge_text || null,
        cta_primary_text: meta.cta_primary_text || null,
        cta_primary_href: meta.cta_primary_href || null,
        cta_secondary_text: meta.cta_secondary_text || null,
        cta_secondary_href: meta.cta_secondary_href || null,
        orden: item.orden
      }
    }) || []

    // 8. Mapear registros about
    const registros_about: RegistroAbout[] = registrosData?.map((registro: any) => ({
      id: registro.id,
      identificador: registro.identificador,
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      detalles: (registro.registro_contenido || []).sort((a: any, b: any) => a.orden - b.orden)
    })) || []

    // 9. WhatsApp
    const whatsapp = {
      numero: '59177306576',
      mensaje: 'Hola, necesito información sobre sus productos y servicios'
    }

    // 10. Mapear Infraestructura y Diferenciales
    const infraestructura_caracteristicas = infraCaracteristicasData?.map((item: any) => ({
      id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      icono: item.icono,
      stats: item.metadata?.stats || item.subtitulo,
      orden: item.orden
    })) || []

    const infraestructura_capacidades = infraCapacidadesData?.map((item: any) => ({
      id: item.id,
      nombre: item.titulo,
      icono: item.icono,
      orden: item.orden
    })) || []

    const diferenciales = diferencialesData?.map((item: any) => ({
      id: item.id,
      titulo: item.titulo,
      subtitulo: item.subtitulo,
      descripcion: item.descripcion,
      icono: item.icono,
      orden: item.orden
    })) || []

    return {
      empresa: empresaData || null,
      sucursales: sucursalesData || [],
      productos: productosProcesados || [],
      productos_populares: productosProcesados?.slice(0, 6) || [],
      industrias: industriasProcesadas || [],
      servicios: serviciosData || [],
      marcas: marcasData || [],
      infraestructura_caracteristicas,
      infraestructura_capacidades,
      diferenciales,
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