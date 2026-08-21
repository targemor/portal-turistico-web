import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

import { Clock, Ticket, MapPin, Info, PawPrint, ChevronLeft, ChevronRight } from "lucide-react";

export default function DestinoInfoCard({
  destino,
  color,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  destino: any;
  color: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  const { t } = useLanguage();
  if (!destino) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 h-full flex flex-col relative overflow-hidden transition-all duration-300">
      {/* Top decoration */}
      <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: color }} />

      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-2xl font-black mb-4 pr-4 text-slate-800 leading-tight">
          {destino.nombre}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">

          {/* Información clave */}
          <div className="grid grid-cols-2 gap-4">
            {destino.horarios && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> {t.infoHorarios}
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.horarios}</p>
              </div>
            )}
            {destino.precio && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Ticket className="w-3.5 h-3.5" /> {t.infoPrecio}
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.precio}</p>
              </div>
            )}
            {destino.duracion_recomendada && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> {t.infoDuracion}
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.duracion_recomendada}</p>
              </div>
            )}
          </div>

          {/* Como Llegar */}
          {destino.como_llegar && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" /> {t.infoComoLlegar}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{destino.como_llegar}</p>
            </div>
          )}

          {/* Tips y Recomendaciones */}
          {(destino.tips_imperdibles || destino.recomendaciones) && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div style={{ color }}>
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{t.infoTips}</h4>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                {destino.tips_imperdibles && (
                  <p><strong>{t.infoMustSee}</strong> {destino.tips_imperdibles}</p>
                )}
                {destino.recomendaciones && (
                  <p><strong>{t.infoRecomendacion}</strong> {destino.recomendaciones}</p>
                )}
              </div>
            </div>
          )}

          {/* Badges */}
          {destino.es_pet_friendly && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
              <PawPrint className="w-3.5 h-3.5" /> {t.infoPetFriendly}
            </div>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      {(hasPrev || hasNext) && (
        <div className="mt-4 pt-4 border-t border-slate-100 shrink-0 flex gap-4">
          <button
            onClick={onPrev}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all border hover:bg-slate-50 text-slate-600 border-slate-200"
          >
            <ChevronLeft className="w-4 h-4" /> {t.infoPrev}
          </button>
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-white text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: color }}
          >
            {t.infoNext} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
