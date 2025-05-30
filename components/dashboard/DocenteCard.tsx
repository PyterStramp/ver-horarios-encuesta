// src/components/dashboard/DocenteCard.tsx
'use client';

import { DocenteActivo } from '@/types/horarios';
import { useEncuestas } from '@/contexts/EncuestasContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getEdificioLocation } from '@/data/edificios';
import { calculateDistance, formatDistance, getProximityLevel } from '@/utils/geolocation';

interface DocenteCardProps {
  docente: DocenteActivo;
  tipo: 'activo' | 'proximo';
}

export default function DocenteCard({ docente, tipo }: DocenteCardProps) {
  const { isEncuestado, marcarComoEncuestado, desmarcarEncuestado } = useEncuestas();
  const { position } = useGeolocation();

  const yaEncuestado = isEncuestado(docente.docente);

  const edificioLocation = getEdificioLocation(docente.edificio);
  const distancia = position && edificioLocation 
    ? calculateDistance(position, edificioLocation)
    : null;

  const proximityLevel = distancia ? getProximityLevel(distancia) : null;  

  const handleMarcarEncuestado = () => {
    if (yaEncuestado) {
      desmarcarEncuestado(docente.docente);
    } else {
      marcarComoEncuestado(docente.docente);
    }
  };

  const getCardClass = () => {
    let baseClass = 'border-2 rounded-lg p-3 transition-all duration-200';
    
    if (yaEncuestado) {
      return `${baseClass} bg-gray-100 border-gray-300`;
    }

    // Añadir indicador visual de proximidad
    if (proximityLevel) {
      const proximityBorder = {
        'muy-cerca': 'border-green-400 shadow-lg shadow-green-100',
        'cerca': 'border-blue-400 shadow-md shadow-blue-100',
        'medio': 'border-yellow-400 shadow-md shadow-yellow-100',
        'lejos': 'border-gray-400 shadow-md',
      }[proximityLevel];

      return `${baseClass} bg-white ${proximityBorder}`;
    }

    return `${baseClass} bg-white ${
      tipo === 'activo' 
        ? 'border-green-300 shadow-md' 
        : 'border-blue-300 shadow-md'
    }`;
  };


  const getDistanceBadge = () => {
    if (!distancia) return null;

    const badgeColors = {
      'muy-cerca': 'bg-green-100 text-green-800',
      'cerca': 'bg-blue-100 text-blue-800',
      'medio': 'bg-yellow-100 text-yellow-800',
      'lejos': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        badgeColors[proximityLevel!]
      }`}>
        📍 {formatDistance(distancia)}
      </span>
    );
  };  

  return (
    <div className={`border-2 rounded-lg p-3 ${getCardClass()} transition-all duration-200`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${yaEncuestado ? 'text-gray-500' : 'text-gray-800'}`}>
            {docente.docente ? docente.docente : "Docente no identificado :/"}
          </h4>
          <p className={`text-xs ${yaEncuestado ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            📚 {docente.asignatura}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full ${
            yaEncuestado 
              ? 'bg-gray-200 text-gray-600' 
              : tipo === 'activo' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
          }`}>
            {tipo === 'activo' ? 'AHORA' : 'PRÓXIMO'}
          </span>

          {getDistanceBadge()}
        </div>
      </div>
      
      <div className={`text-xs ${yaEncuestado ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
        <div className="flex items-center mb-1">
          <span className="mr-1">📍</span>
          <span>{docente.edificio}</span>
        </div>
        <div className="flex items-center mb-1">
          <span className="mr-1">🚪</span>
          <span>{docente.salon}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">⏰</span>
          <span>{docente.horaInicio}:00 - {docente.horaFin}:00</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleMarcarEncuestado}
          className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
            yaEncuestado
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {yaEncuestado ? '✅ Encuestado' : '📋 Marcar Encuestado'}
        </button>
        
        {!yaEncuestado && (
          <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
            📍 Ir
          </button>
        )}
      </div>
    </div>
  );
}