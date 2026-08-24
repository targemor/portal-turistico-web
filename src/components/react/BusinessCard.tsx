/**
 * BusinessCard.tsx
 * Tarjeta de negocio/lugar con galería, chips de atributos,
 * redes sociales, CTAs de contacto y botón compartir.
 * Adaptado de BusinessCard.astro (Cholula) al stack React + TailwindCSS v4 de Tehuacán.
 */

import { useState } from "react";
import ImageGallery from "./ImageGallery";
import { useLanguage } from "../../i18n/LanguageContext";
import { Phone, Globe, MapPin, Share2, ChevronDown, ChevronUp } from "lucide-react";

/* ─── Iconos de redes sociales ───────────────────────────── */
const InstagramIcon = () => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true">
    <defs>
      <linearGradient id="ig-grad-bc" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ig-grad-bc)"
      d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true">
    <path
      fill="#1877f2"
      d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"
    />
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 448 512" width="18" height="18" aria-hidden="true">
    <path
      fill="currentColor"
      d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 448 512" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-23.1-115-65-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-2.1-3.6.1-5.5 1.8-7.3 1.6-1.6 3.7-4.2 5.5-6.3 1.8-2.1 2.4-3.7 3.6-6.2 1.2-2.5.6-4.7-.3-6.2-1.9-3.4-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
    />
  </svg>
);

/* ─── Props ──────────────────────────────────────────────── */
export interface BusinessCardProps {
  id?: string | number;
  title: string;
  /** Galería de imágenes en formato compatible con ImageGallery */
  galeria?: { id?: string | number; url: string; alternativeText?: string }[] | null;
  /** URL de imagen simple como fallback */
  imagen?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  address?: string;
  mapsUrl?: string;
  phone?: string;
  whatsapp?: string;
  telefonoAlt?: string;
  sitioWeb?: string;
  description?: string;
  clasificacion?: string;
  acreditacion?: string;
  especializacion?: string;
  idiomas?: string | null;
  toursQueOfrece?: string;
  categoriaPrecio?: string;
  zona?: string;
  distancia?: string;
  amenidades?: string;
  tipoComida?: string;
  aceptaMascotas?: boolean;
  tieneAlberca?: boolean;
  tieneSpa?: boolean;
  terraza?: boolean;
  recepcion24h?: boolean;
  petFriendly?: boolean;
  musicaEnVivo?: boolean;
  espacioFisico?: string;
  categoriaGrupo?: string;
  estrellaMichelin?: boolean;
  showLocationCta?: boolean;
}

