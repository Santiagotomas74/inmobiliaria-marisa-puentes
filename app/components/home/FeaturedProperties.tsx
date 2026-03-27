"use client";

import { useEffect, useState } from "react";

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const res = await fetch(`/api/properties?featured=true`);
      const data = await res.json();
      setProperties(data);
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* 🏷 HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
           <div className="mb-1 flex items-center gap-4 group">
  <div className="w-12 h-[2px] bg-blue-600 rounded-full transition-all duration-300 group-hover:w-20"></div>

  <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
    Nuestra selección
  </h2>
</div>
            <h2 className="text-4xl font-bold text-gray-900">
              Propiedades{" "}
              <span className="text-blue-600">Destacadas</span>
            </h2>

            <p className="text-gray-500 mt-2 max-w-md">
              Explora las mejores opciones del mercado,
              seleccionadas cuidadosamente por nuestros expertos.
            </p>
          </div>

          <a
            href="/propiedades"
            className="hidden md:flex items-center gap-2 bg-white border px-5 py-2 rounded-full shadow hover:shadow-md transition text-gray-900"
          >
            Ver todas las propiedades →
          </a>
        </div>

        {/* 🏠 GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              {/* 🖼 IMAGEN */}
              <div className="relative">
                <img
                  src={prop.main_image || "/no-image.jpg"}
                  alt={prop.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                />

                {/* 🏷 OPERACIÓN */}
                <span className="absolute top-3 left-3 bg-white text-black text-xs px-3 py-1 rounded-full shadow">
                  {prop.operation?.toUpperCase()}
                </span>

                {/* 💰 PRECIO */}
<span className="absolute bottom-3 left-3 bg-black text-white text-sm px-3 py-1 rounded-lg shadow">
  {prop.price
    ? prop.operation === "alquiler"
      ? `USD $${prop.price.toLocaleString()}/mes`
      : `USD $${prop.price.toLocaleString()}`
    : prop.price_ars
    ? prop.operation === "alquiler"
      ? `ARS $${prop.price_ars.toLocaleString()}/mes`
      : `ARS $${prop.price_ars.toLocaleString()}`
    : "Consultar"}
</span>

                
              </div>

              {/* 📄 INFO */}
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate text-gray-600">
                  {prop.title}
                </h3>

                <p className="text-gray-500 text-sm mt-1 truncate">
                  {prop.address}
                </p>

                {/* 📊 FEATURES */}
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>🛏 {prop.bedrooms || 0}</span>
                  <span>🛁 {prop.bathrooms || 0}</span>
                  <span>📐 {prop.surface_total || 0} m²</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📱 BOTÓN MOBILE */}
        <div className="mt-8 md:hidden text-center">
          <a
            href="/propiedades"
            className="inline-block bg-black text-white px-6 py-3 rounded-full"
          >
            Ver todas las propiedades
          </a>
        </div>
      </div>
    </section>
  );
}