// src/components/dashboard/DashboardLocalizador.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  HorarioUniversidad,
  DocenteActivo,
  BloqueDocentes,
} from "@/types/horarios";
import { HorariosParser } from "@/lib/parser/horarios-parser";
import { HorariosQueries } from "@/lib/queries/horarios-queries";
import TimeHeader from "./TimeHeader";
import BloqueHorario from "./BloqueHorario";
import SubirHorarios from "../upload/SubirHorarios";
import SubirDocentes from "../upload/SubirDocentes";

export default function DashboardLocalizador() {
  const [universidad, setUniversidad] = useState<HorarioUniversidad | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(new Date());
  const [docentesActivos, setDocentesActivos] = useState<BloqueDocentes[]>([]);
  const [proximosDocentes, setProximosDocentes] = useState<BloqueDocentes[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [docentesLoading, setDocentesLoading] = useState(false);
  const [docentesCargados, setDocentesCargados] = useState(false);

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Actualizar docentes cuando cambia el tiempo o los horarios
  useEffect(() => {
    if (universidad) {
      const activos = HorariosQueries.getDocentesActivos(
        universidad,
        currentTime
      );
      const proximos = HorariosQueries.getProximosDocentes(
        universidad,
        currentTime
      );

      setDocentesActivos(HorariosQueries.agruparPorBloques(activos));
      setProximosDocentes(HorariosQueries.agruparPorBloques(proximos));
    }
  }, [universidad, currentTime]);

  const handleDocentesUpload = async (file: File) => {
    setDocentesLoading(true);
    try {
      const content = await file.text();

      // Guardar la lista de docentes en localStorage para el DocenteMatcher
      const docentes = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      localStorage.setItem("docentes-lista", JSON.stringify(docentes));
      setDocentesCargados(true);
    } catch (error) {
      alert("Error al procesar la lista de docentes");
    } finally {
      setDocentesLoading(false);
    }
  };

  const handleHorariosUpload = async (file: File) => {
    if (!docentesCargados) {
      alert("Por favor, carga primero la lista de docentes");
      return;
    }

    setLoading(true);
    try {
      const content = await file.text();

      // Parsear usando nuestro sistema completo
      const parsedUniversidad = await HorariosParser.parseFromText(content);
      setUniversidad(parsedUniversidad);

      // Mostrar estadísticas
      const totalFacultades = parsedUniversidad.facultades.length;
      const totalCarreras = parsedUniversidad.facultades.reduce(
        (acc, f) => acc + f.carreras.length,
        0
      );
      const totalAsignaturas = parsedUniversidad.facultades.reduce(
        (acc, f) =>
          acc + f.carreras.reduce((acc2, c) => acc2 + c.asignaturas.length, 0),
        0
      );
      const totalBloques = parsedUniversidad.facultades.reduce(
        (acc, f) =>
          acc +
          f.carreras.reduce(
            (acc2, c) =>
              acc2 +
              c.asignaturas.reduce(
                (acc3, a) =>
                  acc3 +
                  a.grupos.reduce((acc4, g) => acc4 + g.bloques.length, 0),
                0
              ),
            0
          ),
        0
      );
    } catch (error) {
      alert("Error al procesar el archivo de horarios");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay docentes cargados al iniciar
  useEffect(() => {
    const docentesGuardados = localStorage.getItem("docentes-lista");
    if (docentesGuardados) {
      setDocentesCargados(true);
    }
  }, []);

  if (!universidad) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Localizador de Docentes
          </h1>

          {/* Paso 1: Subir lista de docentes */}
          <SubirDocentes
            onFileUpload={handleDocentesUpload}
            loading={docentesLoading}
            docentesCargados={docentesCargados}
          />

          {/* Paso 2: Subir horarios (solo si ya hay docentes) */}
          <div
            className={`bg-white rounded-lg shadow-md p-6 ${
              !docentesCargados ? "opacity-50" : ""
            }`}
          >
            <SubirHorarios
              onFileUpload={handleHorariosUpload}
              loading={loading}
            />
          </div>

          {/* Instrucciones */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📝 Instrucciones:
            </h3>
            <ol className="text-blue-700 text-sm space-y-1">
              <li>
                1. Sube primero la lista de docentes (nombres limpios, uno por
                línea)
              </li>
              <li>
                2. Luego sube el archivo de horarios (texto copiado del PDF)
              </li>
              <li>
                3. El sistema procesará y limpiará automáticamente los datos
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <TimeHeader currentTime={currentTime} />

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {docentesActivos.length}
              </div>
              <div className="text-sm text-gray-600">Bloques Activos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {proximosDocentes.length}
              </div>
              <div className="text-sm text-gray-600">Próximos Bloques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {docentesActivos.reduce((acc, b) => acc + b.docentes.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Docentes Activos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {proximosDocentes.reduce(
                  (acc, b) => acc + b.docentes.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Próximos Docentes</div>
            </div>
          </div>
        </div>

        {/* Docentes Activos Ahora */}
        {docentesActivos.length > 0 && (
          <div className="mb-8">
            <BloqueHorario
              bloques={docentesActivos}
              tipo="activo"
              titulo="Docentes Activos Ahora"
            />
          </div>
        )}

        {/* Próximos Docentes */}
        {proximosDocentes.length > 0 && (
          <div className="mb-8">
            <BloqueHorario
              bloques={proximosDocentes}
              tipo="proximo"
              titulo="Próximos Docentes (1-3 horas)"
            />
          </div>
        )}

        {docentesActivos.length === 0 && proximosDocentes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">😴</div>
            <h3 className="text-xl font-semibold mb-2">
              No hay docentes activos
            </h3>
            <p className="text-gray-600 mb-4">
              No se encontraron docentes en clases en este momento o en las
              próximas horas.
            </p>
            <p className="text-sm text-gray-500">
              Hora actual: {currentTime.toLocaleTimeString("es-CO")} -{" "}
              {currentTime.toLocaleDateString("es-CO", { weekday: "long" })}
            </p>
          </div>
        )}

        {/* Botón para recargar horarios */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4 text-center">
          <button
            onClick={() => setUniversidad(null)}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md text-lg transition duration-300"
          >
            📁 Cargar Nuevos Horarios
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("docentes-lista");
              setDocentesCargados(false);
              setUniversidad(null);
            }}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md text-lg transition duration-300"
          >
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>
    </div>
  );
}
