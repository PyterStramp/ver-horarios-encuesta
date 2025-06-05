// src/contexts/UniversidadContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HorarioUniversidad } from '@/types/horarios';
import { useUniversidadPersistence } from '@/hooks/useUniversidadPersistence';

interface UniversidadContextType {
  universidad: HorarioUniversidad | null;
  setUniversidad: (universidad: HorarioUniversidad | null) => void;
  clearAllData: () => void;
  storageInfo: {
    timestamp: number;
    version: string;
    size: number;
    age: number;
  } | null;
}

const UniversidadContext = createContext<UniversidadContextType | undefined>(undefined);

interface UniversidadProviderProps {
  children: React.ReactNode;
}

export function UniversidadProvider({ children }: UniversidadProviderProps) {
  const [universidad, setUniversidadState] = useState<HorarioUniversidad | null>(null);
  const { saveUniversidad, loadUniversidad, clearUniversidad, getStorageInfo } = useUniversidadPersistence();

  // Cargar universidad al iniciar
  useEffect(() => {
    const storedUniversidad = loadUniversidad();
    if (storedUniversidad) {
      setUniversidadState(storedUniversidad);
    }
  }, []);

  const setUniversidad = (newUniversidad: HorarioUniversidad | null) => {
    setUniversidadState(newUniversidad);
    
    if (newUniversidad) {
      saveUniversidad(newUniversidad);
    } else {
      clearUniversidad();
    }
  };

  const clearAllData = () => {
    // Limpiar universidad
    clearUniversidad();
    setUniversidadState(null);
    
    // Limpiar lista de docentes
    localStorage.removeItem('docentes-lista');
    
    // Limpiar encuestas
    localStorage.removeItem('docentes-encuestados');
    
    // Limpiar ubicación
    localStorage.removeItem('user-location');
    
    console.log('🧹 Todos los datos limpiados completamente');
  };

  const storageInfo = getStorageInfo();

  return (
    <UniversidadContext.Provider value={{
      universidad,
      setUniversidad,
      clearAllData,
      storageInfo,
    }}>
      {children}
    </UniversidadContext.Provider>
  );
}

export function useUniversidad() {
  const context = useContext(UniversidadContext);
  if (context === undefined) {
    throw new Error('useUniversidad debe ser usado dentro de un UniversidadProvider');
  }
  return context;
}
