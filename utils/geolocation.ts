// src/utils/geolocation.ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Fórmula de Haversine para calcular distancia entre dos puntos
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = degreesToRadians(point2.latitude - point1.latitude);
  const dLon = degreesToRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(point1.latitude)) *
    Math.cos(degreesToRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distancia en kilómetros
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

// Clasificar proximidad
export function getProximityLevel(distanceKm: number): 'muy-cerca' | 'cerca' | 'medio' | 'lejos' {
  if (distanceKm < 0.1) return 'muy-cerca';
  if (distanceKm < 0.5) return 'cerca';
  if (distanceKm < 1.0) return 'medio';
  return 'lejos';
}