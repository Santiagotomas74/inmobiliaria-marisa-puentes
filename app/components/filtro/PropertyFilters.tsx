"use client";

export default function PropertyFilters({ filters, setFilters }: any) {
  const inputStyles =
    "w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all";

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24 h-fit">

      <h3 className="text-lg font-semibold mb-6 text-gray-800">
        Filtrar propiedades
      </h3>

      <div className="space-y-5">

        {/* 🏷 Operación */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Operación
          </label>
          <select
            value={filters.operation}
            onChange={(e) =>
              setFilters({ ...filters, operation: e.target.value })
            }
            className={inputStyles}
          >
            <option value="">Todas</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        {/* 📍 Ciudad */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Localidad
          </label>
          <input
            placeholder="Ej: Palermo"
            value={filters.city}
            onChange={(e) =>
              setFilters({ ...filters, city: e.target.value })
            }
            className={inputStyles}
          />
        </div>

        {/* 🏠 Tipo */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
            className={inputStyles}
          >
            <option value="">Todos</option>
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="terreno">Terreno</option>
          </select>
        </div>

        {/* 🛏 Ambientes */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Ambientes
          </label>
          <select
            value={filters.rooms}
            onChange={(e) =>
              setFilters({ ...filters, rooms: e.target.value })
            }
            className={inputStyles}
          >
            <option value="">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* 💰 Precio */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Min
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
              className={inputStyles}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Max
            </label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
              className={inputStyles}
            />
          </div>
        </div>

        {/* 💱 Moneda */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">
            Moneda
          </label>
          <select
            value={filters.currency}
            onChange={(e) =>
              setFilters({ ...filters, currency: e.target.value })
            }
            className={`${inputStyles} font-bold text-indigo-600 bg-indigo-50`}
          >
            <option value="usd">USD</option>
            <option value="ars">ARS</option>
          </select>
        </div>

        {/* 🔘 Limpiar */}
        <button
          onClick={() =>
            setFilters({
              operation: "",
              city: "",
              type: "",
              rooms: "",
              minPrice: "",
              maxPrice: "",
              currency: "usd",
            })
          }
          className="w-full mt-2 text-sm text-red-500 hover:underline"
        >
          Limpiar filtros
        </button>

      </div>
    </div>
  );
}