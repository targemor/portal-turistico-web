import { useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
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
}

interface Props {
  markers: MarkerData[];
}

/* ─── Componente ─── */
export default function ImperdiblesMap({ markers }: Props) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null);
  const activeMarker = markers.find((m) => m.id === activeMarkerId) ?? null;

  return (
    <div className="mt-16 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 relative group h-[450px]">
      <div className="absolute inset-0 pointer-events-none rounded-[2rem] ring-1 ring-inset ring-black/10 z-10" />
      <APIProvider apiKey={import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={{ lat: 18.42, lng: -97.43 }}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={true}
          zoomControl={true}
          keyboardShortcuts={false}
          /* Sin mapId → styles funciona correctamente */
          styles={MAP_STYLES}
          restriction={{
            latLngBounds: { north: 18.65, south: 18.25, east: -97.25, west: -97.60 },
            strictBounds: true,
          }}
          className="w-full h-full grayscale-[20%] contrast-125 transition-all duration-700 group-hover:grayscale-0"
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={makePinIcon(marker.color)}
              onClick={() =>
                setActiveMarkerId((prev) => (prev === marker.id ? null : marker.id))
              }
            />
          ))}

          {activeMarker && (
            <InfoWindow
              position={activeMarker.position}
              onCloseClick={() => setActiveMarkerId(null)}
              pixelOffset={[0, -48]}
            >
              <p style={{ fontWeight: 900, fontSize: 13, margin: 0, color: activeMarker.color }}>
                {activeMarker.title}
              </p>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
