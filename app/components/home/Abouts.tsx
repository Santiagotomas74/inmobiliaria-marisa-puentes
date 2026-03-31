"use client";
import { Clock, Check  } from 'lucide-react';

export default function AboutUs() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* 🖼 IZQUIERDA */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1704584592182-ed995ac89ddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwa2V5cyUyMGhhbmRzaGFrZXxlbnwxfHx8fDE3NzAxNjQ5MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" // 👈 cambiá por tu imagen
            className="rounded-3xl shadow-lg w-full"
          />

        
        </div>

        {/* 📄 DERECHA */}
        <div>
              <div className=" flex items-center gap-4 group">
  <div className="w-12 h-[2px] bg-blue-600 rounded-full transition-all duration-300 group-hover:w-20"></div>

  <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
   Sobre Nosotros
  </h2>
</div>
       

          <h2 className="text-4xl font-bold leading-tight text-gray-800">
            Hacemos realidad el sueño de{" "}
            <span className="text-blue-600">tu casa propia</span>
          </h2>

          <p className="text-gray-500 mt-4">
            En Marisa Puentes Propiedades, redefinimos la experiencia inmobiliaria combinando
            tecnología de punta con un servicio humano excepcional.
            Tu tranquilidad es nuestra prioridad.
          </p>

          {/* 🧩 FEATURES */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">

  <div className="flex gap-3 items-start">
    <div className="bg-white p-2 md:p-3 rounded-xl shadow text-sm md:text-base">
        <Clock className='text-red-600' />
    </div>
    <div>
      <h4 className="font-semibold text-black text-sm md:text-base">
        Soporte 24/7
      </h4>
      <p className="text-xs md:text-sm text-gray-500">
        Siempre disponibles para ayudarte.
      </p>
    </div>
  </div>

  <div className="flex gap-3 items-start">
    <div className="bg-white p-2 md:p-3 rounded-xl shadow text-sm md:text-base">
     <Check className='text-green-600' />
    </div>
    <div>
      <h4 className="font-semibold text-black text-sm md:text-base">
        Transparencia Total
      </h4>
      <p className="text-xs md:text-sm text-gray-500">
        Sin sorpresas, todo claro.
      </p>
    </div>
  </div>

</div>

          {/* 🔘 CTA */}
          <button className="mt-8 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
            <a href="/nosotros">
            Conoce más sobre nosotros →
            </a>
          </button>
        </div>
      </div>
    </section>
  );
}