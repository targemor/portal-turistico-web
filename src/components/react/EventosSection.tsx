import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage, LanguageProvider } from "../../i18n/LanguageContext";

interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  dia: number;
  mes: string;
  mes_corto: string;
  dia_semana: string;
  ubicacion: string;
  horario: string;
  imagen: string;
  url_info: string | null;
  categoria: string;
}

interface Props {
  eventos: Evento[];
}

interface ModalImage {
  url: string;
  title: string;
  categoria: string;
  color: string;
}

/* ── Colores por categoría ─────────────────────── */
const CAT_COLOR: Record<string, string> = {
  Feria: "#C8860A",
  Gastronomía: "#9B2335",
  Cultura: "#7D287E",
  Naturaleza: "#82BC00",
  Música: "#1D3A6B",
  Deporte: "#EF4444",
};

function getCatColor(cat: string) {
  return CAT_COLOR[cat] ?? "#C8860A";
}

export default function EventosSection({ eventos }: Props) {
  return (
    <LanguageProvider>
      <EventosSectionInner eventos={eventos} />
    </LanguageProvider>
  );
}

function EventosSectionInner({ eventos }: Props) {
  const [selectedImage, setSelectedImage] = useState<ModalImage | null>(null);

  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  return (
    <section id="eventos" className="py-20 bg-white border-y border-slate-100">
      {/* Contenedor al 90% del width */}
      <div className="w-[90%] max-w-[1500px] mx-auto px-2 sm:px-4">

        {/* ── Header con Kicker y Título ── */}
        <div className="flex flex-col items-center mb-14 text-center">
          <p className="text-brand font-bold text-xs sm:text-sm uppercase tracking-[0.3em] mb-2">
            CARTELERA Y FESTIVIDADES
          </p>
          <div className="flex items-center gap-4 w-full max-w-xs sm:max-w-sm mb-1">
            <div className="flex-1 h-[2px] bg-slate-200" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
              Eventos
            </h2>
            <div className="flex-1 h-[2px] bg-slate-200" />
          </div>
        </div>

        {/* ── Lista de eventos ── */}
        <div className="flex flex-col divide-y divide-slate-200">
          {eventos.map((evento) => {
            const color = getCatColor(evento.categoria);

            return (
              <article
                key={evento.id}
                className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center group"
              >
                {/* ── LADO IZQUIERDO: Fecha, Nombre, Ubicación y Horario ── */}
                <div className="lg:col-span-5 flex items-start gap-4 sm:gap-6">
                  {/* Bloque de fecha */}
                  <div
                    className="flex-shrink-0 w-[80px] sm:w-[92px] rounded-2xl overflow-hidden shadow-md flex flex-col items-center justify-between transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  >
                    <div className="pt-3 pb-1 flex flex-col items-center">
                      <span className="text-3xl sm:text-4xl font-black text-white leading-none tracking-tight">
                        {evento.dia}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-white/95 uppercase tracking-widest mt-1">
                        {evento.mes_corto}
                      </span>
                    </div>
                    <div className="w-full bg-black/25 py-1.5 px-1 text-center">
                      <span className="block text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider">
                        {evento.dia_semana}
                      </span>
                    </div>
                  </div>

                  {/* Nombre, categoría, ubicación y horario */}
                  <div className="flex-1 min-w-0 pt-1">
                    <span
                      className="inline-flex w-fit text-[10px] sm:text-xs font-black uppercase tracking-widest text-white px-3 py-1 rounded-full mb-2.5 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {evento.categoria}
                    </span>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-slate-700 transition-colors mb-3">
                      {evento.titulo}
                    </h3>

                    {/* Metadatos: Ubicación y Horario */}
                    <div className="flex flex-col gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 flex-shrink-0 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{evento.ubicacion}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 flex-shrink-0 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{evento.horario}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── LADO DERECHO: Imagen en grande con click para abrir modal + Descripción en el footer ── */}
                <div className="lg:col-span-7">
                  <div
                    onClick={() =>
                      setSelectedImage({
                        url: evento.imagen,
                        title: evento.titulo,
                        categoria: evento.categoria,
                        color,
                      })
                    }
                    className="relative h-[280px] sm:h-[320px] md:h-[340px] w-full rounded-2xl overflow-hidden shadow-xl group/card bg-slate-900 cursor-pointer"
                    title="Click para ver imagen en tamaño completo"
                  >
                    {/* Imagen grande */}
                    <img
                      src={evento.imagen}
                      alt={evento.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Botón flotante para ver en tamaño completo al hover */}
                    <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-1 group-hover/card:translate-y-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                        Ver imagen completa
                      </span>
                    </div>

                    {/* Gradient Overlay permanente para legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

                    {/* Footer de la imagen: ÚNICAMENTE la descripción */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 backdrop-blur-[2px] bg-slate-950/25">
                      <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                        {evento.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Modal Lightbox a Pantalla Completa ── */}
      {selectedImage && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          {/* Botón Cerrar */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-colors z-50"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Contenedor de la imagen */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-4 flex items-center gap-3">
              <span
                className="text-xs font-black uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: selectedImage.color }}
              >
                {selectedImage.categoria}
              </span>
              <h4 className="text-white text-base sm:text-xl font-bold uppercase tracking-tight text-center">
                {selectedImage.title}
              </h4>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