/* ─── Utilidades ─────────────────────────────────────────── */
function getValidHref(url?: string): string {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

function formatUrl(url?: string): string {
  if (!url) return "";
  try {
    return new URL(getValidHref(url)).hostname.replace("www.", "");
  } catch {
    return url.replace("www.", "");
  }
}

/* ═══════════════════════════════════════════════════════════
   Componente principal
═══════════════════════════════════════════════════════════ */
export default function BusinessCard({
  id,
  title,
  galeria,
  imagen,
  instagram,
  facebook,
  tiktok,
  address,
  mapsUrl,
  phone,
  whatsapp,
  telefonoAlt,
  sitioWeb,
  description,
  clasificacion,
  acreditacion,
  especializacion,
  idiomas,
  toursQueOfrece,
  categoriaPrecio,
  zona,
  distancia,
  amenidades,
  tipoComida,
  aceptaMascotas = false,
  tieneAlberca = false,
  tieneSpa = false,
  terraza = false,
  recepcion24h = false,
  petFriendly = false,
  musicaEnVivo = false,
  espacioFisico,
  estrellaMichelin = false,
  showLocationCta = false,
}: BusinessCardProps) {
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  /* ── Chips de atributos ── */
  const chips: { label: string; icon: string; isMichelin?: boolean }[] = [
    ...(estrellaMichelin
      ? [{ label: "Guía Michelin", icon: "⭐", isMichelin: true }]
      : []),
    ...(zona ? [{ label: zona, icon: "📍" }] : []),
    ...(tipoComida ? [{ label: tipoComida, icon: "🍽️" }] : []),
    ...(aceptaMascotas || petFriendly
      ? [{ label: t.bcPetFriendly, icon: "🐾" }]
      : []),
    ...(tieneAlberca ? [{ label: t.bcPool, icon: "🏊" }] : []),
    ...(tieneSpa ? [{ label: t.bcSpa, icon: "💆" }] : []),
    ...(terraza ? [{ label: t.bcTerrace, icon: "🌿" }] : []),
    ...(recepcion24h ? [{ label: t.bcReception24h, icon: "🕐" }] : []),
    ...(musicaEnVivo ? [{ label: t.bcLiveMusic, icon: "🎵" }] : []),
  ];

  /* ── Galería adaptada ── */
  const galeriaAdaptada =
    galeria && galeria.length > 0
      ? galeria
      : imagen
      ? [{ url: imagen }]
      : null;

  /* ── Compartir ── */
  const handleShare = async () => {
    const url =
      window.location.origin +
      window.location.pathname +
      (id ? "#" + id : "");
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // cancelado por el usuario
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        // Toast ligero
        const toast = document.createElement("div");
        toast.textContent = t.bcLinkCopied;
        toast.className =
          "fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-5 py-3 rounded-lg shadow-xl z-[9999] transition-opacity duration-300";
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => toast.remove(), 400);
        }, 2600);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      id={id ? String(id) : undefined}
      className="bg-white rounded-2xl overflow-hidden flex flex-col w-full shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100"
      data-clasificacion={clasificacion}
      data-categoria-grupo={undefined}
    >
      {/* ── Galería de imágenes ── */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden shrink-0 bg-slate-100">
        {estrellaMichelin && (
          <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 bg-black/85 backdrop-blur-sm text-amber-400 border border-amber-400/70 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg pointer-events-none">
            <span className="text-sm">⭐</span> Guía Michelin
          </div>
        )}
        {galeriaAdaptada ? (
          <ImageGallery galeria={galeriaAdaptada} fallbackName={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Globe className="w-12 h-12 text-slate-300" />
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        {/* Título */}
        <h3
          className="text-base sm:text-lg font-bold leading-snug"
          style={{ color: "var(--color-brand)" }}
        >
          {title}
        </h3>

        {/* Descripción */}
        {description && (
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {/* Redes sociales */}
        {(instagram || facebook || tiktok) && (
          <ul className="grid grid-cols-3 gap-2 text-sm">
            {instagram && (
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:opacity-70 transition-opacity"
                >
                  <InstagramIcon />
                  <span className="text-xs">Instagram</span>
                </a>
              </li>
            )}
            {facebook && (
              <li>
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:opacity-70 transition-opacity"
                >
                  <FacebookIcon />
                  <span className="text-xs">Facebook</span>
                </a>
              </li>
            )}
            {tiktok && (
              <li>
                <a
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-slate-500 hover:opacity-70 transition-opacity"
                >
                  <TiktokIcon />
                  <span className="text-xs">TikTok</span>
                </a>
              </li>
            )}
          </ul>
        )}

        {/* Info list */}
        <ul className="flex flex-col gap-2 text-sm">
          {acreditacion && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">📜</span>
              <span>
                <strong>{t.bcAccreditation}</strong> {acreditacion}
              </span>
            </li>
          )}
          {especializacion && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">🎯</span>
              <span>
                <strong>{t.bcSpecialization}</strong> {especializacion}
              </span>
            </li>
          )}
          {idiomas && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">🗣️</span>
              <span>
                <strong>{t.bcLanguages}</strong> {idiomas}
              </span>
            </li>
          )}
          {toursQueOfrece && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">🗺️</span>
              <span>
                <strong>{t.bcToursOffered}</strong> {toursQueOfrece}
              </span>
            </li>
          )}
          {address && (
            <li className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:opacity-70 transition-opacity"
                >
                  {address}
                </a>
              ) : (
                <span>{address}</span>
              )}
            </li>
          )}
          {distancia && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">🏛️</span>
              <span>{distancia}</span>
            </li>
          )}
          {/* Teléfono + Sitio web en grid */}
          {(phone || sitioWeb) && (
            <li className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              {phone && (
                <>
                  <Phone className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <span className="min-w-0">
                    <a
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      className="hover:underline hover:opacity-70 transition-opacity text-slate-600"
                    >
                      {phone}
                    </a>
                    {telefonoAlt && (
                      <>
                        ,{" "}
                        <a
                          href={`tel:${telefonoAlt.replace(/\D/g, "")}`}
                          className="hover:underline hover:opacity-70 transition-opacity text-slate-600"
                        >
                          {telefonoAlt}
                        </a>
                      </>
                    )}
                  </span>
                </>
              )}
              {sitioWeb && (
                <>
                  <Globe className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  <a
                    href={getValidHref(sitioWeb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline hover:opacity-70 transition-opacity text-slate-600"
                  >
                    {formatUrl(sitioWeb)}
                  </a>
                </>
              )}
            </li>
          )}
          {categoriaPrecio && (
            <li className="flex items-start gap-2 text-slate-600">
              <span className="text-base shrink-0">💵</span>
              <span>{categoriaPrecio}</span>
            </li>
          )}
        </ul>

        {/* Chips + Ver más */}
        {chips.length > 0 && (
          <div className="pt-3 border-t border-dashed border-slate-200">
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    chip.isMichelin
                      ? "bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 border border-amber-400/60"
                      : "bg-[#f0ebdc] text-[#5a5040]"
                  }`}
                >
                  {chip.icon} {chip.label}
                </span>
              ))}
              {(amenidades || espacioFisico) && (
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#c9c1b3] text-[#8c8273] hover:bg-[#f0ebdc] hover:text-[#5a5040] transition-all inline-flex items-center gap-1"
                >
                  {showMore ? (
                    <>
                      {t.bcSeeLess} <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      {t.bcSeeMore} <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Amenidades expandibles */}
            {showMore && (amenidades || espacioFisico) && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-2">
                  {amenidades || espacioFisico}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {showLocationCta && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4285F4] hover:bg-[#3b77e0] text-white text-xs font-bold transition-all"
            >
              <span>{t.bcViewLocation}</span>
              <MapPin className="w-3.5 h-3.5 shrink-0" />
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-bold transition-all"
              style={{ backgroundColor: "var(--color-brand)" }}
            >
              <span>{t.cardCall}</span>
              <Phone className="w-3.5 h-3.5 shrink-0" />
            </a>
          )}
          {whatsapp && (
            <a
              href={
                whatsapp.startsWith("http")
                  ? whatsapp
                  : `https://api.whatsapp.com/send?phone=52${whatsapp.replace(/\D/g, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#1bba5a] text-white text-xs font-bold transition-all"
            >
              <span>{t.cardBook}</span>
              <WhatsAppIcon />
            </a>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 min-w-[90px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <span>{t.cardShare}</span>
            <Share2 className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
