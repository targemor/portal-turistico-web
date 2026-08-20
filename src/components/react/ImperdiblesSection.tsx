import { useState, useEffect } from "react";
import ImperdiblesMap from "./ImperdiblesMap";
import DestinoInfoCard from "./DestinoInfoCard";
import LeafIcon from "../../assets/icons/LeafIcon";
import CultureIcon from "../../assets/icons/CultureIcon";
import DropletIcon from "../../assets/icons/DropletIcon";
import ArrowRightIcon from "../../assets/icons/ArrowRightIcon";
import LandmarkIcon from "../../assets/icons/LandmarkIcon";
import MountainIcon from "../../assets/icons/MountainIcon";
import type { MarkerData } from "./ImperdiblesMap";
import { useLanguage, LanguageProvider } from "../../i18n/LanguageContext";
import type { Imperdible } from "../../types";

interface Props {
  imperdibles: Imperdible[];
}

/* ─── Config de categorías ────────────────────────────────── */
// Los colores son fijos; las labels se toman del diccionario i18n en runtime
const CATEGORIA_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; labelKey: string }
> = {
  Naturaleza: {
    color: "#82BC00",
    labelKey: "impCatNaturaleza",
    icon: <LeafIcon className="w-4 h-4" />,
  },
  Cultura: {
    color: "#7D287E",
    labelKey: "impCatCultura",
    icon: <CultureIcon className="w-4 h-4" />,
  },
  Salud: {
    color: "#009BA4",
    labelKey: "impCatSalud",
    icon: <DropletIcon className="w-4 h-4" />,
  },
  Historia: {
    color: "#D97706",
    labelKey: "impCatHistoria",
    icon: <LandmarkIcon className="w-4 h-4" />,
  },
  Aventura: {
    color: "#EF4444",
    labelKey: "impCatAventura",
    icon: <MountainIcon className="w-4 h-4" />,
  },
};

/* ─── Componente principal (envuelto en LanguageProvider para uso independiente) ─── */
export default function ImperdiblesSection({ imperdibles }: Props) {
  return (
    <LanguageProvider>
      <ImperdiblesSectionInner imperdibles={imperdibles} />
    </LanguageProvider>
  );
}

