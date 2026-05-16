import { useState } from "react";
import LeafIcon from "../../assets/icons/LeafIcon";
import UtensilsIcon from "../../assets/icons/UtensilsIcon";
import CultureIcon from "../../assets/icons/CultureIcon";
import DropletIcon from "../../assets/icons/DropletIcon";
import ArrowRightIcon from "../../assets/icons/ArrowRightIcon";

const colors = {
  Naturaleza: "#82BC00",
  Sabor:      "#F39200",
  Historia:   "#7D287E",
  Wellness:   "#009BA4",
};

const categories = [
  { id: "Naturaleza", label: "Biosfera",    icon: <LeafIcon className="w-4 h-4" /> },
  { id: "Sabor",      label: "Gastronomía", icon: <UtensilsIcon className="w-4 h-4" /> },
  { id: "Historia",   label: "Cultura",     icon: <CultureIcon className="w-4 h-4" /> },
  { id: "Wellness",   label: "Manantiales", icon: <DropletIcon className="w-4 h-4" /> },
];

const discoveryItems = [
  {
    id: 1,
    title: "Reserva de la Biosfera Tehuacán-Cuicatlán",
    description: "Descubre el bosque de cactáceas columnares más grande del mundo, un tesoro natural único.",
    image: "/assets/Biosfera_1.png",
    color: "#82BC00",
    category: "Naturaleza",
  },
  {
    id: 2,
    title: "Museo de la Evolución",
    description: "De los dinosaurios al origen del maíz en un solo lugar.",
    image: "/assets/media_87.webp",
    color: "#7D287E",
    category: "Historia",
  },
  {
    id: 3,
    title: "Matanza Tradicional",
    description: "Vive el sabor único del Mole de Caderas, un pilar culinario de la región poblana.",
    image: "/assets/mole.jpg",
    color: "#F39200",
    category: "Sabor",
  },
];

export default function ExploraSection() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  
  return (
    <section className="py-24 bg-white border-y border-slate-100">
      <div className="container mx-auto px-6">
        {/* Header + Tabs */}
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-4xl font-black tracking-tighter mb-8 uppercase">Descubre por Categoría</h2>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtro de categorías">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const catColor = colors[cat.id as keyof typeof colors];

              return (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={isActive ? { backgroundColor: catColor, borderColor: catColor } : undefined}
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

        {/* Bento grid */}
        <div id="explora-panel" className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large card */}
          <div className="md:col-span-7 relative rounded-[2rem] overflow-hidden group shadow-xl h-[420px] md:h-[600px]">
            <img
              src={discoveryItems[0].image}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt={discoveryItems[0].title}
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-12 left-12 right-12">
              <div
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-4"
                style={{ backgroundColor: discoveryItems[0].color }}
              >
                Destacado
              </div>
              <h3 className="text-white text-4xl font-black mb-4 leading-none tracking-tighter">{discoveryItems[0].title}</h3>
              <p className="text-white/80 max-w-md mb-8 font-medium">{discoveryItems[0].description}</p>
              <a
                href="#destinos"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-white text-xs font-black uppercase hover:opacity-90 transition-opacity"
                style={{ backgroundColor: discoveryItems[0].color }}
              >
                Planear mi Viaje
              </a>
            </div>
          </div>

          {/* Small cards */}
          <div className="md:col-span-5 flex flex-col gap-6 h-[600px] md:h-[600px]">
            {discoveryItems.slice(1).map((item) => (
              <div key={item.id} className="relative rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-0">
                <img
                  src={item.image}
                  className="w-full h-full object-cover transition-all duration-700"
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-slate-950/60 transition-opacity opacity-40 group-hover:opacity-80"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-10">
                  <div
                    className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider mb-2"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.category}
                  </div>
                  <h3 className="text-white text-2xl font-black mb-2">{item.title}</h3>
                  <button className="text-white/80 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Explorar
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

