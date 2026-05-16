import React from "react";
import ImageGallery from "./ImageGallery";

// Iconos SVG en línea (reemplazos compatibles con React para los iconos de Astro)
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export interface CardItem {
  id: string | number;
  nombre?: string;
  titulo?: string; // Para el caso de imperdibles que usa 'titulo' en vez de 'nombre'
  descripcion?: string | null;
  direccion?: string;
  estrellas?: number;
  especialidad?: string;
  galeria?: any;
  imagen?: string; // Para imperdibles que usa 'imagen'
  redes_sociales?: { plataforma: string; enlace: string }[];
}

interface CardProps {
  item: CardItem;
  categoria: string;
  children?: React.ReactNode;
}

export default function Card({ item, categoria, children }: CardProps) {
  const getBtnText = () => {
    switch (categoria) {
      case 'hoteles': return 'Ver disponibilidad';
      case 'restaurantes': return 'Ver menú';
      case 'guias': return 'Contactar guía';
      default: return 'Ver detalles';
    }
  };

  const nombreItem = item.nombre || item.titulo || "Sin nombre";

  // Verificar si hay galería o imagen
  const hasGaleria = item.galeria && (Array.isArray(item.galeria) ? item.galeria.length > 0 : true);
  
  // Transformar imagen única de imperdibles al formato de galería si es necesario
  const galeriaAdaptada = hasGaleria ? item.galeria : (item.imagen ? [{ url: item.imagen }] : null);

  return (
    <div id={`${categoria}-${item.id}`} className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden group flex flex-col h-full">
      {/* Imagen */}
      <div className="aspect-video overflow-hidden bg-slate-100 relative group-hover:z-10 shrink-0">
        {galeriaAdaptada ? (
          <ImageGallery galeria={galeriaAdaptada} fallbackName={nombreItem} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 relative">
            {categoria === 'guias' ? (
              <>
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-slate-400">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                {(item as any).credencial_sectur === "Sí" && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-full border border-transparent bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">✓ SECTUR</span>
                  </div>
                )}
              </>
            ) : (
              <HomeIcon className="w-12 h-12 text-slate-300" />
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-1">
        {/* Badges (ej. Especialidad en restaurantes) */}
        {item.especialidad && (
          <div className="mb-3">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 transition-colors">
              {item.especialidad}
            </span>
          </div>
        )}

        {/* Título */}
        <h3 className="text-xl font-bold mb-2 text-slate-900">{nombreItem}</h3>

        {/* Descripción */}
        {item.descripcion && (
          <p className="text-slate-500 text-sm line-clamp-3 mb-3">
            {item.descripcion}
          </p>
        )}

        {/* Estrellas visuales */}
        {item.estrellas && (
          <div className="flex gap-0.5 mb-3" aria-label={`${item.estrellas} de 5 estrellas`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`w-4 h-4 ${i < (item.estrellas || 0) ? "text-amber-400" : "text-slate-200"}`} />
            ))}
          </div>
        )}

        {/* Ubicación */}
        {item.direccion && (
          <p className="text-slate-500 text-sm flex items-start gap-2 mb-2">
            <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            {item.direccion}
          </p>
        )}

        {/* Contenido extra inyectado como children */}
        {children}

        {/* Redes sociales */}
        {item.redes_sociales && item.redes_sociales.length > 0 && (
          <div className="flex gap-2 mb-3 mt-4">
            {item.redes_sociales.map((red, idx) => {
              const platformLower = red.plataforma.toLowerCase();
              const Icon = platformLower === 'facebook' ? FacebookIcon : 
                           platformLower === 'instagram' ? InstagramIcon : 
                           platformLower === 'tiktok' ? TiktokIcon : null;
              return (
                <a
                  key={idx}
                  href={red.enlace ?? "#"}
                  target={red.enlace ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={red.plataforma}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-brand border border-slate-200 hover:border-brand/30 bg-white transition-all"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </a>
              );
            })}
          </div>
        )}

        {/* Spacer para empujar el botón al fondo si la card crece */}
        <div className="mt-auto pt-6">
          {/* Botón */}
          <button className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors border border-slate-200 bg-white hover:bg-brand hover:text-white hover:border-brand h-10 px-4 py-2 w-full text-slate-900">
            {getBtnText()}
          </button>
        </div>
      </div>
    </div>
  );
}
