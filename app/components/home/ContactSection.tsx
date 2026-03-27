"use client";

import { useState } from "react";
import { Phone, Mail, MessageCircle, Send } from "lucide-react";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al enviar mensaje");
        return;
      }

      alert("Mensaje enviado ✅");

      setForm({
        name: "",
        phone: "",
        email: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">

          {/* 🔵 IZQUIERDA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-4">Hablemos hoy</h2>

              <p className="text-blue-100 mb-8">
                ¿Listo para dar el siguiente paso? Nuestros expertos están esperando.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <Phone />
                  <p>+54 11 1234-5678</p>
                </div>

                <div className="flex gap-4">
                  <Mail />
                  <p>info@inmomundo.com</p>
                </div>

                <div className="flex gap-4">
                  <MessageCircle />
                  <p>Disponible 9am - 6pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* ⚪ FORM */}
          <div className="bg-white p-10">
            <h3 className="text-2xl font-bold mb-4 text-gray-700">
              Envíanos un mensaje
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="border p-3 rounded-lg text-gray-700"
                  required
                />

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+54..."
                  className="border p-3 rounded-lg text-gray-700"
                />
              </div>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@correo.com"
                className="border p-3 rounded-lg w-full text-gray-700"
                required
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="¿En qué podemos ayudarte?"
                rows={4}
                className="border p-3 rounded-lg w-full text-gray-700"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
              >
                {loading ? "Enviando..." : "Enviar Mensaje"}
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}