export interface RedSocial {
  id: number;
  plataforma: string;
  usuario: string | null;
  enlace: string | null;
}

export interface Contacto {
  id: number;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  whatsapp: string | null;
}

export interface Galeria {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
}

export interface Restaurante {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string | null;
  direccion: string;
  contacto: Contacto | null;
  galeria: Galeria | Galeria[] | null;
  redes_sociales: RedSocial[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Guia {
  id: number;
  documentId: string;
  nombre: string;
  credencial_sectur: string | null;
  contacto: Contacto | null;
  galeria: unknown | null;
  redes_sociales: RedSocial[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Hotel {
  id: number;
  documentId: string;
  nombre: string;
  estrellas: number;
  direccion: string;
  contacto: unknown | null;
  galeria: Galeria[] | null;
  redes_sociales: RedSocial[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Destino {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string | null;
  contacto: Contacto | null;
  galeria: unknown | null;
  redes_sociales: RedSocial[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type CategoriaImperdible = 'Naturaleza' | 'Cultura' | 'Salud' | 'Historia' | 'Aventura' | string;

export interface ImperdibleImagen {
  id?: number;
  documentId?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
}

export interface ImperdibleCategoria {
  id?: number;
  documentId?: string;
  nombre: string;
}

/** Shape real devuelto por la API / home-page.json */
export interface Imperdible {
  id: string | number;
  documentId?: string;
  nombre: string;
  descripcion_corta: string | null;
  descripcion_larga?: string | null;
  galeria?: ImperdibleImagen[] | null;
  imagen?: ImperdibleImagen | null;       // compatibilidad legacy
  categorias?: ImperdibleCategoria[];
  categoria?: CategoriaImperdible;        // compatibilidad legacy
  slug?: string | null;
  precio?: string | null;
  horarios?: string | null;
  como_llegar?: string | null;
  duracion_recomendada?: string | null;
  recomendaciones?: string | null;
  tips_imperdibles?: string | null;
  es_pet_friendly?: boolean;
  direccion_google_maps?: string | null;
  lat?: number | null;
  lng?: number | null;
  contacto?: Contacto | null;
  redes_sociales?: RedSocial[];
  googleMapsInfo?: {
    rating?: number;
    userRatingsTotal?: number;
    formattedAddress?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Artesania {
  id: number | string;
  nombre: string;
  clasificacion: string;
  especialidad?: string | null;
  descripcion?: string | null;
  direccion?: string | null;
  direccion_maps?: string | null;
  horario?: string | null;
  zona?: string | null;
  contacto?: Contacto | null;
  redes_sociales?: RedSocial[];
  galeria?: Galeria[] | null;
}