function ImperdiblesSectionInner({ imperdibles }: Props) {
  const { t } = useLanguage();

  const allCategories = new Set<string>();
  imperdibles.forEach(i => {
    i.categorias?.forEach(c => {
      if (c.nombre) allCategories.add(c.nombre);
    });
  });

  const categories = Array.from(allCategories).map((cat) => ({
    id: cat,
    label: t[CATEGORIA_CONFIG[cat]?.labelKey as keyof typeof t] as string ?? cat,
    icon: CATEGORIA_CONFIG[cat]?.icon ?? null,
    color: CATEGORIA_CONFIG[cat]?.color ?? "#64748b",
  }));

  const defaultCategory = categories.find(c => c.id === "Naturaleza")?.id ?? (categories[0]?.id ?? "");
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null);

  // Filtrar los imperdibles de la categoría activa
  const filtered = imperdibles.filter((i) => i.categorias?.some(c => c.nombre === activeCategory));

  // Actualizar el marcador activo cuando cambia la categoría
  useEffect(() => {
    setActiveMarkerId(filtered[0]?.id ?? null);
  }, [activeCategory]);

  const activeMarkerItem = filtered.find(i => i.id === activeMarkerId) ?? filtered[0];
  const activeIndex = filtered.findIndex(i => i.id === activeMarkerId);
  const actualIndex = activeIndex >= 0 ? activeIndex : 0;
  
  const handlePrev = () => {
    if (filtered.length <= 1) return;
    const prevIndex = actualIndex > 0 ? actualIndex - 1 : filtered.length - 1;
    setActiveMarkerId(filtered[prevIndex].id);
  };

  const handleNext = () => {
    if (filtered.length <= 1) return;
    const nextIndex = actualIndex < filtered.length - 1 ? actualIndex + 1 : 0;
    setActiveMarkerId(filtered[nextIndex].id);
  };

  const activeMarkerColor = CATEGORIA_CONFIG[activeMarkerItem?.categorias?.[0]?.nombre || ""]?.color ?? "#64748b";

  // Card principal (la más grande, col-span-7)
  const main = filtered[0];
  // Cards secundarias
  const secondary = filtered.slice(1);

  // Si no hay filtrados, mostrar el primero de todos
  const mainItem = main ?? imperdibles[0];
  const secondaryItems = secondary.length > 0 ? secondary : imperdibles.slice(1);

  const mainColor =
    CATEGORIA_CONFIG[mainItem?.categorias?.[0]?.nombre || ""]?.color ?? "#64748b";

  const markers: MarkerData[] = filtered
    .map((item): MarkerData | null => {
      if (item.lat === undefined || item.lng === undefined || item.lat === null || item.lng === null) return null;
      return {
        id: item.id,
        title: item.nombre,
        position: { lat: item.lat, lng: item.lng },
        color: CATEGORIA_CONFIG[item.categorias?.[0]?.nombre || ""]?.color ?? "#000",
        googleMapsInfo: item.googleMapsInfo ?? undefined,
      };
    })
    .filter((m): m is MarkerData => m !== null);

  return (
    <section id="imperdibles" className="py-24 bg-white border-y border-slate-100">
      <div className="container mx-auto px-6">
        {/* ── Header + Tabs ── */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl font-black tracking-tighter mb-8 uppercase">
            {t.impTitle}
          </h2>

          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label={t.impFilterAria}
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
          <div id="explora-panel" className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card grande */}
            <div className="md:col-span-7 relative rounded-[2rem] overflow-hidden group shadow-xl h-[420px] md:h-[600px]">
              <img
                src={mainItem.galeria?.[0]?.url ?? ""}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={mainItem.galeria?.[0]?.alternativeText ?? mainItem.nombre}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <div
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-4"
                  style={{ backgroundColor: mainColor }}
                >
                  {t.impFeatured}
                </div>
                <h3 className="text-white text-4xl font-black mb-4 leading-none tracking-tighter">
                  {mainItem.nombre}
                </h3>
                <p className="text-white/80 max-w-md mb-8 font-medium line-clamp-3">
                  {mainItem.descripcion_corta}
                </p>
                <a
                  href={mainItem.direccion_google_maps || "#destinos"}
                  target={mainItem.direccion_google_maps ? "_blank" : undefined}
                  rel={mainItem.direccion_google_maps ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-white text-xs font-black uppercase hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: mainColor }}
                >
                  {t.impSeeMore}
                </a>
              </div>
            </div>

            {/* Cards secundarias */}
            <div className="md:col-span-5 flex flex-col gap-6 h-[600px] md:h-[600px]">
              {secondaryItems.length > 0 ? (
                secondaryItems.map((item) => {
                  const itemCat = item.categorias?.[0]?.nombre || "";
                  const itemColor = CATEGORIA_CONFIG[itemCat]?.color ?? "#64748b";
                  return (
                    <div
                      key={item.id}
                      className="relative rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-0"
                    >
                      <img
                        src={item.galeria?.[0]?.url ?? ""}
                        className="w-full h-full object-cover transition-all duration-700"
                        alt={item.galeria?.[0]?.alternativeText ?? item.nombre}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 transition-opacity opacity-40 group-hover:opacity-80" />
                      <div className="absolute inset-0 flex flex-col justify-end p-10">
                        <div
                          className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-2"
                          style={{ backgroundColor: itemColor }}
                        >
                          {itemCat}
                        </div>
                        <h3 className="text-white text-2xl font-black mb-2">
                          {item.nombre}
                        </h3>
                        <a
                          href={item.direccion_google_maps || "#destinos"}
                          target={item.direccion_google_maps ? "_blank" : undefined}
                          rel={item.direccion_google_maps ? "noopener noreferrer" : undefined}
                          className="text-white/80 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all z-10 relative"
                        >
                          {t.impSeeMore}
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
                    const itemCat = item.categorias?.[0]?.nombre || "";
                    const itemColor = CATEGORIA_CONFIG[itemCat]?.color ?? "#64748b";
                    return (
                      <div
                        key={item.id}
                        className="relative rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-0"
                      >
                        <img
                          src={item.galeria?.[0]?.url ?? ""}
                          className="w-full h-full object-cover transition-all duration-700"
                          alt={item.galeria?.[0]?.alternativeText ?? item.nombre}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 transition-opacity opacity-40 group-hover:opacity-80" />
                        <div className="absolute inset-0 flex flex-col justify-end p-10">
                          <div
                            className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-2"
                            style={{ backgroundColor: itemColor }}
                          >
                            {itemCat}
                          </div>
                          <h3 className="text-white text-2xl font-black mb-2">
                            {item.nombre}
                          </h3>
                          <a
                            href={item.direccion_google_maps || "#destinos"}
                            target={item.direccion_google_maps ? "_blank" : undefined}
                            rel={item.direccion_google_maps ? "noopener noreferrer" : undefined}
                            className="text-white/80 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all z-10 relative"
                          >
                            {t.impSeeMore}
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

        {/* ── Mapa Oficial de Google Maps y Tarjeta de Detalles ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          <div className="lg:col-span-2">
            <ImperdiblesMap 
              markers={markers} 
              activeMarkerId={activeMarkerId}
              onMarkerClick={setActiveMarkerId}
            />
          </div>
          <div className="lg:col-span-1 h-[450px]">
            <DestinoInfoCard 
              destino={activeMarkerItem} 
              color={activeMarkerColor} 
              onPrev={handlePrev}
              onNext={handleNext}
              hasPrev={filtered.length > 1}
              hasNext={filtered.length > 1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
