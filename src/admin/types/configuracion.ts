export type TipoConfiguracion = 'texto' | 'numero' | 'booleano' | 'imagen' | 'json';
export type GrupoConfiguracion = 'general' | 'seo' | 'redes_sociales' | 'analytics' | 'contacto' | 'whatsapp' | 'chat';

export interface ConfiguracionSitio {
  id: number;
  empresa_id: number;
  clave: string;
  valor: string | null;
  tipo: TipoConfiguracion;
  descripcion: string | null;
  grupo: GrupoConfiguracion | string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface CreateConfiguracionDTO {
  empresa_id: number;
  clave: string;
  valor?: string;
  tipo: TipoConfiguracion;
  descripcion?: string;
  grupo: GrupoConfiguracion | string;
  activo?: boolean;
}

export interface UpdateConfiguracionDTO {
  id: number;
  valor?: string;
  activo?: boolean;
  descripcion?: string; // Permitimos actualizar la descripción por si acaso
}