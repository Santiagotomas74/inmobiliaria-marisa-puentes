"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BedDouble, Bath, RulerDimensionLine, MapPinHouse, DoorClosed, Calendar, BadgeCheck, Warehouse, HousePlus, SolarPanel } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa"; 


export default function PropertyDetail() {
  const { id } = useParams();

  const [property, setProperty] = useState<any>(null);
  const [mainImage, setMainImage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  message: "",
});

const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();

      setProperty(data);
      setMainImage(data?.media?.[0]?.url || "");
    };

    fetchProperty();
  }, [id]);
const handleChange = (e: any) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};
const handleSubmit = async () => {
  try {
    setLoading(true);

const fullMessage = `
🏠 Propiedad: ${property.title}
📍 Ubicación: ${property.city}, ${property.province}

💬 Mensaje:
${form.message}
`;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: fullMessage, // 🔥 mensaje con info incluida
      }),
    });

   const data = await res.json();

if (!res.ok) {
  console.error(data);
  throw new Error(data.error || "Error al enviar");
}

    setSuccess(true);
    setForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

  } catch (error) {
    console.error(error);
    alert("Error al enviar el mensaje");
  } finally {
    setLoading(false);
  }
};
  if (!property) {
    return (
  <div className="animate-pulse max-w-6xl mx-auto p-6 ">
    
    {/* 🖼 Imagen principal */}
    <div className="w-full h-[400px] bg-gray-300 rounded-2xl mb-6" />

    {/* 📄 Info */}
    <div className="space-y-4">
      <div className="h-8 bg-gray-300 rounded w-2/3" />
      <div className="h-5 bg-gray-200 rounded w-1/2" />

      {/* 💰 Precio */}
      <div className="h-6 bg-gray-300 rounded w-1/4 mt-4" />

      {/* 📊 Features */}
      <div className="flex gap-6 mt-6">
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>

      {/* 📝 Descripción */}
      <div className="space-y-2 mt-6">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  </div>
);
  }

  return (
    <main className="bg-gray-100 min-h-screen py-10">

      <div className="max-w-7xl mx-auto px-6">

        {/* 🖼 HERO GALERÍA */}
        <div className="mb-10 bg-white p-4 rounded-3xl shadow-lg">

          {/* Imagen principal */}
          <div className="relative">
            <img
              src={mainImage}
              onClick={() => setShowModal(true)}
              className="w-full h-[450px] object-cover rounded-3xl cursor-pointer hover:opacity-90 transition"
            />

            {/* 🏷 BADGE */}
            <span className="absolute top-4 left-4 bg-black text-white px-4 py-1 rounded-full text-sm">
              {property.operation}
            </span>

            {property.is_featured && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm">
                Destacada ⭐
              </span>
            )}

            {/* 💰 PRECIO OVERLAY */}
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-xl backdrop-blur-sm">
              <p className="text-lg font-bold">
                {property.price
                  ? `U$S ${property.price.toLocaleString()}`
                  : `ARS $${property.price_ars?.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {property.media?.map((m: any) => (
              <img
                key={m.id}
                src={m.url}
                onClick={() => setMainImage(m.url)}
                className={`h-20 w-32 object-cover rounded-xl cursor-pointer transition border-2 ${
                  mainImage === m.url
                    ? "border-black scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 📄 CONTENIDO */}
        <div className="grid md:grid-cols-3 gap-10">

          {/* IZQUIERDA */}
          <div className="md:col-span-2 space-y-6">

            {/* INFO PRINCIPAL */}
            <div className="bg-white p-6 rounded-3xl shadow-md">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">
                {property.title}
              </h1>

               {/* 📍 UBICACIÓN */}
                   <MapPinHouse className="absolute text-black " size={18} />
                  <p className="text-gray-500 text-sm mt-1 ml-6">
                    {property.address}, {property.city}, {property.province}
                  </p>

             {/* FEATURES */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

  {/* AMBIENTES */}
  {property.rooms && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <DoorClosed className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">{property.rooms}</p>
      <p className="text-xs text-gray-500">Ambientes</p>
    </div>
  )}

  {/* DORMITORIOS */}
  {property.bedrooms && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <BedDouble className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">{property.bedrooms}</p>
      <p className="text-xs text-gray-500">Dormitorios</p>
    </div>
  )}

  {/* BAÑOS */}
  {property.bathrooms && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <Bath className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">{property.bathrooms}</p>
      <p className="text-xs text-gray-500">Baños</p>
    </div>
  )}

  {/* SUPERFICIE */}
  {property.surface_total && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <RulerDimensionLine className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">{property.surface_total}</p>
      <p className="text-xs text-gray-500">m² Terreno</p>
    </div>
  )}
   {/* m2 techados*/}
  {property.surface_covered && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <HousePlus className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">
        {property.surface_covered}
      </p>
      <p className="text-xs text-gray-500">m² Cubiertos</p>
    </div>
  )}
    {/* m2 terreno */}
  {property.surface_uncovered && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <SolarPanel className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">
        {property.surface_uncovered}
      </p>
      <p className="text-xs text-gray-500">m² Descubiertos</p>
    </div>
  )}
  {/* GARAGE */}
  {property.garage && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <Warehouse className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">Sí</p>
      <p className="text-xs text-gray-500">Garage</p>
    </div>
  )}

  

  {/* CONDICIÓN */}
  {property.condition && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <BadgeCheck className="text-black mb-1" size={20} />
      <p className="font-semibold text-black capitalize">
        {property.condition.replace("_", " ")}
      </p>
      <p className="text-xs text-gray-500">Condición</p>
    </div>
  )}
 

