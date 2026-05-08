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
  direccion: string;
  contacto: Contacto | null;
  galeria: unknown | null;
  redes_sociales: RedSocial[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Imperdible {
  id: string | number;
  categoria: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  cta: string;
  color: string;
}
