// src/hooks/useGeolocation.ts
import { useState, useEffect } from 'react';

interface GeolocationState {
  position: {
    latitude: number;
    longitude: number;
  } | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000, // Cache por 1 minuto
  } = options;

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalización no soportada en este navegador',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
          permissionDenied: false,
        });

        // Guardar en localStorage para próximas sesiones
        localStorage.setItem('user-location', JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        }));
      },
      (error) => {
        let errorMessage = 'Error obteniendo ubicación';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }

        setState({
          position: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  };

  // Intentar cargar ubicación guardada al iniciar
  useEffect(() => {
    const savedLocation = localStorage.getItem('user-location');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        const age = Date.now() - parsed.timestamp;
        
        // Si la ubicación guardada tiene menos de 5 minutos, usarla
        if (age < 300000) {
          setState(prev => ({
            ...prev,
            position: {
              latitude: parsed.latitude,
              longitude: parsed.longitude,
            },
          }));
        }
      } catch (error) {
        console.warn('Error cargando ubicación guardada:', error);
      }
    }
  }, []);

  const clearLocation = () => {
    setState({
      position: null,
      error: null,
      loading: false,
      permissionDenied: false,
    });
    localStorage.removeItem('user-location');
  };

  return {
    ...state,
    requestLocation,
    clearLocation,
    hasLocation: !!state.position,
  };
}
