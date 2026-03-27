"use client";

export default function PropertyValuationCTA() {
  return (
    <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
      
      {/* 🖼 BACKGROUND */}
      <img
        src="/cta-bg.jpg" // 👈 tu imagen
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 📝 CONTENIDO */}
      <div className="relative max-w-6xl mx-auto px-6 w-full flex items-center justify-between">

        {/* 📄 CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md">
          
          <p className="text-blue-500 text-sm font-semibold mb-2 tracking-wide">
            TASAMOS TU PROPIEDAD
          </p>

          <h2 className="text-2xl font-bold text-gray-900 leading-snug">
            ¿Tenés una propiedad y la querés vender o alquilar?
          </h2>

          <button
            onClick={() => window.location.href = "/contacto"}
            className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition w-full"
          >
            Quiero más información
          </button>
        </div>

        {/* 🏷 TEXTO GRANDE DERECHA */}
        <div className="hidden md:block text-right text-white max-w-xl">
          <h3 className="text-5xl font-light leading-tight">
            TU PROPIEDAD <br />
            <span className="font-semibold">
              CON PROFESIONALES
            </span>
          </h3>
        </div>

      </div>
    </section>
  );
}