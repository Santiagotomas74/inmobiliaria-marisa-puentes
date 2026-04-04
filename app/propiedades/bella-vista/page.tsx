"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/app/components/home/Footer";



export default function BellaVistaPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/properties?city=bella-vista");
        const data = await res.json();

        setProperties(data);
      } catch (error) {
        
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

 if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">

      {/* LOGO */}
      <img
        src="/logo2.png"
        alt="Logo"
        className="w-50 h-auto object-contain animate-pulse"
      />

      {/* SPINNER */}
      <div className="flex flex-col items-center gap-2 text-gray-600 mt-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#00173D]" />
        <p className="text-sm font-medium">Cargando propiedades de Bella Vista...</p>
      </div>

    </div>
  );
}

 return (
<div>
      
    <main className="bg-gray-100 h-full py-10">
      
      <div className="max-w-7xl mx-auto px-6 ">
        
        {/* 🧠 SEO TEXT */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Propiedades en Bella Vista
        </h1>
  
        <p className="text-gray-600 mb-8 max-w-2xl">
          Descubrí las mejores propiedades en Bella Vista. Casas, departamentos y
          terrenos disponibles para compra, venta o alquiler con asesoramiento
          profesional.
        </p>
  
        {/* 📦 GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {properties.map((prop) => {
            const isVideo = prop.main_image?.match(/\.(mp4|webm|ogg)$/i);
  
            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                
                {/* 🖼 MEDIA */}
                {isVideo ? (
                  <video
                    src={prop.main_image}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <img
                    src={prop.main_image || "/no-image.jpg"}
                    className="w-full h-48 object-cover"
                  />
                )}
  
                {/* 📄 INFO */}
                <div className="p-4">
                  <h2 className="font-semibold text-lg text-black">
                    {prop.title}
                  </h2>
  
                  <p className="text-sm text-gray-500">
                    {prop.city}, {prop.province}
                  </p>
  
                  <p className="text-green-600 font-bold mt-2">
                    USD {prop.price?.toLocaleString()}
                  </p>
  
                  <a
                    href={`/propiedades/${prop.id}`}
                    className="inline-block mt-3 text-blue-600 text-sm hover:underline"
                  >
                    Ver propiedad
                  </a>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* ❌ SIN RESULTADOS */}
        {properties.length === 0 && (
          <p className="text-gray-500 mt-10">
            No hay propiedades disponibles en Bella Vista por el momento.
          </p>
        )}
        
      </div>
     
  
     
    </main>
    <Footer />
    </div>
);
}