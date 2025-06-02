// src/contexts/GeolocationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface GeolocationState {
  position: {
    latitude: number;
    longitude: number;
  } | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

interface GeolocationContextType extends GeolocationState {
  requestLocation: () => void;
  clearLocation: () => void;
  hasLocation: boolean;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

interface GeolocationProviderProps {
  children: React.ReactNode;
}

export function GeolocationProvider({ children }: GeolocationProviderProps) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

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
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setState({
          position: newPosition,
          error: null,
          loading: false,
          permissionDenied: false,
        });

        // Guardar en localStorage
        localStorage.setItem('user-location', JSON.stringify({
          ...newPosition,
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

        console.error('❌ Error de geolocalización:', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const clearLocation = () => {
    setState({
      position: null,
      error: null,
      loading: false,
      permissionDenied: false,
    });
    localStorage.removeItem('user-location');
  };

  // Cargar ubicación guardada al iniciar
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
        } else {
          console.log('⏰ Ubicación guardada muy antigua, solicitando nueva');
        }
      } catch (error) {
        console.warn('⚠️ Error cargando ubicación guardada:', error);
      }
    }
  }, []);

  const hasLocation = !!state.position;

  return (
    <GeolocationContext.Provider value={{
      ...state,
      requestLocation,
      clearLocation,
      hasLocation,
    }}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error('useGeolocation debe ser usado dentro de un GeolocationProvider');
  }
  return context;
}
