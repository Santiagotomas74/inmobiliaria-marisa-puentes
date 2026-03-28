"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    price: "",
    price_ars: "",
    operation: "",
    type: "",
    address: "",
    city: "",
    province: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    surface_total: "",
    surface_covered: "",
    surface_uncovered: "",
    condition: "",
    construction_year: "",
    garage: false,
    is_featured: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  // 📸 manejar selección de archivos
  const handleFiles = (e: any) => {
    const selected = Array.from(e.target.files);

    setFiles(selected as File[]);
    setPreviews(selected.map((file: any) => URL.createObjectURL(file)));
    setMainIndex(0);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);

    if (mainIndex === index) setMainIndex(0);
  };
  // 🚀 SUBMIT COMPLETO
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1️⃣ CREAR PROPIEDAD
      const res = await fetch(`/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          currency: "USD",
          currency_ars: "ARS",
          is_active: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al crear propiedad");
        return;
      }

      const propertyId = data.id;

      // 2️⃣ SUBIR MEDIA (SI HAY)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        // 📤 subir a cloudinary
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();

        // 💾 guardar en DB
        await fetch(`/api/property-media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            property_id: propertyId,
            url: uploadData.secure_url,
            public_id: uploadData.public_id,
            type: file.type.startsWith("video") ? "video" : "image",
            is_main: i === mainIndex,
            order_index: i,
          }),
        });
      }

      alert("Propiedad creada con media ✅");
      router.push("/administracion");

    } catch (error) {
      console.error(error);
      alert("Error inesperado");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50">
    <main className="p-6 max-w-4xl mx-auto">

      <h1 className="text-3xl font-bold mb-8 text-black">
        Nueva Propiedad
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl space-y-6"
      >

        {/* 🧾 INFO GENERAL */}
        <div className="grid md:grid-cols-2 gap-4 text-black">

          <input
            name="title"
            placeholder="Título"
            value={form.title}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
            required
          />

          <select
            name="operation"
            value={form.operation}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
            required
          >
            <option value="">Operación</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
            required
          >
            <option value="">Tipo</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
             <option value="terreno">Terreno</option>
            <option value="Chalet">Chalet</option>
            <option value="PH">PH</option>
            <option value="Condominio">Condominio</option>
            <option value="Casa Quinta">Casa Quinta</option>
          </select>

          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          >
            <option value="">Condición</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="en_construccion">En construcción</option>
          </select>
        </div>

        {/* 📝 DESCRIPCIÓN */}
        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg text-black"
        />

        {/* 💰 PRECIOS */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Precio USD"
            value={form.price}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
            required
          />

          <input
            type="number"
            name="price_ars"
            placeholder="Precio ARS"
            value={form.price_ars}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />
        </div>

        {/* 📍 UBICACIÓN */}
        <div className="grid md:grid-cols-3 gap-4">
          <input
            name="address"
            placeholder="Dirección"
            value={form.address}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <input
            name="city"
            placeholder="Ciudad"
            value={form.city}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <input
            name="province"
            placeholder="Provincia"
            value={form.province}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />
        </div>

        {/* 🏠 CARACTERÍSTICAS */}
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="number"
            name="rooms"
            placeholder="Ambientes"
            value={form.rooms}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <input
            type="number"
            name="bedrooms"
            placeholder="Dormitorios"
            value={form.bedrooms}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <input
            type="number"
            name="bathrooms"
            placeholder="Baños"
            value={form.bathrooms}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <input
            type="number"
            name="surface_total"
            placeholder="m²"
            value={form.surface_total}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />
          <input
            type="number"
            name="surface_covered"
            placeholder="m² Techados"
            value={form.surface_covered}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />
          <input
            type="number"
            name="surface_uncovered"
            placeholder="m² Terreno"
            value={form.surface_uncovered}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />
        </div>

        {/* ⚙ EXTRA */}
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="number"
            name="construction_year"
            placeholder="Año construcción"
            value={form.construction_year}
            onChange={handleChange}
            className="border p-3 rounded-lg text-black"
          />

          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              name="garage"
              checked={form.garage}
              onChange={handleChange}
            />
            Garage
          </label>

          <label className="flex items-center gap-2 text-black">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={handleChange}
            />
            Destacada ⭐
          </label>
        </div>
{/* 📸 MEDIA */}
        <div>
          <label className="font-semibold mb-2 block text-black">
            Imágenes / Videos
          </label>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFiles}
            className="border p-3 rounded-lg w-full text-black"
          />

          {/* PREVIEW */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {previews.map((src, i) => (
              <div
                key={i}
                className={`relative border rounded-lg p-1 ${
                  i === mainIndex ? "border-green-500" : ""
                }`}
              >
                <img
                  src={src}
                  className="w-full h-24 object-cover rounded"
                />

                {/* ⭐ MAIN */}
                <button
                  type="button"
                  onClick={() => setMainIndex(i)}
                  className="absolute top-1 left-1 text-xs bg-black text-white px-2 py-1 rounded"
                >
                  {i === mainIndex ? "Principal ⭐" : "Elegir"}
                </button>

                {/* ❌ DELETE */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 text-xs bg-red-500 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* 🚀 BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          {loading ? "Creando..." : "Crear propiedad"}
        </button>

      </form>
    </main>
    </div>
  );
}