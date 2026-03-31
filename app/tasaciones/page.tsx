"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Send } from "lucide-react";
import Footer from "../components/home/Footer";
 import { FaWhatsapp } from "react-icons/fa"; 

export default function TasacionPage() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    operation: "",
    property_type: "",
    zone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/valuations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error al enviar");
      } else {
        setMessage("Solicitud enviada correctamente ✅");

        // limpiar form
        setForm({
          name: "",
          email: "",
          phone: "",
          operation: "",
          property_type: "",
          zone: "",
        });
      }

    } catch (error) {
      setMessage("Error de conexión");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-10">

        {/* 🧾 FORM */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">

          <h1 className="text-3xl font-bold mb-2 text-gray-700">
            Tasaciones
          </h1>

          <p className="text-gray-500 mb-6">
            Completá con tus datos y nos contactaremos a la brevedad
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full border p-3 rounded-lg text-gray-700"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
              className="w-full border p-3 rounded-lg text-gray-700"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-full border p-3 rounded-lg text-gray-700"
            />

            <select
              name="operation"
              value={form.operation}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg text-gray-700"
            >
              <option value="">Operación</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>

            <select
              name="property_type"
              value={form.property_type}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg text-gray-700"
            >
              <option value="">Tipo de propiedad</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="terreno">Terreno</option>
            </select>

            <input
              name="zone"
              value={form.zone}
              onChange={handleChange}
              placeholder="Zona"
              className="w-full border p-3 rounded-lg text-gray-700"
            />
<p className="text-xs text-gray-400 mt-2">
  Al enviar el formulario aceptás nuestra{" "}
  <a href="/privacidad" className="underline hover:text-white">
    Política de Privacidad
  </a>
</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar solicitud"}
              <Send size={18} />
            </button>

            {/* 📢 MENSAJE */}
            {message && (
              <p className="text-center text-sm mt-2 text-gray-600">
                {message}
              </p>
            )}

          </form>
        </div>

        {/* 📍 CARD INFORMACIÓN */}
<div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 md:p-8 rounded-3xl shadow-xl flex flex-col justify-between">

  <div>
    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
      ¿Dónde estamos ubicados?
    </h2>

    <p className="text-gray-300 mb-5 md:mb-6 text-sm md:text-base">
      Podés visitarnos en nuestra oficina o comunicarte por cualquiera de nuestros canales.
    </p>

    <div className="space-y-4 md:space-y-6">

      {/* 📍 Dirección */}
      <div className="flex gap-3 md:gap-4 items-start">
        <div className="bg-white/10 p-2.5 md:p-3 rounded-xl">
          <MapPin size={18} />
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-400">Dirección</p>
          <p className="font-semibold text-sm md:text-base leading-snug">
            Av. Papa Francisco 4215, Localidad Santa María, San Miguel.
          </p>
        </div>
      </div>

      {/* 📞 Teléfono */}
      <div className="flex gap-3 md:gap-4 items-start">
        <div className="bg-white/10 p-2.5 md:p-3 rounded-xl">
          <Phone size={18} />
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-400">Teléfono</p>
          <p className="font-semibold text-sm md:text-base">
            +54 11 3700-1152
          </p>
        </div>
      </div>

      {/* ⏰ Horario */}
      <div className="flex gap-3 md:gap-4 items-start">
        <div className="bg-white/10 p-2.5 md:p-3 rounded-xl">
          <Clock size={18} />
        </div>
        <div>
          <p className="text-xs md:text-sm text-gray-400">Horario</p>
          <p className="font-semibold text-sm md:text-base leading-snug">
            Lunes a Viernes de 9:30 a 12:00 y de 16:00 a 19:00
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* 🔥 CTA ABAJO */}
  <div className="mt-6 md:mt-10 bg-white/10 p-4 rounded-xl space-y-3 md:space-y-4">
    <p className="text-xs md:text-sm text-gray-300 text-center md:text-left">
      También podés escribirnos por WhatsApp y te respondemos al instante.
    </p>

    {/* ✅ BOTÓN WHATSAPP */}
    <a
      href="https://wa.me/541137001152"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 md:py-3 rounded-xl transition text-sm md:text-base w-full md:w-auto"
    >
      <FaWhatsapp size={18} />
      Escribir por WhatsApp
    </a>
  </div>

</div>

      </div>

    </main>
  );
}