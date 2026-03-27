"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PropertyFilters from "@/app/components/filtro/PropertyFilters";
import { BedDouble, Bath, RulerDimensionLine, MapPinHouse } from 'lucide-react';


export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    operation: "",
    city: "",
    type: "",
    rooms: "",
    minPrice: "",
    maxPrice: "",
    currency: "usd",
  });

  // 📡 Traer propiedades
  useEffect(() => {
    const fetchProperties = async () => {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data);
    };

    fetchProperties();
  }, []);

  // 🔗 LEER QUERY PARAMS (desde Hero)
  useEffect(() => {
    const newFilters = {
      operation: searchParams.get("operation") || "",
      city: searchParams.get("city") || "",
      type: searchParams.get("type") || "",
      rooms: searchParams.get("rooms") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      currency: searchParams.get("currency") || "usd",
    };

    setFilters(newFilters);
  }, [searchParams]);

  // 🔁 ACTUALIZAR URL cuando cambian filtros (PRO)
  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);

    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    router.push(`/propiedades?${params.toString()}`);
  };

  // 🔍 FILTRADO
  const filteredProperties = properties.filter((prop) => {
    if (filters.operation && prop.operation !== filters.operation)
      return false;

    if (
      filters.city &&
      !prop.city?.toLowerCase().includes(filters.city.toLowerCase())
    )
      return false;

    if (filters.type && prop.type !== filters.type)
      return false;

    if (filters.rooms && prop.bedrooms < Number(filters.rooms))
      return false;

    const price =
      filters.currency === "usd" ? prop.price_usd : prop.price_ars;

    if (filters.minPrice && price < Number(filters.minPrice))
      return false;

    if (filters.maxPrice && price > Number(filters.maxPrice))
      return false;

    return true;
  });

return (
  <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] py-12">

    <div className="w-full px-6 lg:px-10">


      {/* 📐 LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">

        {/* 🎛 SIDEBAR FILTROS */}
        <div className="lg:sticky lg:top-24 h-fit">
          <PropertyFilters filters={filters} setFilters={updateFilters} />
        </div>

        {/* 🏠 CONTENIDO */}
        <div>

          {/* 📊 RESULTADOS */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4 text-white">
            <p className="text-gray-300">
              {filteredProperties.length} propiedades encontradas
            </p>
 {/* 📊 RESULTADOS 
            <button
              onClick={() =>
                updateFilters({
                  operation: "",
                  city: "",
                  type: "",
                  rooms: "",
                  minPrice: "",
                  maxPrice: "",
                  currency: "usd",
                })
              }
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Limpiar filtros
            </button>*/}
          </div>

          {/* 🏠 GRID */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 group"
              >
                {/* ⭐ DESTACADA */}
                {prop.is_featured && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs px-3 py-1 rounded-full z-10">
                    Destacada
                  </span>
                )}

                {/* 🖼 IMAGEN */}
                <div className="relative overflow-hidden">
                  <img
                    src={prop.main_image || "/no-image.jpg"}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
                  />

                  <span className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full z-10">
                    {prop.operation}
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                {/* 📄 INFO */}
                <div className="p-5">

                  {/* 💰 PRECIO */}
                  <p className="text-xl font-bold text-blue-600">
                    {prop.price
                      ? `USD ${prop.price.toLocaleString()}`
                      : `ARS ${prop.price_ars?.toLocaleString()}`}
                  </p>

                  {/* 🏷 TÍTULO */}
                  <h2 className="font-semibold text-lg mt-2 text-gray-600">
                    {prop.title}
                  </h2>

                  {/* 📍 UBICACIÓN */}
                   <MapPinHouse className="absolute text-black mt-1" size={18} />
                  <p className="text-gray-500 text-sm mt-1 ml-6">
                    {prop.address}, {prop.city}, {prop.province}
                  </p>

                 {/* 🏠 FEATURES */}
<div className="mt-5 border-t border-b border-gray-200 py-5">

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
                  {/* 🔘 BOTÓN */}
                  <a
                    href={`/propiedades/${prop.id}`}
                    className="block text-center mt-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 rounded-xl hover:opacity-90 transition"
                  >
                    Ver detalle
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ❌ SIN RESULTADOS */}
          {filteredProperties.length === 0 && (
            <div className="text-center mt-16 text-gray-300">
              <p className="text-lg">
                No se encontraron propiedades con esos filtros
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  </main>
);
}