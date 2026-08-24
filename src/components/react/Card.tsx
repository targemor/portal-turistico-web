import React from "react";
import ImageGallery from "./ImageGallery";
import { useLanguage } from "../../i18n/LanguageContext";

import { MapPin, Home, Star, Phone, Share2, User } from "lucide-react";

// Iconos para redes sociales de marcas (Facebook, Instagram, Tiktok, WhatsApp)
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export interface CardItem {
  id: string | number;
  nombre?: string;
  titulo?: string;
  descripcion?: string | null;
  direccion?: string;
  estrellas?: number;
  especialidad?: string;
  galeria?: any;
  imagen?: string;
  redes_sociales?: { plataforma: string; enlace: string }[];
  telefono?: string;
  whatsapp?: string;
  contacto?: {
    telefono?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    sitio_web?: string | null;
  } | null;
}

interface CardProps {
  item: CardItem;
  categoria: string;
  children?: React.ReactNode;
}

export default function Card({ item, categoria, children }: CardProps) {
  const { t } = useLanguage();

  const getBtnText = () => {
    switch (categoria) {
      case 'hoteles':      return t.cardAvailability;
      case 'restaurantes': return t.cardMenu;
      case 'guias':        return t.cardContact;
      default:             return t.cardDetails;
    }
  };

  const nombreItem = item.nombre || item.titulo || t.cardNoName;

  const hasGaleria = item.galeria && (Array.isArray(item.galeria) ? item.galeria.length > 0 : true);
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
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                {(item as any).credencial_sectur === "Sí" && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-full border border-transparent bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">{t.cardSectur}</span>
                  </div>
                )}
              </>
            ) : (
              <Home className="w-12 h-12 text-slate-300" />
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-1">
        {item.especialidad && (
          <div className="mb-3">
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 transition-colors">
              {item.especialidad}
            </span>
          </div>
        )}

        <h3 className="text-xl font-bold mb-2 text-slate-900">{nombreItem}</h3>

        {item.estrellas && (
          <div className="flex gap-0.5 mb-3" aria-label={`${item.estrellas} ${t.cardStars}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < (item.estrellas || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
            ))}
          </div>
        )}

        {item.direccion && (() => {
          const mapLink =
            (item as any).direccion_maps ||
            (item as any).direccion_google_maps ||
            (item as any).mapsUrl ||
            `https://maps.google.com/?q=${encodeURIComponent(nombreItem + " " + item.direccion + " Tehuacán")}`;

          return (
            <p className="text-slate-600 text-sm flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-brand transition-colors font-medium"
                title="Abrir en Google Maps"
              >
                {item.direccion}
              </a>
            </p>
          );
        })()}

        {/* Chips de Amenidades */}
        {(() => {
          const text = [
            (item as any).caracteristicas,
            (item as any).amenidades,
            (item as any).especialidad,
            item.descripcion
          ].filter(Boolean).join(" ").toLowerCase();

          const isPetFriendly = (item as any).pet_friendly || (item as any).petFriendly || (item as any).aceptaMascotas || text.includes("pet friendly") || text.includes("mascotas");
          const hasEstacionamiento = (item as any).estacionamiento || text.includes("estacionamiento") || text.includes("parking");
          const hasAlberca = (item as any).alberca || (item as any).tieneAlberca || text.includes("alberca") || text.includes("piscina");
          const hasGimnasio = (item as any).gimnasio || text.includes("gimnasio") || text.includes("gym");
          const hasJardin = (item as any).jardin || text.includes("jardín") || text.includes("jardin");
          const hasTerraza = (item as any).terraza || text.includes("terraza");
          const hasMusicaEnVivo = (item as any).musica_en_vivo || (item as any).musicaEnVivo || text.includes("música en vivo") || text.includes("musica en vivo");
          const hasVistasIncreibles = (item as any).vistas_increibles || (item as any).vistasIncreibles || text.includes("vistas increíbles") || text.includes("vistas increibles") || text.includes("vista panorámica");
          const hasParaLlevar = (item as any).para_llevar || (item as any).paraLlevar || text.includes("para llevar");
          const hasAireLibre = (item as any).aire_libre || (item as any).aireLibre || text.includes("aire libre");
          const hasRecepcion24h = (item as any).recepcion_24h || (item as any).recepcion24h || text.includes("24h") || text.includes("24 horas") || text.includes("recepción 24");
          const hasDesayuno = (item as any).desayuno_cortesia || text.includes("desayuno");

          const chips: { label: string; icon: string }[] = [];
          if (isPetFriendly) chips.push({ label: "Pet Friendly", icon: "🐾" });
          if (hasEstacionamiento) chips.push({ label: "Estacionamiento", icon: "🚗" });
          if (hasAlberca) chips.push({ label: "Alberca", icon: "🏊" });
          if (hasGimnasio) chips.push({ label: "Gimnasio", icon: "🏋️" });
          if (hasJardin) chips.push({ label: "Jardín", icon: "🌳" });
          if (hasTerraza) chips.push({ label: "Terraza", icon: "🌿" });
          if (hasMusicaEnVivo) chips.push({ label: "Música en vivo", icon: "🎵" });
          if (hasVistasIncreibles) chips.push({ label: "Vistas increíbles", icon: "🌄" });
          if (hasParaLlevar) chips.push({ label: "Para llevar", icon: "🛍️" });
          if (hasAireLibre) chips.push({ label: "Aire libre", icon: "🍃" });
          if (hasRecepcion24h) chips.push({ label: "Recepción 24h", icon: "🕐" });
          if (hasDesayuno) chips.push({ label: "Desayuno gratis", icon: "☕" });

          if (chips.length === 0) return null;

          return (
            <div className="flex flex-wrap gap-1.5 my-3">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80"
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </span>
              ))}
            </div>
          );
        })()}

        {children}

        {item.redes_sociales && item.redes_sociales.length > 0 && (
          <div className="flex gap-2 mb-3 mt-4">
            {item.redes_sociales.map((red, idx) => {
              const platformLower = red.plataforma.toLowerCase();
              const IconComp = platformLower === 'facebook' ? FacebookIcon :
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
                  {IconComp && <IconComp className="w-4 h-4" />}
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="flex gap-2 w-full">
            {(item.contacto?.telefono || item.telefono) && (
              <a
                href={`tel:${item.contacto?.telefono || item.telefono}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors bg-[#C55A50] hover:bg-[#A84C43] text-white h-10 px-2 py-2 whitespace-nowrap"
              >
                {t.cardCall}
                <Phone className="w-4 h-4 shrink-0" />
              </a>
            )}
            {(item.contacto?.whatsapp || item.whatsapp) && (
              <a
                href={`https://wa.me/${item.contacto?.whatsapp || item.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors bg-[#25D366] hover:bg-[#1DA851] text-white h-10 px-2 py-2 whitespace-nowrap"
              >
                {t.cardBook}
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
              </a>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: nombreItem,
                    text: item.descripcion || '',
                    url: window.location.href,
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert(t.cardLinkCopied);
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors bg-[#4B5563] hover:bg-[#374151] text-white h-10 px-2 py-2 whitespace-nowrap"
            >
              {t.cardShare}
              <Share2 className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
