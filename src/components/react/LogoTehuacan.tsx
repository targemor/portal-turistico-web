import React from "react";
import logoLetters from "../../data/logo-letters.json";

interface LogoTehuacanProps {
  className?: string;
  isScrolled?: boolean;
  /** Color unico de las letras antes del scroll */
  baseColor?: string;
  /** Opacidad del line art que dibuja los detalles interiores */
  detailOpacity?: number;
}

/**
 * Capas generadas por scripts/build-logo-layers.mjs: una por letra, ya
 * coloreada y recortada, con su posicion en % sobre el viewBox del logo.
 */
const LETTERS = logoLetters.letters;

/** Keys de las letras que forman "YO SOY DE" */
const YO_SOY_DE_KEYS = ["Y1", "O1", "S", "O2", "Y2", "D", "E"];

/** Solo las letras de "Tehuacán" para la silueta inicial en rosa */
const TEHUACAN_LETTERS = LETTERS.filter((l) => !YO_SOY_DE_KEYS.includes(l.key));

/** Retardo entre una letra y la siguiente (+30% más rápido) */
const STAGGER_MS = 38;
const FADE_MS = 224;

/**
 * El logo arranca macizo en un solo color y al hacer scroll cada letra toma su
 * color en cascada de izquierda a derecha.
 *
 * public/logo_bn.svg solo trae los contornos del dibujo, asi que el relleno no
 * sale de ahi: las siluetas macizas y las letras sueltas las genera
 * scripts/build-logo-layers.mjs. El SVG se sigue usando encima, como capa de
 * detalle, para conservar las grecas, el cactus, la cruz y las ruinas.
 */
export default function LogoTehuacan({
  className = "h-14 md:h-16 w-auto",
  isScrolled = false,
  baseColor = "var(--color-mex-rojo, #C82E31)",
  detailOpacity = 0.45,
}: LogoTehuacanProps) {
  const maskOf = (url: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${url})`,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
    maskImage: `url(${url})`,
    maskRepeat: "no-repeat",
    maskSize: "100% 100%",
  });

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        aspectRatio: "2936 / 1440",
        filter: "none",
      }}
      aria-label="Yo Soy De Tehuacán"
      role="img"
    >
      {/* Estado inicial (sin scroll): letras de "Tehuacán" en baseColor uniforme.
          - Todas salvo "e": maskOf + background → color exacto (counter transparente ✓)
          - "e": <img> + CSS filter → convierte dorado → rojo, counter queda claro (visible) */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isScrolled ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: isScrolled ? `${LETTERS.length * STAGGER_MS}ms` : "0ms",
        }}
      >
        {TEHUACAN_LETTERS.map((letter) => {
          if (letter.key === "e") {
            // Conversión directa de dorado → rojo via CSS filter:
            // hue-rotate(315°) lleva el hue de 43° (dorado) a 358° (rojo)
            // saturate(0.94) ajusta la saturación de 67% → 63%
            // brightness(0.87) reduce la luminosidad de 55% → ~48% (rojo exacto)
            // Los pixels blancos del counter se vuelven gris claro (~222,222,222) → visible ✓
            return (
              <img
                key={`base-${letter.key}`}
                src={letter.src}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute"
                style={{
                  left: `${letter.left}%`,
                  top: `${letter.top}%`,
                  width: `${letter.width}%`,
                  height: `${letter.height}%`,
                  /* Convierte dorado → rojo #C82E31:
                     hue-rotate(318deg) gira H=39° (dorado) a H≈357° (rojo)
                     saturate(2.5)     ajusta saturación
                     brightness(0.76)  ajusta luminosidad exacta */
                  filter: "hue-rotate(318deg) saturate(2.5) brightness(0.76)",
                }}
              />
            );
          }
          return (
            <div
              key={`base-${letter.key}`}
              className="absolute"
              style={{
                left: `${letter.left}%`,
                top: `${letter.top}%`,
                width: `${letter.width}%`,
                height: `${letter.height}%`,
                ...maskOf(letter.src),
                background: baseColor,
              }}
            />
          );
        })}
      </div>

      {/* Cada letra con su color original, revelada en cascada al hacer scroll ("YO SOY DE" aparece aquí) */}
      {LETTERS.map((letter, i) => {
        const isYoSoyDe = YO_SOY_DE_KEYS.includes(letter.key);
        return (
          <img
            key={letter.key}
            src={letter.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute logo-letter"
            style={{
              left: `${letter.left}%`,
              top: `${letter.top}%`,
              width: `${letter.width}%`,
              height: `${letter.height}%`,
              opacity: isScrolled ? 1 : 0,
              transform: !isScrolled && isYoSoyDe ? "translateY(-6px)" : "translateY(0)",
              transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
              /* de izquierda a derecha al colorearse, al reves al volver arriba */
              transitionDelay: `${(isScrolled ? i : LETTERS.length - 1 - i) * STAGGER_MS}ms`,
            }}
          />
        );
      })}

      {/* Detalle interior de line-art — solo visible cuando el logo está en color completo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...maskOf("/logo_detail.png"),
          background: `rgba(0,0,0,${detailOpacity})`,
          opacity: isScrolled ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: isScrolled ? `0ms` : `${LETTERS.length * STAGGER_MS}ms`,
        }}
      />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .logo-letter { transition-duration: 1ms !important; transition-delay: 0ms !important; }
        }
      `}</style>
    </div>
  );
}
