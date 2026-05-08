import { useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

import type { Galeria } from "../../types";

interface ImageGalleryProps {
  galeria: Galeria[] | Galeria | null;
  fallbackName?: string;
}

export default function ImageGallery({ galeria, fallbackName = "Imagen" }: ImageGalleryProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!galeria) return null;

  // Normalizar a un arreglo siempre
  const images = Array.isArray(galeria) ? galeria : [galeria];

  if (images.length === 0) return null;

  return (
    <>
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation={images.length > 1}
        loop={images.length > 1}
        className="w-full h-full"
        style={{
          "--swiper-theme-color": "var(--color-brand)",
          "--swiper-navigation-size": "24px"
        } as React.CSSProperties}
      >
        {images.map((img, index) => {
          // Aseguramos que la URL empiece con slash si es una ruta local que no la tiene
          const imgUrl = img.url.startsWith("http") || img.url.startsWith("/") ? img.url : `/${img.url}`;
          return (
            <SwiperSlide key={img.id ?? index}>
              <img
                src={imgUrl}
                alt={img.alternativeText ?? fallbackName}
                onClick={() => setExpandedImage(imgUrl)}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105 duration-500"
                loading="lazy"
                decoding="async"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Lightbox / Modal a pantalla completa */}
      {expandedImage && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:p-12 backdrop-blur-sm transition-opacity"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-5xl font-light leading-none"
            onClick={() => setExpandedImage(null)}
            aria-label="Cerrar imagen"
          >
            &times;
          </button>
          <img 
            src={expandedImage} 
            alt="Imagen ampliada" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" 
          />
        </div>,
        document.body
      )}
    </>
  );
}
