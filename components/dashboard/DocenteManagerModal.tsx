// src/components/dashboard/DocentesManagerModal.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useUniversidad } from "@/contexts/UniversidadContext";
import { useEncuestas } from "@/contexts/EncuestasContext";
import ExportImportModal from "./ExportImportModal";

interface DocenteInfo {
  nombre: string;
  materias: string[];
  horarios: {
    dia: string;
    horaInicio: number;
    horaFin: number;
    salon: string;
    edificio: string;
    asignatura: string;
  }[];
}

interface DocentesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocentesManagerModal({
  isOpen,
  onClose,
}: DocentesManagerModalProps) {
  const { universidad } = useUniversidad();
  const {
    isEncuestado,
    marcarComoEncuestado,
    desmarcarEncuestado,
    docentesEncuestados,
    obtenerEstadisticas,
  } = useEncuestas();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "encuestados" | "pendientes"
  >("todos");
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string | null>(
    null
  );
  const [showExportModal, setShowExportModal] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(false); // En desktop no necesitamos el toggle
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Extraer todos los docentes únicos del sistema
  const todosLosDocentes = useMemo(() => {
    if (!universidad) return [];

    const docentesMap = new Map<string, DocenteInfo>();

    universidad.facultades.forEach((facultad) => {
      facultad.carreras.forEach((carrera) => {
        carrera.asignaturas.forEach((asignatura) => {
          asignatura.grupos.forEach((grupo) => {
            grupo.bloques.forEach((bloque) => {
              const nombreDocente = bloque.docente.trim();

              if (nombreDocente === "Docente no identificado :/") return;

              if (!docentesMap.has(nombreDocente)) {
                docentesMap.set(nombreDocente, {
                  nombre: nombreDocente,
                  materias: [],
                  horarios: [],
                });
              }

              const docente = docentesMap.get(nombreDocente)!;

              // Agregar materia si no existe
              if (!docente.materias.includes(asignatura.nombre)) {
                docente.materias.push(asignatura.nombre);
              }

              // Agregar horario
              docente.horarios.push({
                dia: bloque.dia,
                horaInicio: bloque.horaInicio,
                horaFin: bloque.horaFin,
                salon: bloque.salon,
                edificio: bloque.edificio,
                asignatura: asignatura.nombre,
              });
            });
          });
        });
      });
    });

    // Ordenar materias y horarios
    docentesMap.forEach((docente) => {
      docente.materias.sort();
      docente.horarios.sort((a, b) => {
        const dias = [
          "LUNES",
          "MARTES",
          "MIERCOLES",
          "JUEVES",
          "VIERNES",
          "SABADO",
          "DOMINGO",
        ];
        const diaA = dias.indexOf(a.dia);
        const diaB = dias.indexOf(b.dia);
        if (diaA !== diaB) return diaA - diaB;
        return a.horaInicio - b.horaInicio;
      });
    });

    return Array.from(docentesMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [universidad]);

  // Filtrar docentes según búsqueda y estado
  const docentesFiltrados = useMemo(() => {
    let resultado = todosLosDocentes;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (docente) =>
          docente.nombre.toLowerCase().includes(termino) ||
          docente.materias.some((materia) =>
            materia.toLowerCase().includes(termino)
          )
      );
    }

    // Filtro por estado
    switch (filtroEstado) {
      case "encuestados":
        resultado = resultado.filter((docente) => isEncuestado(docente.nombre));
        break;
      case "pendientes":
        resultado = resultado.filter(
          (docente) => !isEncuestado(docente.nombre)
        );
        break;
    }

    return resultado;
  }, [todosLosDocentes, busqueda, filtroEstado, isEncuestado]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = todosLosDocentes.length;
    const encuestados = todosLosDocentes.filter((d) =>
      isEncuestado(d.nombre)
    ).length;
    const pendientes = total - encuestados;
    const porcentaje = total > 0 ? Math.round((encuestados / total) * 100) : 0;

    return { total, encuestados, pendientes, porcentaje };
  }, [todosLosDocentes, isEncuestado]);

  const handleFiltroChange = (nuevoFiltro: typeof filtroEstado) => {
    setFiltroEstado(nuevoFiltro);
    
    // ✅ Verificar si el docente seleccionado sigue estando en la nueva lista filtrada
    if (docenteSeleccionado) {
      const filtrarConNuevoEstado = (docentes: DocenteInfo[]) => {
        switch (nuevoFiltro) {
          case 'encuestados':
            return docentes.filter(d => isEncuestado(d.nombre));
          case 'pendientes':
            return docentes.filter(d => !isEncuestado(d.nombre));
          default:
            return docentes;
        }
      };

      // Obtener la nueva lista filtrada
      let nuevaListaFiltrada = todosLosDocentes;
      
      // Aplicar filtro de búsqueda si existe
      if (busqueda.trim()) {
        const termino = busqueda.toLowerCase().trim();
        nuevaListaFiltrada = nuevaListaFiltrada.filter(docente => 
          docente.nombre.toLowerCase().includes(termino) ||
          docente.materias.some(materia => materia.toLowerCase().includes(termino))
        );
      }
      
      // Aplicar filtro de estado
      nuevaListaFiltrada = filtrarConNuevoEstado(nuevaListaFiltrada);
      
      // ✅ Si el docente seleccionado no está en la nueva lista, limpiar selección
      const docenteSigueEnLista = nuevaListaFiltrada.some(d => d.nombre === docenteSeleccionado);
      if (!docenteSigueEnLista) {
        setDocenteSeleccionado(null);
        console.log(`🔄 Docente "${docenteSeleccionado}" no está en el filtro "${nuevoFiltro}", limpiando selección`);
      }
    }
  };

  // ✅ Función mejorada para cambiar búsqueda con validación
  const handleBusquedaChange = (nuevaBusqueda: string) => {
    setBusqueda(nuevaBusqueda);
    
    // ✅ Verificar si el docente seleccionado sigue estando en los resultados de búsqueda
    if (docenteSeleccionado && nuevaBusqueda.trim()) {
      const termino = nuevaBusqueda.toLowerCase().trim();
      const docenteActual = todosLosDocentes.find(d => d.nombre === docenteSeleccionado);
      
      if (docenteActual) {
        const coincideBusqueda = 
          docenteActual.nombre.toLowerCase().includes(termino) ||
          docenteActual.materias.some(materia => materia.toLowerCase().includes(termino));
        
        if (!coincideBusqueda) {
          setDocenteSeleccionado(null);
          console.log(`🔍 Docente "${docenteSeleccionado}" no coincide con la búsqueda, limpiando selección`);
        }
      }
    }
  };  

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header - Mejorado para móvil */}
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                Gestión de Docentes
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {stats.total} docentes • {stats.encuestados} encuestados •{" "}
                {stats.pendientes} pendientes ({stats.porcentaje}%)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Controles - Stack vertical en móvil */}
          <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
            <div className="space-y-4">
              {/* Búsqueda */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o materia..."
                    value={busqueda}
                    onChange={(e) => handleBusquedaChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Filtros - Responsive grid */}
              <div className="grid grid-cols-3 gap-2 md:flex md:gap-2">
                <button
                  onClick={() => handleFiltroChange('todos')}
                  className={`px-2 py-2 md:px-4 rounded-lg text-xs md:text-sm transition-colors truncate ${
                    filtroEstado === "todos"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Todos ({stats.total})
                </button>
                <button
                  onClick={() => handleFiltroChange('pendientes')}
                  className={`px-2 py-2 md:px-4 rounded-lg text-xs md:text-sm transition-colors truncate ${
                    filtroEstado === "pendientes"
                      ? "bg-red-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Pendientes ({stats.pendientes})
                </button>
                <button
                  onClick={() => handleFiltroChange("encuestados")}
                  className={`px-2 py-2 md:px-4 rounded-lg text-xs md:text-sm transition-colors truncate ${
                    filtroEstado === "encuestados"
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Encuestados ({stats.encuestados})
                </button>
              </div>

              {/* Botón exportar/importar 
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
              >
                <span className="mr-2">📤</span>
                Exportar/Importar
              </button>
              */}

              {/* Barra de progreso */}
              <div>
                <div className="flex justify-between text-xs md:text-sm mb-2">
                  <span className="text-gray-600">Progreso de encuestas</span>
                  <span className="font-medium">{stats.porcentaje}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                  <div
                    className="bg-green-500 h-2 md:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal - Layout diferente según dispositivo */}
          {isMobile ? (
            /* Layout móvil: Todo apilado verticalmente */
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Toggle para mostrar lista en móvil */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    {docenteSeleccionado && docentesFiltrados.some(d => d.nombre === docenteSeleccionado)
                      ? docenteSeleccionado 
                      : 'Seleccionar docente'}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${
                      showSidebar ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Lista desplegable en móvil */}
              {showSidebar && (
                <div className="border-b border-gray-200 bg-gray-50 max-h-60 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-3 text-sm">
                      Docentes ({docentesFiltrados.length})
                    </h3>

                    {docentesFiltrados.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No se encontraron docentes</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {docentesFiltrados.map((docente, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setDocenteSeleccionado(docente.nombre);
                              setShowSidebar(false); // Cerrar lista al seleccionar
                            }}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              docenteSeleccionado === docente.nombre
                                ? "bg-blue-100 border-2 border-blue-300"
                                : "bg-white hover:bg-gray-100 border-2 border-transparent"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {docente.nombre}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {docente.materias.length} materia
                                  {docente.materias.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <div className="ml-2 flex items-center">
                                <span
                                  className={`w-3 h-3 rounded-full ${
                                    isEncuestado(docente.nombre)
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Panel de detalles en móvil */}
              <div className="flex-1 overflow-y-auto">
                {docenteSeleccionado ? (
                  <DocenteDetailPanelMobile
                    docente={
                      docentesFiltrados.find(
                        (d) => d.nombre === docenteSeleccionado
                      )!
                    }
                    isEncuestado={isEncuestado(docenteSeleccionado)}
                    onToggleEncuestado={() => {
                      if (isEncuestado(docenteSeleccionado)) {
                        desmarcarEncuestado(docenteSeleccionado);
                      } else {
                        marcarComoEncuestado(docenteSeleccionado);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">👨‍🏫</div>
                      <p className="text-sm">
                        Toca el botón de arriba para seleccionar un docente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Layout desktop: Igual que antes */
            <div className="flex-1 overflow-hidden flex">
              {/* Lista lateral en desktop */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Docentes ({docentesFiltrados.length})
                  </h3>

                  {docentesFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <p>No se encontraron docentes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {docentesFiltrados.map((docente, index) => (
                        <div
                          key={index}
                          onClick={() => setDocenteSeleccionado(docente.nombre)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            docenteSeleccionado === docente.nombre
                              ? "bg-blue-50 border-2 border-blue-200"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {docente.nombre}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {docente.materias.length} materia
                                {docente.materias.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="ml-2 flex items-center">
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  isEncuestado(docente.nombre)
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de detalles en desktop */}
              <div className="flex-1 overflow-y-auto">
                {docenteSeleccionado ? (
                  <DocenteDetailPanel
                    docente={
                      docentesFiltrados.find(
                        (d) => d.nombre === docenteSeleccionado
                      )!
                    }
                    isEncuestado={isEncuestado(docenteSeleccionado)}
                    onToggleEncuestado={() => {
                      if (isEncuestado(docenteSeleccionado)) {
                        desmarcarEncuestado(docenteSeleccionado);
                      } else {
                        marcarComoEncuestado(docenteSeleccionado);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">👨‍🏫</div>
                      <p>Selecciona un docente para ver los detalles</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de exportar/importar
      {showExportModal && (
        <ExportImportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          docentesEncuestados={docentesEncuestados}
        />
      )}
      */}
    </>
  );
}

// Componente de detalles optimizado para móvil
function DocenteDetailPanelMobile({
  docente,
  isEncuestado,
  onToggleEncuestado,
}: {
  docente: DocenteInfo;
  isEncuestado: boolean;
  onToggleEncuestado: () => void;
}) {

  if (!docente) return null;
  // Igual que DocenteDetailPanel pero con ajustes para móvil
  const formatHora = (hora: number) => {
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  const groupHorariosByDay = () => {
    const groupedHorarios = docente.horarios.reduce((acc, horario) => {
      if (!acc[horario.dia]) {
        acc[horario.dia] = [];
      }
      acc[horario.dia].push(horario);
      return acc;
    }, {} as Record<string, typeof docente.horarios>);

    return groupedHorarios;
  };

  const horariosAgrupados = groupHorariosByDay();

  return (
    <div className="p-4">
      {/* Header del docente - Más compacto en móvil */}
      <div className="mb-6">
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {docente.nombre}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {docente.materias.length} materia
              {docente.materias.length !== 1 ? "s" : ""} •{" "}
              {docente.horarios.length} bloque
              {docente.horarios.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={onToggleEncuestado}
            className={`w-full px-4 py-3 rounded-lg transition-colors font-medium ${
              isEncuestado
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isEncuestado ? "✅ Encuestado" : "📋 Marcar como Encuestado"}
          </button>
        </div>
      </div>

      {/* Materias - Grid más compacto en móvil */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">
          📚 Materias que dicta
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {docente.materias.map((materia, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <span className="text-blue-800 font-medium text-sm">
                {materia}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Horarios - Más compactos en móvil */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">
          🗓️ Horarios de clase
        </h4>
        <div className="space-y-3">
          {Object.entries(horariosAgrupados).map(([dia, horarios]) => (
            <div key={dia} className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-gray-800 mb-2 text-sm capitalize">
                {dia.toLowerCase()}
              </h5>
              <div className="space-y-2">
                {horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {horario.asignatura}
                      </div>
                      <div className="text-xs text-gray-600 flex justify-between">
                        <span>
                          {formatHora(horario.horaInicio)} -{" "}
                          {formatHora(horario.horaFin)}
                        </span>
                        <span>
                          {horario.edificio} • {horario.salon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar detalles del docente
function DocenteDetailPanel({
  docente,
  isEncuestado,
  onToggleEncuestado,
}: {
  docente: DocenteInfo;
  isEncuestado: boolean;
  onToggleEncuestado: () => void;
}) {
  const formatHora = (hora: number) => {
    return `${hora.toString().padStart(2, "0")}:00`;
  };

  const groupHorariosByDay = () => {
    const groupedHorarios = docente.horarios.reduce((acc, horario) => {
      if (!acc[horario.dia]) {
        acc[horario.dia] = [];
      }
      acc[horario.dia].push(horario);
      return acc;
    }, {} as Record<string, typeof docente.horarios>);

    return groupedHorarios;
  };

  const horariosAgrupados = groupHorariosByDay();

  return (
    <div className="p-6">
      {/* Header del docente */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{docente.nombre}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {docente.materias.length} materia
            {docente.materias.length !== 1 ? "s" : ""} •{" "}
            {docente.horarios.length} bloque
            {docente.horarios.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={onToggleEncuestado}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isEncuestado
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isEncuestado ? "✅ Encuestado" : "📋 Marcar como Encuestado"}
        </button>
      </div>

      {/* Materias */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">
          📚 Materias que dicta
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docente.materias.map((materia, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <span className="text-blue-800 font-medium text-sm">
                {materia}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Horarios */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">
          🗓️ Horarios de clase
        </h4>
        <div className="space-y-4">
          {Object.entries(horariosAgrupados).map(([dia, horarios]) => (
            <div key={dia} className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3 capitalize">
                {dia.toLowerCase()}
              </h5>
              <div className="space-y-2">
                {horarios.map((horario, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">
                          {horario.asignatura}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatHora(horario.horaInicio)} -{" "}
                          {formatHora(horario.horaFin)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {horario.edificio} • {horario.salon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
