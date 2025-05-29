// src/contexts/EncuestasContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface EncuestasContextType {
  docentesEncuestados: Set<string>;
  marcarComoEncuestado: (docente: string) => void;
  desmarcarEncuestado: (docente: string) => void;
  isEncuestado: (docente: string) => boolean;
  obtenerEstadisticas: () => {
    totalEncuestados: number;
    porcentajeCompletado: number;
  };
}

const EncuestasContext = createContext<EncuestasContextType | undefined>(undefined);

interface EncuestasProviderProps {
  children: React.ReactNode;
}

export function EncuestasProvider({ children }: EncuestasProviderProps) {
  const [docentesEncuestados, setDocentesEncuestados] = useState<Set<string>>(new Set());

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    const savedState = localStorage.getItem('docentes-encuestados');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setDocentesEncuestados(new Set(parsedState));
      } catch (error) {
        console.error('Error cargando estado de encuestas:', error);
      }
    }
  }, []);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('docentes-encuestados', JSON.stringify([...docentesEncuestados]));
  }, [docentesEncuestados]);

  const marcarComoEncuestado = (docente: string) => {
    setDocentesEncuestados(prev => {
      const newSet = new Set(prev);
      newSet.add(docente);
      return newSet;
    });
  };

  const desmarcarEncuestado = (docente: string) => {
    setDocentesEncuestados(prev => {
      const newSet = new Set(prev);
      newSet.delete(docente);
      return newSet;
    });
  };

  const isEncuestado = (docente: string): boolean => {
    return docentesEncuestados.has(docente);
  };

  const obtenerEstadisticas = () => {
    return {
      totalEncuestados: docentesEncuestados.size,
      porcentajeCompletado: 0 // Podrías calcular esto si tienes el total de docentes
    };
  };

  return (
    <EncuestasContext.Provider value={{
      docentesEncuestados,
      marcarComoEncuestado,
      desmarcarEncuestado,
      isEncuestado,
      obtenerEstadisticas
    }}>
      {children}
    </EncuestasContext.Provider>
  );
}

export function useEncuestas() {
  const context = useContext(EncuestasContext);
  if (context === undefined) {
    throw new Error('useEncuestas debe ser usado dentro de un EncuestasProvider');
  }
  return context;
}