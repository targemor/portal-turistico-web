import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";

/* ─── Estilos para ocultar POIs (funciona sin mapId) ─── */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi",            elementType: "all",      stylers: [{ visibility: "off" }] },
  { featureType: "poi.park",       elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#d4edda" }] },
  { featureType: "transit",        elementType: "all",      stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "labels",   stylers: [{ visibility: "simplified" }] },
];

/* ─── SVG pin personalizado ─── */
function makePinIcon(color: string): google.maps.Icon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    // Plain objects funcionan en runtime; sin constructores para evitar errores SSR
    scaledSize: { width: 32, height: 44 } as unknown as google.maps.Size,
    anchor:     { x: 16, y: 44 }         as unknown as google.maps.Point,
  };
}

/* ─── Tipos ─── */
export interface MarkerData {
  id: string | number;
  title: string;
  position: { lat: number; lng: number };
  color: string;
  googleMapsInfo?: {
    rating?: number;
    userRatingsTotal?: number;
    formattedAddress?: string;
  };
}

interface Props {
  markers: MarkerData[];
  activeMarkerId: string | number | null;
  onMarkerClick: (id: string | number | null) => void;
}

function MapUpdater({ markers, activeMarkerId }: { markers: MarkerData[], activeMarkerId: string | number | null }) {
  const map = useMap();
  const prevFirstMarkerId = React.useRef<string | number | null>(null);

  useEffect(() => {
    if (!map || markers.length === 0) return;

    const firstMarkerId = markers[0]?.id ?? null;
    const isCategoryChange = firstMarkerId !== prevFirstMarkerId.current;
    prevFirstMarkerId.current = firstMarkerId;

    if (isCategoryChange || !activeMarkerId) {
      // Al cambiar categoría o si no hay ninguno activo, ajustar bounds para ver todos
      if (markers.length === 1) {
        map.panTo(markers[0].position);
        map.setZoom(13); // Zoom adecuado para un solo marcador
      } else {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.position));
        map.fitBounds(bounds, 50); // 50px de padding
      }
    } else if (activeMarkerId && !isCategoryChange) {
      // Si el usuario hizo clic manualmente en un marcador dentro de la misma categoría
      const targetMarker = markers.find(m => m.id === activeMarkerId);
      if (targetMarker) {
        map.panTo(targetMarker.position);
        map.setZoom(14);
      }
    }
  }, [map, markers, activeMarkerId]);

  return null;
}

/* ─── Componente ─── */
export default function ImperdiblesMap({ markers, activeMarkerId, onMarkerClick }: Props) {
  const activeMarker = markers.find((m) => m.id === activeMarkerId) ?? null;

  return (
    <div className="rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 relative group h-[450px]">
      <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-black/10 z-10" />
      <APIProvider apiKey={import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={{ lat: 18.43, lng: -97.44 }}
          defaultZoom={11}
          gestureHandling="greedy"
          draggable={false}
          disableDefaultUI={true}
          zoomControl={true}
          keyboardShortcuts={false}
          /* Sin mapId → styles funciona correctamente */
          styles={MAP_STYLES}
          restriction={{
            latLngBounds: { north: 18.65, south: 18.20, east: -97.25, west: -97.65 },
            strictBounds: true,
          }}
          className="w-full h-full grayscale-[20%] contrast-125 transition-all duration-700 group-hover:grayscale-0"
        >
          <MapUpdater markers={markers} activeMarkerId={activeMarkerId} />

          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={makePinIcon(marker.color)}
              onClick={() => onMarkerClick(activeMarkerId === marker.id ? (markers[0]?.id || null) : marker.id)}
            />
          ))}

          {activeMarker && (
            <InfoWindow
              position={activeMarker.position}
              onCloseClick={() => onMarkerClick(markers[0]?.id || null)}
              pixelOffset={[0, -48]}
              headerContent={
                <h3 style={{ fontWeight: 900, fontSize: 14, margin: 0, color: activeMarker.color, paddingRight: '12px' }}>
                  {activeMarker.title}
                </h3>
              }
            >
              <div className="flex flex-col max-w-[200px] pt-1">
                {activeMarker.googleMapsInfo?.rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <span className="text-yellow-500 text-sm">★</span>
                    {activeMarker.googleMapsInfo.rating} 
                    <span className="text-slate-400 font-normal">
                      ({activeMarker.googleMapsInfo.userRatingsTotal ?? 0})
                    </span>
                  </div>
                )}
                {activeMarker.googleMapsInfo?.formattedAddress && (
                  <p className="mt-2 text-[11px] leading-snug text-slate-500 font-medium">
                    {activeMarker.googleMapsInfo.formattedAddress}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
