// src/data/edificios.ts
export interface EdificioLocation {
  codigo: string;
  nombre: string;
  latitude: number;
  longitude: number;
  aliases: string[];
}

// Coordenadas reales de los edificios
export const EDIFICIOS_LOCALIZACION: Record<string, EdificioLocation> = {
  'TECHNE': {
    codigo: 'TECHNE',
    nombre: 'Edificio TECHNE',
    latitude: 4.5798467,
    longitude: -74.1587685,
    aliases: ["TECHNE", "TECNE", "TECHNE BUILDING"]
  },
  'BLOQUE 1-2-3-4': {
    codigo: 'BLOQUE 1-2-3-4',
    nombre: 'Bloque 1-2-3-4',
    latitude: 4.5794337,
    longitude: -74.1578378,
    aliases: [
      "BLOQUE 1-2-3-4",
      "BLOQUE 1, 2, 3 Y 4",
      "BLOQUE 1-4",
      "B-1",
      "B-2", 
      "B-3",
      "B-4",
      "BLOQUE 1, 2, 3 Y 4"
    ]
  },
  'BLOQUE 9': {
    codigo: 'BLOQUE 9',
    nombre: 'Bloque 9',
    latitude: 4.5786743,
    longitude: -74.1583200,
    aliases: ["BLOQUE 9", "BLQ 9"]
  },
  'BLOQUE 11-12': {
    codigo: 'BLOQUE 11-12',
    nombre: 'Bloque 11-12',
    latitude: 4.5789464,
    longitude: -74.1581258,
    aliases: ["BLOQUE 11-12", "BLOQUE 11 Y 12"]
  },
  'BLOQUE 5': {
    codigo: 'BLOQUE 5',
    nombre: 'Bloque 5',
    latitude: 4.5793208,
    longitude: -74.1583214,
    aliases: ["BLOQUE 5", "BLQ 5"]
  },
  'BLOQUE 13': {
    codigo: 'BLOQUE 13',
    nombre: 'Bloque 13 - Cafetería',
    latitude: 4.5791225,
    longitude: -74.1577513,
    aliases: ["BLOQUE 13 - CAFETERIA", "BLOQUE 13", "CAFETERIA"]
  }
};

// Función para normalizar nombres de edificios usando el matcher
export function normalizarEdificio(edificioRaw: string): string {
  const edificioLimpio = edificioRaw.toUpperCase().trim();
  
  // Buscar en los aliases de cada edificio
  for (const [codigo, edificio] of Object.entries(EDIFICIOS_LOCALIZACION)) {
    if (edificio.aliases.some(alias => 
      alias.toUpperCase() === edificioLimpio ||
      edificioLimpio.includes(alias.toUpperCase()) ||
      alias.toUpperCase().includes(edificioLimpio)
    )) {
      return codigo;
    }
  }
  
  // Si no se encuentra, devolver el texto original
  return edificioRaw;
}

// Función para obtener la ubicación de un edificio
export function getEdificioLocation(edificioRaw: string): EdificioLocation | null {
  // Primero normalizar el nombre del edificio
  const edificioNormalizado = normalizarEdificio(edificioRaw);
  
  // Buscar en el diccionario de ubicaciones
  return EDIFICIOS_LOCALIZACION[edificioNormalizado] || null;
}

// Función para obtener todos los edificios disponibles
export function getAllEdificios(): EdificioLocation[] {
  return Object.values(EDIFICIOS_LOCALIZACION);
}

// Función para buscar edificio por coordenadas aproximadas (útil para debugging)
export function findEdificioByCoordinates(lat: number, lng: number, tolerance: number = 0.001): EdificioLocation | null {
  for (const edificio of Object.values(EDIFICIOS_LOCALIZACION)) {
    const latDiff = Math.abs(edificio.latitude - lat);
    const lngDiff = Math.abs(edificio.longitude - lng);
    
    if (latDiff <= tolerance && lngDiff <= tolerance) {
      return edificio;
    }
  }
  
  return null;
}

// Función para validar si un edificio existe
export function edificioExiste(edificioRaw: string): boolean {
  return getEdificioLocation(edificioRaw) !== null;
}
