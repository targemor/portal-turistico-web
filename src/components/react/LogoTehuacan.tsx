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

/** Retardo entre una letra y la siguiente */
const STAGGER_MS = 55;
const FADE_MS = 320;

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
  baseColor = "#FFFFFF",
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
        /* una sola sombra para todo el conjunto, no una por capa */
        filter: isScrolled
          ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.18))"
          : "drop-shadow(0px 2px 8px rgba(0,0,0,0.85)) drop-shadow(0px 0px 3px rgba(0,0,0,0.9))",
        transition: "filter 400ms ease",
      }}
      aria-label="Yo Soy De Tehuacán"
      role="img"
    >
      {/* Estado inicial: la silueta completa en un solo color */}
      <div
        className="absolute inset-0"
        style={{
          ...maskOf("/logo_fill.png"),
          background: baseColor,
          opacity: isScrolled ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
          transitionDelay: isScrolled ? `${LETTERS.length * STAGGER_MS}ms` : "0ms",
        }}
      />

      {/* Cada letra con su color, revelada en cascada */}
      {LETTERS.map((letter, i) => (
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
            transition: `opacity ${FADE_MS}ms ease`,
            /* de izquierda a derecha al colorearse, al reves al volver arriba */
            transitionDelay: `${(isScrolled ? i : LETTERS.length - 1 - i) * STAGGER_MS}ms`,
          }}
        />
      ))}

      {/* Detalle interior sobre el relleno. Es el line art recortado a la
          silueta, no logo_bn.svg entero, para que las contraformas queden
          limpias: si no, el dibujo de la gota aparece dentro del hueco de la a. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ...maskOf("/logo_detail.png"),
          background: `rgba(0,0,0,${detailOpacity})`,
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
