// src/hooks/useDocenteMaterias.ts
import { useMemo } from 'react';
import { HorarioUniversidad } from '@/types/horarios';

export function useDocenteMaterias(universidad: HorarioUniversidad | null, nombreDocente: string) {
  const materias = useMemo(() => {
    if (!universidad || !nombreDocente || nombreDocente === "Docente no identificado :/") {
      return [];
    }

    const materiasSet = new Set<string>();

    universidad.facultades.forEach(facultad => {
      facultad.carreras.forEach(carrera => {
        carrera.asignaturas.forEach(asignatura => {
          asignatura.grupos.forEach(grupo => {
            grupo.bloques.forEach(bloque => {
              // Comparar nombres de docentes (normalizado)
              if (bloque.docente.trim().toLowerCase() === nombreDocente.trim().toLowerCase()) {
                materiasSet.add(asignatura.nombre);
              }
            });
          });
        });
      });
    });

    return Array.from(materiasSet).sort();
  }, [universidad, nombreDocente]);

  return materias;
}
