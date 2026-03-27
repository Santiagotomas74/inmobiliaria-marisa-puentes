"use client";

import { useEffect, useState } from "react";
import { BedDouble, Bath, RulerDimensionLine, DoorClosed } from 'lucide-react';

type Property = {
  id: number;
  title: string;
  address: string;
  city: string;
  province: string;
  price: number;
  price_ars?: number;
  type: string;
  operation: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  surface_total?: number;
  main_image?: string;
  is_featured: boolean,
  garage: boolean,
};

type Tasacion = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  operation?: string;
  property_type?: string;
  zone?: string;
  created_at?: string;
};
type Message = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at?: string;
}

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tasaciones, setTasaciones] = useState<Tasacion[]>([]);
  const [mensajes, setMensajes] = useState<Message[]>([]);

  const fetchProperties = async () => {
    const res = await fetch(`/api/properties`);
    const data = await res.json();
    setProperties(data);
    console.log(data);
  };

  const fetchTasaciones = async () => {
    const res = await fetch(`/api/valuations`);
    const data = await res.json();
    setTasaciones(data);
  };

  const fetchMensajes = async () => {
    const res = await fetch(`/api/messages`);
    const data = await res.json();
    setMensajes(data);
  };

  useEffect(() => {
    fetchProperties();
    fetchTasaciones();
    fetchMensajes();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar propiedad?")) return;

    await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    fetchProperties();
  };

  return (
    /* 👇 Aquí se agregó el contenedor con el color de fondo y altura mínima */
    <div className="min-h-screen bg-slate-50">
      <main className="p-6 max-w-7xl mx-auto">

        {/* 🧠 HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Panel Administrador</h1>

          <a
            href="/administracion/new"
            className="bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            + Nueva Propiedad
          </a>
        </div>

        {/* 📊 STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-700 text-sm">Propiedades</p>
            <p className="text-2xl font-bold  text-black">{properties.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Tasaciones</p>
            <p className="text-2xl font-bold  text-black">{tasaciones.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Leads nuevos</p>
            <p className="text-2xl font-bold  text-black">
              {tasaciones.length}
            </p>
          </div>
        </div>

        {/* 🏠 PROPIEDADES */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold mb-6 text-black">
            Propiedades
          </h2>

          {properties.length === 0 ? (
            <p className="text-gray-500">
              No hay propiedades cargadas
            </p>
) : (
  <div className="grid md:grid-cols-2 gap-6">
    {properties.map((prop) => (
      <div
        key={prop.id}
        className="relative bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
      >
        {/* 🖼 IMAGEN */}
        <img
          src={prop.main_image || "/no-image.jpg"}
          className="w-full h-40 object-cover"
        />

        {/* ⭐ DESTACADA */}
        {prop.is_featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
            ⭐ Destacada
          </div>
        )}
        {/* garage */}
        {prop.garage && (
          <div className="absolute top-3 right-3 bg-green-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg z-10">
          Garage
          </div>
        )}

        {/* 📄 INFO */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-black">
            {prop.title}
          </h3>

          <p className="text-gray-500 text-sm">
            {prop.city}, {prop.province}
          </p>

          <p className="text-sm mt-1 text-black">
            {prop.type} • {prop.operation}
          </p>

          {/* 💰 PRECIO */}
          <div className="mt-2">
            <p className="text-green-600 font-bold">
              USD {prop.price?.toLocaleString()}
            </p>

            {prop.price_ars && (
              <p className="text-gray-500 text-sm">
                ARS {prop.price_ars.toLocaleString()}
              </p>
            )}
          </div>

          {/* 🏠 FEATURES */}
          <div className="flex gap-4 text-sm mt-2 text-gray-600 items-center">
            {prop.rooms && <span className="flex items-center gap-1"><DoorClosed />{prop.rooms}</span>}
            <div className="h-5 w-px bg-gray-200" />
            {prop.bedrooms && <span className="flex items-center gap-1"><BedDouble />{prop.bedrooms}</span>}
            <div className="h-5 w-px bg-gray-200" />
            {prop.bathrooms && <span className="flex items-center gap-1"><Bath />{prop.bathrooms}</span>}
            <div className="h-5 w-px bg-gray-200" />
            {prop.surface_total && (
              <span className="flex items-center gap-1">
                <RulerDimensionLine /> {prop.surface_total} m²
              </span>
            )}
          </div>

          {/* ⚙ ACCIONES */}
          <div className="flex justify-between items-center mt-4">
            <a
              href={`/administracion/edit/${prop.id}`}
              className="text-blue-600 hover:underline"
            >
              Editar
            </a>

            <button
              onClick={() => handleDelete(prop.id)}
              className="text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
        </section>

        {/* 📩 TASACIONES */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-black">
            Solicitudes de tasación
          </h2>

          {tasaciones.length === 0 ? (
            <p className="text-gray-500">
              No hay solicitudes aún
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {tasaciones.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold  text-black">{t.name}</p>
                    <span className="text-xs bg-green-700 px-2 py-1 rounded text-white">
                      Nuevo
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {t.email}
                  </p>

                  {t.phone && (
                    <p className="text-sm text-gray-500">
                      {t.phone}
                    </p>
                  )}

                  <div className="mt-3 text-sm text-gray-600">
                    <p>{t.operation} • {t.property_type}</p>
                    <p>{t.zone}</p>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {t.created_at
                        ? new Date(t.created_at).toLocaleDateString()
                        : ""}
                    </span>

                    <button className="text-green-600 hover:underline">
                      Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* 📩 mensajes */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-black">
            Mensajes
          </h2>

          {mensajes.length === 0 ? (
            <p className="text-gray-500">
              No hay solicitudes aún
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold  text-black">{m.name}</p>
                    <span className="text-xs bg-green-700 px-2 py-1 rounded text-white">
                      Nuevo
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {m.email}
                  </p>

                  {m.phone && (
                    <p className="text-sm text-gray-500">
                      {m.phone}
                    </p>
                  )}

                  <div className="mt-3 text-sm text-gray-600">
                    <p>{m.message}</p>
                  
                  </div>

                  <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleDateString()
                        : ""}
                    </span>

                    <button className="text-green-600 hover:underline">
                      Contactar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}