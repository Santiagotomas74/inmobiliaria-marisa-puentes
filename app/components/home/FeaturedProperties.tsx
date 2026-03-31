"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Bath, RulerDimensionLine, MapPinHouse } from 'lucide-react';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const router = useRouter();

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
            className="hidden md:flex items-center gap-2 bg-black/80 border px-5 py-2 rounded-full shadow hover:shadow-md transition text-white"
          >
            Ver todas las propiedades →
          </a>
        </div>

        {/* 🏠 GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {properties.map((prop) => (
            <div
  key={prop.id}
  onClick={() => router.push(`/propiedades/${prop.id}`)}
  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group cursor-pointer"
>
              {/* 🖼 IMAGEN */}
              <div className="relative">
                 {/* 🖼 IMAGEN / 🎥 VIDEO */}
  {prop.main_image?.match(/\.(mp4|webm|ogg)$/i) ? (
    <div className="relative">
      <video
  src={prop.main_image}
  muted
  autoPlay
  loop
  playsInline
  poster="/video-preview.jpg"
  className="w-full h-60 object-cover"
/>

      {/* 🎥 Badge */}
      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
        Video
      </span>
    </div>
  ) : (
    <img
      src={prop.main_image || "/no-image.jpg"}
      className="w-full h-60 object-cover"
    />
  )}

              <span
  className={`absolute top-3 left-3 text-xs px-3 py-1 rounded-full shadow text-white
    ${
      prop.operation === "venta"
        ? "bg-orange-400"
        : prop.operation === "alquiler"
        ? "bg-green-600"
        : "bg-gray-500"
    }
  `}
>
  {prop.operation?.toUpperCase()}
</span>

                {/* 💰 PRECIO */}
<span className="absolute bottom-3 left-3 bg-black text-white font-bold text-sm px-3 py-1 rounded-lg shadow">
  {prop.price
    ? prop.operation === "alquiler"
      ? `U$S ${prop.price.toLocaleString()}/mes`
      : `U$S ${prop.price.toLocaleString()}`
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

                 {/* 📍 UBICACIÓN */}
                   <MapPinHouse className="absolute text-black mt-1" size={18} />
                  <p className="text-gray-500 text-sm mt-1 ml-6">
                    {prop.address}, {prop.city}, {prop.province}
                  </p>

                                 {/* 🏠 FEATURES */}
<div className="mt-2 border-t  border-gray-200 py-3">

  <div className="flex items-center justify-between  rounded-2xl ">

    {/* 🛏 Dormitorios */}
    <div className="flex flex-col items-center flex-1">
      <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
      <BedDouble />
      </div>
      <p className="font-bold text-lg text-gray-800">
        {prop.bedrooms || 0}
      </p>
      <p className="text-sm text-gray-500">Dorm</p>
    </div>

    <div className="h-10 w-px bg-gray-200" />

    {/* 🛁 Baños */}
    <div className="flex flex-col items-center flex-1">
      <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
        <Bath />
      </div>
      <p className="font-bold text-lg text-gray-800">
        {prop.bathrooms || 0}
      </p>
      <p className="text-sm text-gray-500">Baños</p>
    </div>

    <div className="h-10 w-px bg-gray-200" />

    {/* 📐 Superficie */}
    <div className="flex flex-col items-center flex-1">
      <div className="bg-blue-600 text-white p-3 rounded-full mb-2">
        <RulerDimensionLine />
      </div>
      <p className="font-bold text-lg text-gray-800">
        {prop.surface_total || 0}
      </p>
      <p className="text-sm text-gray-500">m²</p>
    </div>

  </div>
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