// src/components/dashboard/GeolocationControl.tsx
'use client';

import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface GeolocationControlProps {
  onLocationChange: (hasLocation: boolean) => void;
}

export default function GeolocationControl({ onLocationChange }: GeolocationControlProps) {
  const { 
    position, 
    error, 
    loading, 
    permissionDenied, 
    requestLocation, 
    clearLocation, 
    hasLocation 
  } = useGeolocation();

  // Notificar cambios al componente padre
  React.useEffect(() => {
    onLocationChange(hasLocation);
  }, [hasLocation, onLocationChange]);

  if (permissionDenied) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <div className="text-yellow-600 mr-2">⚠️</div>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">
              Ubicación denegada
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Para ordenar por proximidad, permite el acceso a tu ubicación en la configuración del navegador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasLocation) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">📍</div>
            <div>
              <p className="text-sm text-green-800 font-medium">
                Ubicación activa
              </p>
              <p className="text-xs text-green-700">
                Ordenando por proximidad
              </p>
            </div>
          </div>
          <button
            onClick={clearLocation}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Desactivar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-start">
          <div className="text-blue-600 mr-2">📍</div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">
              Ordenar por proximidad
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Permite acceso a tu ubicación para mostrar docentes más cercanos primero
            </p>
          </div>
        </div>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          {loading ? 'Obteniendo...' : 'Activar'}
        </button>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}