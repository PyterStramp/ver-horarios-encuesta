// src/hooks/useUniversidadPersistence.tsx
'use client';

import { HorarioUniversidad } from '@/types/horarios';

const STORAGE_KEY = 'universidad-horarios';
const STORAGE_VERSION = '1.0';

interface StoredUniversidad {
  data: HorarioUniversidad;
  timestamp: number;
  version: string;
}

export function useUniversidadPersistence() {
  
  const saveUniversidad = (universidad: HorarioUniversidad) => {
    // ✅ Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      console.warn('saveUniversidad: No está en el navegador');
      return;
    }

    try {
      const dataToStore: StoredUniversidad = {
        data: universidad,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      console.log('✅ Universidad guardada en localStorage');
    } catch (error) {
      console.error('❌ Error guardando universidad:', error);
    }
  };

  const loadUniversidad = (): HorarioUniversidad | null => {
    // ✅ Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      console.warn('loadUniversidad: No está en el navegador');
      return null;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed: StoredUniversidad = JSON.parse(stored);
      
      // Verificar versión
      if (parsed.version !== STORAGE_VERSION) {
        console.log('🔄 Versión de datos obsoleta, limpiando...');
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Verificar si los datos son muy antiguos (ej: más de 7 días)
      const age = Date.now() - parsed.timestamp;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días en ms

      if (age > maxAge) {
        console.log('⏰ Datos muy antiguos, limpiando...');
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      console.log('📚 Universidad cargada desde localStorage');
      return parsed.data;
    } catch (error) {
      console.error('❌ Error cargando universidad:', error);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      return null;
    }
  };

  const clearUniversidad = () => {
    if (typeof window === 'undefined') {
      console.warn('clearUniversidad: No está en el navegador');
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Universidad eliminada del localStorage');
  };

  const getStorageInfo = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed: StoredUniversidad = JSON.parse(stored);
      return {
        timestamp: parsed.timestamp,
        version: parsed.version,
        size: Math.round(stored.length / 1024), // Tamaño en KB
        age: Date.now() - parsed.timestamp
      };
    } catch {
      return null;
    }
  };

  return {
    saveUniversidad,
    loadUniversidad,
    clearUniversidad,
    getStorageInfo
  };
}