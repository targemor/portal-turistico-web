import { useState } from "react";
import ImperdiblesMap from "./ImperdiblesMap";
import LeafIcon from "../../assets/icons/LeafIcon";
import CultureIcon from "../../assets/icons/CultureIcon";
import DropletIcon from "../../assets/icons/DropletIcon";
import ArrowRightIcon from "../../assets/icons/ArrowRightIcon";
import type { MarkerData } from "./ImperdiblesMap";
/* ─── Tipos ──────────────────────────────────────────────── */
interface ImperdibleImagen {
  url: string;
  alternativeText?: string | null;
}

interface Imperdible {
  id: string | number;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  cta: string;
  imagen: ImperdibleImagen | null;
  direccionGoogleMaps?: string | null;
  lat?: number;
  lng?: number;
  googleMapsInfo?: {
    rating?: number;
    userRatingsTotal?: number;
    formattedAddress?: string;
  };
}

interface Props {
  imperdibles: Imperdible[];
}



/* ─── Config de categorías ────────────────────────────────── */
const CATEGORIA_CONFIG: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  Naturaleza: {
    color: "#82BC00",
    label: "Naturaleza",
    icon: <LeafIcon className="w-4 h-4" />,
  },
  Cultura: {
    color: "#7D287E",
    label: "Cultura",
    icon: <CultureIcon className="w-4 h-4" />,
  },
  Salud: {
    color: "#009BA4",
    label: "Manantiales",
    icon: <DropletIcon className="w-4 h-4" />,
  },
};

/* ─── Componente principal ────────────────────────────────── */
export default function ImperdiblesSection({ imperdibles }: Props) {
  // Extraer categorías únicas presentes en los datos
  const categories = Array.from(
    new Set(imperdibles.map((i) => i.categoria))
  ).map((cat) => ({
    id: cat,
    label: CATEGORIA_CONFIG[cat]?.label ?? cat,
    icon: CATEGORIA_CONFIG[cat]?.icon ?? null,
    color: CATEGORIA_CONFIG[cat]?.color ?? "#64748b",
  }));

  const defaultCategory = categories.find(c => c.id === "Naturaleza")?.id ?? (categories[0]?.id ?? "");
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  // Filtrar los imperdibles de la categoría activa
  const filtered = imperdibles.filter((i) => i.categoria === activeCategory);

  // Card principal (la más grande, col-span-7)
  const main = filtered[0];
  // Cards secundarias
  const secondary = filtered.slice(1);

  // Si no hay filtrados, mostrar el primero de todos
  const mainItem = main ?? imperdibles[0];
  const secondaryItems = secondary.length > 0 ? secondary : imperdibles.slice(1);

  const mainColor =
    CATEGORIA_CONFIG[mainItem?.categoria]?.color ?? "#64748b";

  const markers: MarkerData[] = filtered
    .map((item) => {
      if (item.lat === undefined || item.lng === undefined || item.lat === null || item.lng === null) return null;
      
      return {
        id: item.id,
        title: item.titulo,
        position: { lat: item.lat, lng: item.lng },
        color: CATEGORIA_CONFIG[item.categoria]?.color ?? "#000",
        googleMapsInfo: item.googleMapsInfo,
      };
    })
    .filter((m): m is MarkerData => m !== null);

  return (
    <section className="py-24 bg-white border-y border-slate-100">
      <div className="container mx-auto px-6">
        {/* ── Header + Tabs ── */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl font-black tracking-tighter mb-8 uppercase">
            Los Imperdibles
          </h2>

          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Filtro de categorías"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={
                    isActive
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : undefined
                  }
                  className={`flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border ${
                    isActive
                      ? "text-white shadow-lg scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bento grid ── */}
        {mainItem && (
          <div id="explora-panel" className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card grande */}
            <div className="md:col-span-7 relative rounded-[2rem] overflow-hidden group shadow-xl h-[420px] md:h-[600px]">
              <img
                src={mainItem.imagen?.url ?? ""}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={mainItem.imagen?.alternativeText ?? mainItem.titulo}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <div
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-4"
                  style={{ backgroundColor: mainColor }}
                >
                  Destacado
                </div>
                <h3 className="text-white text-4xl font-black mb-4 leading-none tracking-tighter">
                  {mainItem.titulo}
                </h3>
                <p className="text-white/80 max-w-md mb-8 font-medium">
                  {mainItem.descripcion}
                </p>
                <a
                  href={mainItem.direccionGoogleMaps || "#destinos"}
                  target={mainItem.direccionGoogleMaps ? "_blank" : undefined}
                  rel={mainItem.direccionGoogleMaps ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-white text-xs font-black uppercase hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: mainColor }}
                >
                  {mainItem.cta}
                </a>
              </div>
            </div>

            {/* Cards secundarias */}
            <div className="md:col-span-5 flex flex-col gap-6 h-[600px] md:h-[600px]">
              {secondaryItems.length > 0 ? (
                secondaryItems.map((item) => {
                  const itemColor =
                    CATEGORIA_CONFIG[item.categoria]?.color ?? "#64748b";
                  return (
                    <div
                      key={item.id}
                      className="relative rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-0"
                    >
                      <img
                        src={item.imagen?.url ?? ""}
                        className="w-full h-full object-cover transition-all duration-700"
                        alt={item.imagen?.alternativeText ?? item.titulo}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 transition-opacity opacity-40 group-hover:opacity-80" />
                      <div className="absolute inset-0 flex flex-col justify-end p-10">
                        <div
                          className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-2"
                          style={{ backgroundColor: itemColor }}
                        >
                          {item.categoria}
                        </div>
                        <h3 className="text-white text-2xl font-black mb-2">
                          {item.titulo}
                        </h3>
                        <a 
                          href={item.direccionGoogleMaps || "#destinos"}
                          target={item.direccionGoogleMaps ? "_blank" : undefined}
                          rel={item.direccionGoogleMaps ? "noopener noreferrer" : undefined}
                          className="text-white/80 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all z-10 relative"
                        >
                          {item.cta}
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback: mostrar todos los imperdibles de otras categorías */
                imperdibles
                  .filter((i) => i.id !== mainItem.id)
                  .slice(0, 2)
                  .map((item) => {
                    const itemColor =
                      CATEGORIA_CONFIG[item.categoria]?.color ?? "#64748b";
                    return (
                      <div
                        key={item.id}
                        className="relative rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-0"
                      >
                        <img
                          src={item.imagen?.url ?? ""}
                          className="w-full h-full object-cover transition-all duration-700"
                          alt={item.imagen?.alternativeText ?? item.titulo}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 transition-opacity opacity-40 group-hover:opacity-80" />
                        <div className="absolute inset-0 flex flex-col justify-end p-10">
                          <div
                            className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-2"
                            style={{ backgroundColor: itemColor }}
                          >
                            {item.categoria}
                          </div>
                          <h3 className="text-white text-2xl font-black mb-2">
                            {item.titulo}
                          </h3>
                          <a 
                            href={item.direccionGoogleMaps || "#destinos"}
                            target={item.direccionGoogleMaps ? "_blank" : undefined}
                            rel={item.direccionGoogleMaps ? "noopener noreferrer" : undefined}
                            className="text-white/80 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all z-10 relative"
                          >
                            {item.cta}
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ── Mapa Oficial de Google Maps ── */}
        <ImperdiblesMap markers={markers} />
      </div>
    </section>
  );
}
