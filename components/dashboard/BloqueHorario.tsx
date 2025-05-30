// src/components/dashboard/BloqueHorario.tsx
"use client";

import { useState } from 'react';
import { BloqueDocentes, DocenteActivo } from '@/types/horarios';
import { useEncuestas } from '@/contexts/EncuestasContext';
import DocenteCard from './DocenteCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getEdificioLocation } from '@/data/edificios';
import { calculateDistance } from '@/utils/geolocation';
import GeolocationControl from './GeolocationControl';

interface BloqueHorarioProps {
  bloques: BloqueDocentes[];
  tipo: 'activo' | 'proximo';
  titulo: string;
}

export default function BloqueHorario({ bloques, tipo, titulo }: BloqueHorarioProps) {
  const { isEncuestado } = useEncuestas();
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtroActual, setFiltroActual] = useState<'todos' | 'pendientes' | 'encuestados'>('todos');

  const { position } = useGeolocation();
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  const DOCENTES_POR_PAGINA = 4;

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
          
          if (Math.abs(aDistance - bDistance) > 0.01) { // Diferencia significativa
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
      case 'pendientes':
        return docentes.filter(d => !isEncuestado(d.docente));
      case 'encuestados':
        return docentes.filter(d => isEncuestado(d.docente));
      default:
        return docentes;
    }
  };

  // Procesar todos los docentes de todos los bloques
  const todosLosDocentes = bloques.flatMap(bloque => bloque.docentes);
  const docentesOrdenados = ordenarDocentes(todosLosDocentes);
  const docentesFiltrados = filtrarDocentes(docentesOrdenados);
  
  // Paginación
  const totalPaginas = Math.ceil(docentesFiltrados.length / DOCENTES_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * DOCENTES_POR_PAGINA;
  const indiceFin = indiceInicio + DOCENTES_POR_PAGINA;
  const docentesPaginados = docentesFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambia el filtro
  const handleFiltroChange = (nuevoFiltro: typeof filtroActual) => {
    setFiltroActual(nuevoFiltro);
    setPaginaActual(1);
  };

  const getHeaderIcon = () => {
    return tipo === 'activo' ? '🟢' : '🔵';
  };

  const getHeaderColor = () => {
    return tipo === 'activo' ? 'text-green-800' : 'text-blue-800';
  };

  // Estadísticas
  const totalDocentes = todosLosDocentes.length;
  const docentesEncuestados = todosLosDocentes.filter(d => isEncuestado(d.docente)).length;
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
          <div className="flex gap-2">
            <button
              onClick={() => handleFiltroChange('todos')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === 'todos'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              👥 Todos ({totalDocentes})
            </button>
            <button
              onClick={() => handleFiltroChange('pendientes')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === 'pendientes'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              📋 Pendientes ({docentesPendientes})
            </button>
            <button
              onClick={() => handleFiltroChange('encuestados')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filtroActual === 'encuestados'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              ✅ Encuestados ({docentesEncuestados})
            </button>
          </div>

          {/* Progreso */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Progreso: {totalDocentes > 0 ? Math.round((docentesEncuestados / totalDocentes) * 100) : 0}%
            </div>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${totalDocentes > 0 ? (docentesEncuestados / totalDocentes) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Info de filtro actual */}
        <div className="mt-3 text-sm text-gray-500">
          Mostrando {docentesFiltrados.length} docentes
          {locationEnabled && position && (
            <span className="text-green-600 ml-2">• Ordenado por proximidad</span>
          )}
          {filtroActual !== 'todos' && ` (filtrado por: ${filtroActual})`}
          {docentesFiltrados.length > DOCENTES_POR_PAGINA && ` - Página ${paginaActual} de ${totalPaginas}`}
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

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Anterior
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                  <button
                    key={pagina}
                    onClick={() => setPaginaActual(pagina)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      pagina === paginaActual
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {pagina}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-4xl mb-2">
            {filtroActual === 'pendientes' ? '📋' : filtroActual === 'encuestados' ? '✅' : '👥'}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No hay docentes {filtroActual === 'todos' ? '' : filtroActual}
          </h3>
          <p className="text-gray-600">
            {filtroActual === 'encuestados' 
              ? 'Aún no has encuestado a ningún docente'
              : filtroActual === 'pendientes'
                ? '¡Excelente! Todos los docentes han sido encuestados'
                : 'No se encontraron docentes para mostrar'
            }
          </p>
        </div>
      )}
    </div>
  );
}