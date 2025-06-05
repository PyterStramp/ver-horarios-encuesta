// src/components/dashboard/GeolocationControl.tsx
"use client";

import { useEffect } from "react";
import { useGeolocation } from "@/contexts/GeolocationContext";

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
    hasLocation,
  } = useGeolocation();

  useEffect(() => {
    onLocationChange(hasLocation);
  }, [hasLocation, position, onLocationChange]);

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
              Para ordenar por proximidad, permite el acceso a tu ubicación en
              la configuración del navegador.
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
                {position && (
                  <span className="ml-1 font-mono">
                    ({position.latitude.toFixed(4)},{" "}
                    {position.longitude.toFixed(4)})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={clearLocation}
            className="bg-red-400 hover:bg-red-500 disabled:bg-red-300 text-white px-3 py-1 rounded text-xs transition-colors"
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
              Permite acceso a tu ubicación para mostrar docentes más cercanos
              primero
            </p>
          </div>
        </div>
        <button
          onClick={requestLocation}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Obteniendo...
            </span>
          ) : (
            "Activar"
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
