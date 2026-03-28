"use client";

import { Users, Target, Award, Heart } from "lucide-react";

export default function NosotrosPage() {
  return (
    <main className="bg-gray-100 min-h-screen">

      {/* 🖼 HERO */}
      <section className="relative h-[350px] flex items-center justify-center text-center text-white">
       
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-br from-red-600 to-blue-800" />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold">
            Sobre Nosotros
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Más que una inmobiliaria, somos tu aliado estratégico
          </p>
        </div>
      </section>

      {/* 🏢 HISTORIA */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center  ">

      
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800 ">
            Nuestra Historia
          </h2>

          <p className="text-gray-600 mb-4 leading-relaxed">
            Somos una inmobiliaria con años de experiencia en el mercado,
            dedicada a brindar soluciones personalizadas para cada cliente.
          </p>

          <p className="text-gray-600 leading-relaxed">
            Nos enfocamos en ofrecer un servicio transparente, profesional
            y cercano, ayudando a nuestros clientes a encontrar el hogar
            ideal o realizar inversiones seguras.
          </p>
        </div>

      </section>

      {/* 💎 VALORES */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-10 text-gray-800">
            Nuestros Valores
          </h2>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="p-6 rounded-2xl shadow-md">
              <Users className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold text-black">Compromiso</h3>
              <p className="text-sm text-gray-500 mt-2">
                Acompañamos cada operación de principio a fin.
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-md">
              <Target className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold text-black">Transparencia</h3>
              <p className="text-sm text-gray-500 mt-2">
                Información clara y honesta siempre.
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-md">
              <Award className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold text-black">Experiencia</h3>
              <p className="text-sm text-gray-500 mt-2">
                Años en el mercado nos respaldan.
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-md">
              <Heart className="mx-auto mb-3 text-black" size={32} />
              <h3 className="font-semibold text-black">Cercanía</h3>
              <p className="text-sm text-gray-500 mt-2">
                Atención personalizada para cada cliente.
              </p>
            </div>

          </div>
        </div>
      </section>

 

      {/* 🚀 CTA */}
      <section className="bg-gradient-to-r from-green-800 to-green-400 text-white py-16 text-center">

        <h2 className="text-3xl font-bold mb-4">
          ¿Querés vender o comprar una propiedad?
        </h2>

        <p className="text-gray-300 mb-6">
          Estamos listos para ayudarte en cada paso
        </p>

        <a
          href="/contacto"
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
        >
          Contactanos
        </a>

      </section>

    </main>
  );
}