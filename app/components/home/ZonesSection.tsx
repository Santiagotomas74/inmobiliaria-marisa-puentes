"use client";

const zones = [
  {
    name: "San Miguel",

    image: "/san-miugel.jpeg",
  },
  {
    name: "Muñiz",

    image: "/muñiz.jpeg",
  },
  {
    name: "Bella Vista",
   
    image: "/bella-vista.jpeg",
  },
  {
    name: "Jose C. Paz",

    image: "/jose-c-paz.jpeg",
  },
];

export default function ZonesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* 🏷 HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
             <div className="mb-1 flex items-center gap-4 group">
  <div className="w-12 h-[2px] bg-blue-600 rounded-full transition-all duration-300 group-hover:w-20"></div>

  <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
    TENEMOS LA PROPIEDAD QUE BUSCÁS
  </h2>
</div>
        
            <h2 className="text-4xl font-bold text-gray-900">
              Propiedades por zona
            </h2>
          </div>

          <a
            href="/propiedades"
            className="hidden md:flex items-center gap-2 bg-white border px-5 py-2 rounded-full shadow hover:shadow-md transition text-blue-900"
          >
            Ver todas las zonas →
          </a>
        </div>

        {/* 🏙 GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone, index) => (
            <div
            onClick={() =>
  window.location.href = `/propiedades?city=${zone.name}`
}
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer"
            >
              {/* 🖼 IMAGEN */}
              <div className="relative overflow-hidden">
                <img
                  src={zone.image}
                  alt={zone.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
                />

                {/* overlay suave */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* 📄 INFO */}
              <div className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                     propiedades en zona:
                  </p>

                  <h3 className="font-semibold text-lg text-gray-900">
                    {zone.name}
                  </h3>
                </div>

                {/* ➡️ ICON */}
                <div className="bg-blue-100 group-hover:bg-blue-500 transition p-2 rounded-full">
                  <span className="text-blue-500 group-hover:text-white">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📱 MOBILE CTA */}
        <div className="mt-8 text-center md:hidden">
          <a
            href="/propiedades"
            className="inline-block bg-black text-white px-6 py-3 rounded-full"
          >
            Ver más zonas
          </a>
        </div>
      </div>
    </section>
  );
}