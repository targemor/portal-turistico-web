import React from "react";

const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IconTicket = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><line x1="13" x2="13" y1="5" y2="19" /><line x1="17" x2="17" y1="9" y2="15" /></svg>;
const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
const IconInfo = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>;
const IconPaw = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" /><path d="M9 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M15 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M19 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /><path d="M9 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" /></svg>;
const IconChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const IconChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

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
                  <IconClock /> Horarios
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.horarios}</p>
              </div>
            )}
            {destino.precio && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <IconTicket /> Precio
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.precio}</p>
              </div>
            )}
            {destino.duracion_recomendada && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <IconClock /> Duración
                </div>
                <p className="text-sm font-medium text-slate-700">{destino.duracion_recomendada}</p>
              </div>
            )}
          </div>

          {/* Como Llegar */}
          {destino.como_llegar && (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                <IconMapPin /> Cómo llegar
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{destino.como_llegar}</p>
            </div>
          )}

          {/* Tips y Recomendaciones */}
          {(destino.tips_imperdibles || destino.recomendaciones) && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div style={{ color }}>
                  <IconInfo />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Tips del viajero</h4>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                {destino.tips_imperdibles && (
                  <p><strong>Lo imperdible:</strong> {destino.tips_imperdibles}</p>
                )}
                {destino.recomendaciones && (
                  <p><strong>Recomendación:</strong> {destino.recomendaciones}</p>
                )}
              </div>
            </div>
          )}

          {/* Badges */}
          {destino.es_pet_friendly && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
              <IconPaw /> Pet Friendly
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
            <IconChevronLeft /> Anterior
          </button>
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-white text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: color }}
          >
            Siguiente <IconChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
