"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";

export default function Hero() {
  const router = useRouter();

  const [operation, setOperation] = useState("venta");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (operation) params.append("operation", operation);
    if (city) params.append("city", city);
    if (type) params.append("type", type);
    if (price) params.append("maxPrice", price);

    router.push(`/propiedades?${params.toString()}`);
  };

  return (
    <section className="relative h-[85vh] flex items-center">

      {/* 🖼 BACKGROUND */}
      <img
        src="https://images.unsplash.com/photo-1706808849827-7366c098b317?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MDEwOTU0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* CONTENIDO */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col justify-end h-full pb-10">

        {/* 📝 TEXTO */}
        <div className="max-w-2xl">
          <span className="bg-white/10 text-white  px-3 py-1 rounded-full">
            +50 propiedades disponibles
          </span>

          <h1 className="text-5xl font-bold text-white mt-4 leading-tight">
            Encuentra el <br />
            <span className="text-blue-400">lugar perfecto</span>
          </h1>

          <p className="bg-black/40 text-white text-sm px-4 py-2 rounded-full  mt-4">
            Descubre espacios diseñados para tu estilo de vida.
            Compra, vende o alquila con la mejor experiencia.
          </p>

          <div className="flex gap-4 mt-6">
            <a
              href="/propiedades"
              className="bg-white text-black px-6 py-3 rounded-full font-medium"
            >
              Ver propiedades
            </a>

            <a
              href="/contacto"
              className="border border-white bg-black/40 text-white px-6 py-3 rounded-full"
            >
              Contáctanos
            </a>
          </div>
        </div>

        {/* 🔍 BARRA BUSCADORA */}
        <div className="mt-15 bg-white/30 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 max-w-9xl">

          {/* 🏷 TABS */}
          <div className="flex gap-4 mb-4 flex-wrap">
            {["venta", "alquiler", "tasar"].map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  operation === op
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </button>
            ))}
          </div>

          {/* 🧠 CONTENIDO */}
          {operation !== "tasar" ? (
            <div className="flex flex-col md:flex-row gap-3">

              {/* 📍 UBICACIÓN */}
              <input
                placeholder="¿Dónde querés buscar?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-white flex-1 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />

              {/* 🏠 TIPO */}
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
              >
                <option value="">Tipo</option>
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="terreno">Terreno</option>
              </select>

              {/* 💰 PRECIO */}
              <input
                type="number"
                placeholder="Precio máx USD"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />

              {/* 🔍 BOTÓN */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                <Search size={18} />
                Buscar
              </button>
            </div>
          ) : (
            <div className="text-center py-6 bg-white rounded-2xl">

              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                  <TrendingUp size={28} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¿Querés tasar tu propiedad?
              </h3>

              <p className="text-gray-500 text-sm mb-6">
                Te ayudamos a tasarla y venderla al mejor precio del mercado.
              </p>

              <a
                href="/tasaciones"
                className="inline-block bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
              >
                Solicitar tasación
              </a>

              <div className="mt-4 text-xs text-gray-400">
                ✔ Tasación profesional · ✔ Publicación destacada · ✔ Asesoramiento
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}