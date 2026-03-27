"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Smartphone, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);

      await Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        text:  "El email o la contraseña no son válidos.",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Intentar nuevamente",
      });

      return;
    }

    if (data.role === "admin") {
      Swal.fire({
        icon: "success",
        title: "Bienvenido administrador",
        text: "Accediendo al panel de administración.",
        confirmButtonText: "Ir al panel",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        window.location.href = "/administracion/dashboard";
      });

    } else {
      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        text: "Bienvenido nuevamente.",
        confirmButtonText: "Ir a la tienda",
        confirmButtonColor: "#2563eb",
      }).then(() => {
        window.location.href = "/";
      });
    }

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error del servidor",
      text: "No pudimos iniciar sesión. Intenta nuevamente.",
      confirmButtonColor: "#ef4444",
    });

  } finally {
    setLoading(false);
  }
};

  return (
  <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden tracking-tight">
    
    {/* 🟦 LADO IZQUIERDO */}
    <div className="relative w-full md:w-1/2 h-[40vh] md:h-screen flex flex-col justify-center p-8 md:p-20 text-white overflow-hidden">
      
      {/* 🌆 FONDO */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600')"
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-900/70 to-black/90 backdrop-blur-sm" />

      {/* CONTENIDO */}
      <div className="relative z-10 space-y-6">

        <span className="font-black text-2xl tracking-[0.2em] uppercase">
          InmoPanel
        </span>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-black leading-tight">
            Panel de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-600">
              Administración
            </span>
          </h2>

          <p className="text-white/70 text-lg max-w-md">
            Gestioná propiedades, solicitudes de clientes y contenido de tu inmobiliaria desde un solo lugar.
          </p>
        </div>

        {/* FEATURES */}
        <div className="space-y-3 text-sm text-white/80 mt-6">
          <p>🏠 Administración de propiedades</p>
          <p>📩 Gestión de consultas y solicitudes</p>
          <p>⭐ Destacar propiedades</p>
          <p>📊 Control total del contenido</p>
        </div>

      </div>
    </div>

    {/* ⚪ LADO DERECHO */}
    <div className="w-full md:w-1/2 min-h-[60vh] md:h-screen bg-white flex flex-col justify-center items-center p-8 md:p-24 relative">
      
      <div className="w-full max-w-md space-y-10">

        {/* HEADER */}
        <div className="text-center md:text-left">
          <h3 className="text-3xl font-black text-gray-900 uppercase">
            Acceso Administrador
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Ingresá tus credenciales para acceder al panel
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Email
            </label>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={18} />
              <input
                type="email"
                placeholder="admin@inmobiliaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-700"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Contraseña
            </label>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-700"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Ingresar al panel
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* DECOR */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-[120px] opacity-40" />
    </div>
  </div>
);
}