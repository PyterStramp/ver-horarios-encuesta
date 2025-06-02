// src/contexts/UniversidadContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { HorarioUniversidad } from '@/types/horarios';

interface UniversidadContextType {
  universidad: HorarioUniversidad | null;
  setUniversidad: (universidad: HorarioUniversidad | null) => void;
}

const UniversidadContext = createContext<UniversidadContextType | undefined>(undefined);

interface UniversidadProviderProps {
  children: React.ReactNode;
}

export function UniversidadProvider({ children }: UniversidadProviderProps) {
  const [universidad, setUniversidad] = useState<HorarioUniversidad | null>(null);

  return (
    <UniversidadContext.Provider value={{
      universidad,
      setUniversidad,
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
