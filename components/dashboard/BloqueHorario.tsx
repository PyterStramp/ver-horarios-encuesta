// src/components/dashboard/BloqueHorario.tsx
"use client";

import { BloqueDocentes, DocenteActivo } from "@/types/horarios";
import DocenteCard from "./DocenteCard";
import { useEncuestas } from "@/contexts/EncuestasContext";

interface BloqueHorarioProps {
  bloques: BloqueDocentes[];
  tipo: "activo" | "proximo";
  titulo: string;
}

export default function BloqueHorario({
  bloques,
  tipo,
  titulo,
}: BloqueHorarioProps) {
  const { isEncuestado } = useEncuestas();
  if (bloques.length === 0) {
    return null;
  }

  const getHeaderIcon = () => {
    return tipo === "activo" ? "🟢" : "🔵";
  };

  const getHeaderColor = () => {
    return tipo === "activo" ? "text-green-800" : "text-blue-800";
  };

  // Función para obtener los edificios únicos en un bloque
  const getEdificiosUnicos = (docentes: DocenteActivo[]) => {
    const edificios = [
      ...new Set(docentes.map((d) => d.edificio).filter(Boolean)),
    ];
    return edificios.length > 0 ? edificios : ["N/A"];
  };

  // Función para obtener el día actual (ya que BloqueDocentes no tiene dia)
  const getDiaActual = () => {
    const dias = [
      "DOMINGO",
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
    ];
    return dias[new Date().getDay()];
  };

  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-4 ${getHeaderColor()}`}>
        {getHeaderIcon()} {titulo}
      </h2>

      <div className="space-y-6">
        {bloques.map((bloque, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            {/* Header del bloque */}
            <div className="border-b border-gray-200 pb-3 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tipo === "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    ⏰ {bloque.horario}
                  </div>

                  <div className="text-sm text-gray-600">
                    📅 {getDiaActual()}
                  </div>
                </div>

                <div className="mt-2 md:mt-0 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    👥 {bloque.docentes.length} docente
                    {bloque.docentes.length !== 1 ? "s" : ""}
                  </span>

                  <span className="text-sm text-gray-500">
                    🏢 {getEdificiosUnicos(bloque.docentes).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid de docentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bloque.docentes.map((docente, docenteIndex) => (
                <DocenteCard key={docenteIndex} docente={docente} tipo={tipo} />
              ))}
            </div>

            {/* Footer del bloque con estadísticas actualizadas */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📊 Total: {bloque.docentes.length} docentes</span>
                <span>
                  ✅ Encuestados:{" "}
                  {
                    bloque.docentes.filter((d) => isEncuestado(d.docente))
                      .length
                  }
                </span>
                <span>
                  📋 Pendientes:{" "}
                  {
                    bloque.docentes.filter((d) => !isEncuestado(d.docente))
                      .length
                  }
                </span>
                <span>
                  📚 Asignaturas:{" "}
                  {
                    [...new Set(bloque.docentes.map((d) => d.asignatura))]
                      .length
                  }
                </span>
                <span>
                  🚪 Salones:{" "}
                  {[...new Set(bloque.docentes.map((d) => d.salon))].length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen total actualizado */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div
              className={`text-xl font-bold ${
                tipo === "activo" ? "text-green-600" : "text-blue-600"
              }`}
            >
              {bloques.length}
            </div>
            <div className="text-xs text-gray-600">Bloques Horarios</div>
          </div>

          <div>
            <div className="text-xl font-bold text-purple-600">
              {bloques.reduce((acc, bloque) => acc + bloque.docentes.length, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Docentes</div>
          </div>

          <div>
            <div className="text-xl font-bold text-green-600">
              {bloques.reduce(
                (acc, bloque) =>
                  acc +
                  bloque.docentes.filter((d) => isEncuestado(d.docente)).length,
                0
              )}
            </div>
            <div className="text-xs text-gray-600">Encuestados</div>
          </div>

          <div>
            <div className="text-xl font-bold text-red-600">
              {bloques.reduce(
                (acc, bloque) =>
                  acc +
                  bloque.docentes.filter((d) => !isEncuestado(d.docente))
                    .length,
                0
              )}
            </div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
