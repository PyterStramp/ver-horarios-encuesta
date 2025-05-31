// src/components/dashboard/BloqueHorario.tsx
"use client";

import { useState, useEffect } from "react";
import { BloqueDocentes, DocenteActivo } from "@/types/horarios";
import { useEncuestas } from "@/contexts/EncuestasContext";
import DocenteCard from "./DocenteCard";
import { useGeolocation } from '@/contexts/GeolocationContext';;
import { getEdificioLocation } from "@/data/edificios";
import { calculateDistance } from "@/utils/geolocation";
import GeolocationControl from "./GeolocationControl";

// Hook para detectar dispositivo
function useDeviceType() {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
      } else if (width < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  return deviceType;
}

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
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroActual, setFiltroActual] = useState<
    "todos" | "pendientes" | "encuestados"
  >("todos");

  const { position } = useGeolocation();
  const [locationEnabled, setLocationEnabled] = useState(false);

  const deviceType = useDeviceType();

  const DOCENTES_POR_PAGINA = deviceType === "mobile" ? 4 : 8;

  if (bloques.length === 0) {
    return null;
  }

  // Función para ordenar docentes: pendientes primero
  const ordenarDocentes = (docentes: DocenteActivo[]) => {
    return [...docentes].sort((a, b) => {
      const aEncuestado = isEncuestado(a.docente);
      const bEncuestado = isEncuestado(b.docente);

      // Primero: pendientes antes que encuestados
      if (aEncuestado !== bEncuestado) {
        return aEncuestado ? 1 : -1;
      }

      // Segundo: si tenemos ubicación, ordenar por proximidad
      if (position && locationEnabled) {
        const aLocation = getEdificioLocation(a.edificio);
        const bLocation = getEdificioLocation(b.edificio);

        if (aLocation && bLocation) {
          const aDistance = calculateDistance(position, aLocation);
          const bDistance = calculateDistance(position, bLocation);

          if (Math.abs(aDistance - bDistance) > 0.01) {
            // Diferencia significativa
            return aDistance - bDistance;
          }
        }
      }

      // Tercero: ordenar alfabéticamente
      return a.docente.localeCompare(b.docente);
    });
  };

  // Filtrar docentes según el filtro actual
  const filtrarDocentes = (docentes: DocenteActivo[]) => {
    switch (filtroActual) {
      case "pendientes":
        return docentes.filter((d) => !isEncuestado(d.docente));
      case "encuestados":
        return docentes.filter((d) => isEncuestado(d.docente));
      default:
        return docentes;
    }
  };

  // Procesar todos los docentes de todos los bloques
  const todosLosDocentes = bloques.flatMap((bloque) => bloque.docentes);
  const docentesOrdenados = ordenarDocentes(todosLosDocentes);
  const docentesFiltrados = filtrarDocentes(docentesOrdenados);

  // Paginación
  const totalPaginas = Math.ceil(
    docentesFiltrados.length / DOCENTES_POR_PAGINA
  );
  const indiceInicio = (paginaActual - 1) * DOCENTES_POR_PAGINA;
  const indiceFin = indiceInicio + DOCENTES_POR_PAGINA;
  const docentesPaginados = docentesFiltrados.slice(indiceInicio, indiceFin);

  // useEffect para reordenar cuando cambie la geolocalización
  useEffect(() => {
    if (position && locationEnabled) {
      // Forzar reordenamiento manteniendo la página actual si es posible
      const nuevasPaginas = Math.ceil(
        docentesFiltrados.length / DOCENTES_POR_PAGINA
      );
      if (paginaActual > nuevasPaginas && nuevasPaginas > 0) {
        setPaginaActual(1);
      }
      // El reordenamiento ocurre automáticamente por la recalculación de docentesOrdenados
    }
  }, [
    position,
    locationEnabled,
    docentesFiltrados.length,
    DOCENTES_POR_PAGINA,
    paginaActual,
  ]);

  // useEffect para resetear página cuando cambia el dispositivo
  useEffect(() => {
    setPaginaActual(1);
  }, [deviceType, DOCENTES_POR_PAGINA]);

  // Resetear página cuando cambia el filtro
  const handleFiltroChange = (nuevoFiltro: typeof filtroActual) => {
    setFiltroActual(nuevoFiltro);
    setPaginaActual(1);
  };

  const getHeaderIcon = () => {
    return tipo === "activo" ? "🟢" : "🔵";
  };

  const getHeaderColor = () => {
    return tipo === "activo" ? "text-green-800" : "text-blue-800";
  };

  // Estadísticas
  const totalDocentes = todosLosDocentes.length;
  const docentesEncuestados = todosLosDocentes.filter((d) =>
    isEncuestado(d.docente)
  ).length;
  const docentesPendientes = totalDocentes - docentesEncuestados;

  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-4 ${getHeaderColor()}`}>
        {getHeaderIcon()} {titulo}
      </h2>

      {/* Control de geolocalización */}
      <div className="mb-4">
        <GeolocationControl onLocationChange={setLocationEnabled} />
      </div>

      {/* Controles de filtro y estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFiltroChange("todos")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === "todos"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              👥 Todos ({totalDocentes})
            </button>
            <button
              onClick={() => handleFiltroChange("pendientes")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === "pendientes"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              📋 Pendientes ({docentesPendientes})
            </button>
            <button
              onClick={() => handleFiltroChange("encuestados")}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === "encuestados"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              ✅ Encuestados ({docentesEncuestados})
            </button>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Progreso:{" "}
              {totalDocentes > 0
                ? Math.round((docentesEncuestados / totalDocentes) * 100)
                : 0}
              %
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    totalDocentes > 0
                      ? (docentesEncuestados / totalDocentes) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Info de filtro actual */}

        <div className="mt-3 text-sm text-gray-500">
          Mostrando {docentesFiltrados.length} docentes
          {locationEnabled && position && (
            <span className="text-green-600 ml-2">
              • Ordenado por proximidad
            </span>
          )}
          {filtroActual !== "todos" && ` (filtrado por: ${filtroActual})`}
          {docentesFiltrados.length > DOCENTES_POR_PAGINA &&
            ` - Página ${paginaActual} de ${totalPaginas}`}
          <span className="text-blue-600 ml-2">
            •{" "}
            {deviceType === "mobile"
              ? "📱 Móvil"
              : deviceType === "tablet"
              ? "📱 Tablet"
              : "💻 Desktop"}
            ({DOCENTES_POR_PAGINA} por página)
          </span>
        </div>
      </div>

      {/* Grid de docentes */}
      {docentesPaginados.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docentesPaginados.map((docente, index) => (
              <DocenteCard
                key={`${docente.docente}-${docente.asignatura}-${index}`}
                docente={docente}
                tipo={tipo}
              />
            ))}
          </div>

          {/* ✅ Paginación mejorada para móvil */}
          {totalPaginas > 1 && (
            <div className="mt-6">
              {/* Versión móvil */}
              <div className="block md:hidden">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() =>
                      setPaginaActual(Math.max(1, paginaActual - 1))
                    }
                    disabled={paginaActual === 1}
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    ←
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-600">
                    {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() =>
                      setPaginaActual(Math.min(totalPaginas, paginaActual + 1))
                    }
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Versión desktop/tablet */}
              <div className="hidden md:flex justify-center items-center gap-2">
                <button
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ← Anterior
                </button>

                <div className="flex gap-1">
                  {/* Mostrar páginas inteligentemente */}
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((pagina) => {
                      // Mostrar siempre primera y última página
                      if (pagina === 1 || pagina === totalPaginas) return true;
                      // Mostrar páginas cerca de la actual
                      return Math.abs(pagina - paginaActual) <= 1;
                    })
                    .map((pagina, index, array) => {
                      // Agregar "..." si hay saltos
                      const elements = [];

                      if (index > 0 && pagina - array[index - 1] > 1) {
                        elements.push(
                          <span
                            key={`ellipsis-${pagina}`}
                            className="px-2 text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }

                      elements.push(
                        <button
                          key={pagina}
                          onClick={() => setPaginaActual(pagina)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            pagina === paginaActual
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          {pagina}
                        </button>
                      );

                      return elements;
                    })
                    .flat()}
                </div>

                <button
                  onClick={() =>
                    setPaginaActual(Math.min(totalPaginas, paginaActual + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-2">
            {filtroActual === "pendientes"
              ? "📋"
              : filtroActual === "encuestados"
              ? "✅"
              : "👥"}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No hay docentes {filtroActual === "todos" ? "" : filtroActual}
          </h3>
          <p className="text-gray-600">
            {filtroActual === "encuestados"
              ? "Aún no has encuestado a ningún docente"
              : filtroActual === "pendientes"
              ? "¡Excelente! Todos los docentes han sido encuestados"
              : "No se encontraron docentes para mostrar"}
          </p>
        </div>
      )}
    </div>
  );
}
