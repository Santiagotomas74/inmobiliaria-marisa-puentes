import { Suspense } from "react";
import PropertiesPage from "./PropertiesPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando...</div>}>
      <PropertiesPage />
    </Suspense>
  );
}