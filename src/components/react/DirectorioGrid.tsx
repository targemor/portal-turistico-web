import { useEffect, useRef, useState } from "react";
import Card, { type CardItem } from "./Card";

interface Props {
  items: CardItem[];
  categoria: string;
}

export default function DirectorioGrid({ items, categoria }: Props) {
  const [highlightId, setHighlightId] = useState<string | number | null>(null);
  const [sortedItems, setSortedItems] = useState<CardItem[]>(items);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawId = params.get("id");
    if (!rawId) return;

    // Intentar match por id (número o string)
    const matched = items.find(
      (item) => String(item.id) === rawId
    );
    if (!matched) return;

    // Poner el item destacado primero
    const rest = items.filter((item) => String(item.id) !== rawId);
    setSortedItems([matched, ...rest]);
    setHighlightId(matched.id);

    // Scroll suave al card destacado después de render
    const timer = setTimeout(() => {
      highlightRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [items]);

  return (
    <>
      {/* Estilos de highlight */}
      <style>{`
        @keyframes highlightPulse {
          0%   { box-shadow: 0 0 0 0 rgba(130, 188, 0, 0.6), 0 0 0 0 rgba(130, 188, 0, 0.3); }
          40%  { box-shadow: 0 0 0 14px rgba(130, 188, 0, 0.2), 0 0 48px 10px rgba(130, 188, 0, 0.12); }
          100% { box-shadow: 0 0 0 0 rgba(130, 188, 0, 0), 0 0 0 0 rgba(130, 188, 0, 0); }
        }
        .card-highlight {
          animation: highlightPulse 2.2s ease-out 0.4s forwards;
          border: 2px solid rgba(130, 188, 0, 0.35) !important;
          border-radius: 0.75rem;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedItems.map((item) => {
          const isHighlighted = highlightId !== null && String(item.id) === String(highlightId);
          return (
            <div
              key={item.id}
              ref={isHighlighted ? highlightRef : null}
              className={isHighlighted ? "card-highlight" : ""}
            >
              <Card item={item} categoria={categoria} />
            </div>
          );
        })}
      </div>
    </>
  );
}
