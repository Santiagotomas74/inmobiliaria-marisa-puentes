"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BedDouble, Bath, RulerDimensionLine, MapPinHouse, DoorClosed, Calendar, BadgeCheck, Car } from 'lucide-react';


export default function PropertyDetail() {
  const { id } = useParams();

  const [property, setProperty] = useState<any>(null);
  const [mainImage, setMainImage] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();

      setProperty(data);
      setMainImage(data?.media?.[0]?.url || "");
    };

    fetchProperty();
  }, [id]);

  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Cargando propiedad...
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
                  ? `USD $${property.price.toLocaleString()}`
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

              <p className="text-gray-500 mb-4">
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
      <p className="text-xs text-gray-500">m²</p>
    </div>
  )}

  {/* GARAGE */}
  {property.garage && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <Car className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">Sí</p>
      <p className="text-xs text-gray-500">Garage</p>
    </div>
  )}

  {/* AÑO */}
  {property.construction_year && (
    <div className="bg-gray-100 p-4 rounded-xl flex flex-col items-center justify-center text-center">
      <Calendar className="text-black mb-1" size={20} />
      <p className="font-semibold text-black">
        {property.construction_year}
      </p>
      <p className="text-xs text-gray-500">Año</p>
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
              <h2 className="text-xl font-semibold mb-3 text-black">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

          </div>

          {/* DERECHA */}
          <div className="sticky top-24 h-fit">

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-3xl shadow-xl">

              <h3 className="text-lg font-semibold mb-4">
                Consultar propiedad
              </h3>

              {/* PRECIO */}
              <div className="mb-4">
                <p className="text-2xl font-bold text-green-400">
                  {property.price
                    ? `USD $${property.price.toLocaleString()}`
                    : `ARS $${property.price_ars?.toLocaleString()}`}
                </p>
                <p className="text-2xl font-bold text-white-400">
             
               ARS ${property.price_ars?.toLocaleString()}
                </p>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/549XXXXXXXXXX?text=Hola, quiero consultar por la propiedad: ${property.title}`}
                target="_blank"
                className="block text-center bg-green-500 py-3 rounded-xl font-semibold hover:bg-green-600 transition"
              >
                WhatsApp
              </a>

              <button className="w-full mt-3 border border-white/30 py-3 rounded-xl hover:bg-white hover:text-black transition">
                Enviar consulta
              </button>

              {/* INFO */}
              <div className="mt-6 text-sm text-gray-300">
                <p>✔ Respuesta rápida</p>
                <p>✔ Atención personalizada</p>
                <p>✔ Asesoramiento profesional</p>
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