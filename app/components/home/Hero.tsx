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
    <section className="relative h-[80vh] flex items-center">

      {/* 🖼 BACKGROUND */}
      <img
        src="https://i.pinimg.com/736x/4b/ca/ef/4bcaef5bf1cb1cfc2166a40fad177781.jpg" // 👉 poné una buena imagen de casa moderna
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* CONTENIDO */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-10 items-center">

        {/* 📝 TEXTO */}
        <div>
          <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
            +500 propiedades disponibles
          </span>

          <h1 className="text-5xl font-bold text-white mt-4 leading-tight">
            Encuentra el <br />
            <span className="text-blue-400">lugar perfecto</span>
          </h1>

          <p className="text-gray-300 mt-4 max-w-md">
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

            <button className="border border-white text-white px-6 py-3 rounded-full">
                  <a
              href="/contacto">
              Contáctanos
               </a>
            </button>
          </div>
        </div>

{/* 🔍 CARD BUSCADOR */}
<div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
<div className="bg-white rounded-3xl p-3" >
 {/* 🏷 TABS */} <div className="flex gap-2 mb-4 text-black">
   {["venta", "alquiler", "vender"].map((op) => ( 
    <button key={op} onClick={() => setOperation(op)}
     className={`flex-1 py-2 rounded-lg text-sm font-medium ${operation === op ? "bg-black text-white" : "bg-gray-200 hover:bg-gray-300"}`} > 
      {op.charAt(0).toUpperCase() + op.slice(1)}
       </button> ))} 
       </div>

  {/* 🧠 CONTENIDO DINÁMICO */}
  {operation !== "vender" ? (
    <>
      {/* 📍 UBICACIÓN */}
      <input
        placeholder="📍 ¿Dónde querés buscar?"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
      />

      {/* FILA */}
      <div className="grid grid-cols-2 gap-3 mb-4">

        {/* 🏠 TIPO */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
        >
          <option value="">Tipo</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="terreno">Terreno</option>
        </select>

        {/* 💰 PRECIO */}
        <input
          type="number"
          placeholder="💰 Precio máx"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black"
        />
      </div>

      {/* 🔍 BOTÓN */}
      <button
        onClick={handleSearch}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
      >
        <Search size={18} />
        Buscar Propiedades
      </button>
    </>
  ) : (
    <>
      {/* 🏡 VENDER */}
      <div className="text-center py-4">

        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
            <TrendingUp size={28} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          ¿Querés vender tu propiedad?
        </h3>

        <p className="text-gray-500 text-sm mb-6">
          Te ayudamos a tasarla y venderla al mejor precio del mercado.
        </p>

        {/* CTA */}
        <a
          href="/tasaciones"
          className="w-full block bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Solicitar tasación
        </a>

        {/* EXTRA INFO */}
        <div className="mt-6 text-xs text-gray-400">
          ✔ Tasación profesional  
          ✔ Publicación destacada  
          ✔ Asesoramiento completo  
        </div>

      </div>
    </>
  )}
</div>
</div>
      </div>
    </section>
  );
}