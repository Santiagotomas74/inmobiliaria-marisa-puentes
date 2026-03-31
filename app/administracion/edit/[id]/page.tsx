"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProperty() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    operation: "",
    type: "",
    condition: "",
    description: "",
    price: "",
    price_ars: "",
    address: "",
    city: "",
    province: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    surface_total: "",
    surface_covered: "",
    surface_uncovered: "",
    construction_year: "",
    garage: false,
    is_featured: false,
  });

  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 📡 FETCH
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const data = await res.json();

        setForm({
          ...data,
          garage: data.garage ?? false,
          is_featured: data.is_featured ?? false,
        });

        setMedia(data.media || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchProperty();
  }, [id]);

  // ✏️ CHANGE
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
  };

  // 💾 SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      alert("Propiedad actualizada ✅");
      router.push("/administracion/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar ❌");
    } finally {
      setLoading(false);
    }
  };

  // 📤 UPLOAD
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
      alert("Solo imágenes o videos");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      setUploading(true);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      const dbRes = await fetch(`/api/property-media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_id: id,
          url: data.secure_url,
          public_id: data.public_id,
          type: file.type.startsWith("video") ? "video" : "image",
          is_main: media.length === 0,
        }),
      });

      const created = await dbRes.json();
      setMedia([...media, created]);

    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // ❌ DELETE MEDIA
  const handleDeleteMedia = async (mediaId: number) => {
    await fetch(`/api/property-media/${mediaId}`, {
      method: "DELETE",
    });

    setMedia(media.filter((m) => m.id !== mediaId));
  };

  // ⭐ SET MAIN
const [settingMainId, setSettingMainId] = useState<number | null>(null);

const handleSetMain = async (mediaId: number) => {
  try {
    setSettingMainId(mediaId);

    const res = await fetch(`/api/property-media/set-main`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: Number(id),
        media_id: mediaId,
      }),
    });

    if (!res.ok) throw new Error();

    setMedia((prev) =>
      prev.map((m) => ({
        ...m,
        is_main: m.id === mediaId,
      }))
    );

  } catch {
    alert("Error al actualizar");
  } finally {
    setSettingMainId(null);
  }
};
  // ⏳ LOADING
  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Cargando propiedad...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8 text-white">
          <h1 className="text-3xl font-bold">Editar propiedad</h1>
          <p className="text-gray-300 text-sm">
            Modificá la información y gestioná imágenes/videos
          </p>
        </div>

        <form
  onSubmit={handleSubmit}
  className="bg-white p-8 rounded-3xl shadow-xl space-y-8"
>

  {/* 🧾 INFO GENERAL */}
  <div className="grid md:grid-cols-2 gap-5 text-black">

    <div className="flex flex-col gap-1">
      <label className="label">Título</label>
      <input name="title" value={form.title || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Operación</label>
      <select name="operation" value={form.operation || ""} onChange={handleChange} className="input">
        <option value="">Seleccionar</option>
        <option value="venta">Venta</option>
        <option value="alquiler">Alquiler</option>
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Tipo de propiedad</label>
      <select name="type" value={form.type || ""} onChange={handleChange} className="input">
        <option value="">Seleccionar</option>
        <option value="casa">Casa</option>
        <option value="departamento">Departamento</option>
        <option value="terreno">Terreno</option>
         <option value="Chalet">Chalet</option>
            <option value="PH">PH</option>
            <option value="Condominio">Condominio</option>
            <option value="Casa Quinta">Casa Quinta</option>
      </select>
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Condición</label>
      <select name="condition" value={form.condition || ""} onChange={handleChange} className="input">
        <option value="">Seleccionar</option>
        <option value="nuevo">Nuevo</option>
        <option value="usado">Usado</option>
        <option value="en_construccion">En construcción</option>
      </select>
    </div>
  </div>

  {/* 📝 DESCRIPCIÓN */}
  <div className="flex flex-col gap-1 text-black">
    <label className="label">Descripción</label>
    <textarea
      name="description"
      value={form.description || ""}
      onChange={handleChange}
      className="input w-full min-h-[120px]"
    />
  </div>

  {/* 💰 PRECIOS */}
  <div className="grid md:grid-cols-2 gap-5 text-black">

    <div className="flex flex-col gap-1">
      <label className="label">Precio (USD)</label>
      <input type="number" name="price" value={form.price || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Precio (ARS)</label>
      <input type="number" name="price_ars" value={form.price_ars || ""} onChange={handleChange} className="input" />
    </div>
  </div>

  {/* 📍 UBICACIÓN */}
  <div className="grid md:grid-cols-3 gap-5 text-black">

    <div className="flex flex-col gap-1">
      <label className="label">Dirección</label>
      <input name="address" value={form.address || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Ciudad</label>
      <input name="city" value={form.city || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Provincia</label>
      <input name="province" value={form.province || ""} onChange={handleChange} className="input" />
    </div>
  </div>

  {/* 🏠 FEATURES */}
  <div className="grid md:grid-cols-4 gap-5 text-black">

    <div className="flex flex-col gap-1">
      <label className="label">Ambientes</label>
      <input type="number" name="rooms" value={form.rooms || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Dormitorios</label>
      <input type="number" name="bedrooms" value={form.bedrooms || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Baños</label>
      <input type="number" name="bathrooms" value={form.bathrooms || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Superficie Terreno (m²)</label>
      <input type="number" name="surface_total" value={form.surface_total || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex flex-col gap-1">
      <label className="label">Superficie Cubierta (m²)</label>
      <input type="number" name="surface_covered" value={form.surface_covered || ""} onChange={handleChange} className="input" />
    </div>
    <div className="flex flex-col gap-1">
      <label className="label">Superficie descubierta (m²)</label>
      <input type="number" name="surface_uncovered" value={form.surface_uncovered || ""} onChange={handleChange} className="input" />
    </div>
  </div>

  {/* ⚙️ EXTRA */}
  <div className="grid md:grid-cols-3 gap-5 text-black">

    <div className="flex flex-col gap-1">
      <label className="label">Año de construcción</label>
      <input type="number" name="construction_year" value={form.construction_year || ""} onChange={handleChange} className="input" />
    </div>

    <div className="flex items-center gap-3 mt-6">
      <input type="checkbox" name="garage" checked={form.garage || false} onChange={handleChange} />
      <label className="label">Garage</label>
    </div>

    <div className="flex items-center gap-3 mt-6">
      <input type="checkbox" name="is_featured" checked={form.is_featured || false} onChange={handleChange} />
      <label className="label">Propiedad destacada ⭐</label>
    </div>
  </div>

  {/* 🚀 BOTÓN */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
  >
    {loading ? "Guardando..." : "Guardar cambios"}
  </button>

</form>

        {/* MEDIA */}
<div className="mt-12 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-gray-800">
        Imágenes y videos
      </h2>
      <p className="text-sm text-gray-500">
        {media.length} archivos cargados
      </p>
    </div>
  </div>

  {/* GRID */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
    {media.map((m, index) => (
      <div
        key={m.id ?? `${m.url}-${index}`}
        className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"
      >

        {/* MEDIA */}
        {m.type?.startsWith("image") ? (
  <img
    src={m.url}
    className="w-full h-36 object-cover group-hover:scale-105 transition duration-500"
  />
) : (
 <video
  src={m.url}
  controls
  className="w-full h-36 object-cover"
/>
)}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-3">

          {/* DELETE */}
          <button
            onClick={() => handleDeleteMedia(m.id)}
            className="self-end bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow"
          >
            Eliminar
          </button>

          {/* SET MAIN */}
        <button
  onClick={() => handleSetMain(m.id)}
  className="text-xs bg-white px-2 py-1 rounded text-black"
>
  {settingMainId === m.id
    ? "Actualizando..."
    : m.is_main
    ? "Principal ⭐"
    : "Hacer principal"}
</button>
        </div>

        {/* BADGE PRINCIPAL */}
        {m.is_main && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow">
            ⭐ Principal
          </div>
        )}

      </div>
    ))}
  </div>

  {/* UPLOAD */}
  <div className="mt-8">

    <label className="block text-sm font-semibold text-gray-600 mb-2">
      Subir imagen o video
    </label>

    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">

      <span className="text-gray-500 text-sm">
        Arrastrá archivos o hacé click para subir
      </span>

      <input
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>

    {uploading && (
      <p className="text-sm text-blue-600 mt-3 animate-pulse">
        Subiendo archivo...
      </p>
    )}
  </div>

</div>
      </div>
    </main>
  );
}