</div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="bg-white p-6 rounded-3xl shadow-md">
              {/* AÑO */}
  {property.construction_year && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <Calendar className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">
        {property.construction_year}
      </p>
      <p className="text-xs text-gray-500">Año de construcción</p>
    </div>
  )}
              <h2 className="text-xl font-semibold mb-3 mt-3 text-black">
                Descripción
              </h2>
              
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

          </div>
          

          {/* DERECHA */}
          <div className="sticky top-24 h-fit">

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-7 rounded-3xl shadow-2xl border border-white/10">

  {/* 🏷 TÍTULO */}
  <h3 className="text-lg font-semibold mb-5 tracking-wide">
    Consultar propiedad
  </h3>

  {/* 💰 PRECIO */}
  <div className="mb-6">
    <p className="text-3xl font-bold text-green-400">
      {property.price
        ? `U$S ${property.price.toLocaleString()}`
        : "Consultar"}
    </p>

    {property.price_ars && (
      <p className="text-sm text-gray-300 mt-1">
        ARS ${property.price_ars.toLocaleString()}
      </p>
    )}
  </div>

  {/* 🔥 BOTONES */}
  <div className="space-y-3">

    {/* WhatsApp */}
    <a
      href={`https://wa.me/5491137001152?text=Hola! Quiero consultar por la propiedad: ${property.title}`}
      target="_blank"
      className="flex items-center justify-center gap-2 bg-green-500 py-3 rounded-xl font-semibold hover:bg-green-600 transition shadow-md"
    >
      <FaWhatsapp className="text-white" />
      <span> Contactar por WhatsApp</span>
    </a>

    {/* Formulario */}
    <button
  onClick={() => setShowForm(!showForm)}
  className="w-full border border-white/20 py-3 rounded-xl hover:bg-white hover:text-black transition font-medium"
>
  Enviar una consulta
</button>
{showForm && (
  <form
    onSubmit={handleSubmit}
    className="mt-4 space-y-3 animate-fade-in"
  >
    <input
      name="name"
      value={form.name}
      onChange={handleChange}
      type="text"
      placeholder="Nombre"
      required
      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none"
    />

    <input
      name="email"
      value={form.email}
      onChange={handleChange}
      type="email"
      placeholder="Email"
      required
      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none"
    />

    <input
      name="phone"
      value={form.phone}
      onChange={handleChange}
      placeholder="+54..."
      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none"
    />

    <textarea
      name="message"
      value={form.message}
      onChange={handleChange}
      placeholder="Mensaje"
      rows={3}
      required
      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none"
    />

    <p className="text-xs text-gray-400 mt-2">
      Al enviar el formulario aceptás nuestra{" "}
      <a href="/privacidad" className="underline hover:text-white">
        Política de Privacidad
      </a>
    </p>

    <button
      type="button" // 🔥 IMPORTANTE
  onClick={handleSubmit}
      className="w-full bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Enviar"}
    </button>

    {success && (
      <p className="text-green-400 text-sm text-center">
        ✅ Mensaje enviado correctamente
      </p>
    )}
  </form>
)}
  </div>

  {/* 🧾 BENEFICIOS */}
  <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-sm text-gray-300">

    <div className="flex items-center gap-2">
      <span className="text-green-400">✔</span>
      <p>Respuesta rápida</p>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-green-400">✔</span>
      <p>Atención personalizada</p>
    </div>

    <div className="flex items-center gap-2">
      <span className="text-green-400">✔</span>
      <p>Asesoramiento profesional</p>
    </div>

  </div>

</div>

          </div>
        </div>

      </div>

      {/* 🖼 MODAL */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6"
        >
          <img
            src={mainImage}
            className="max-w-5xl w-full rounded-2xl shadow-2xl"
          />
        </div>
      )}

    </main>
  );
}