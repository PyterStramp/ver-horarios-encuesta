// src/lib/queries/horarios-queries.ts
import { HorarioUniversidad, DocenteActivo, BloqueDocentes, DiaSemana } from '@/types/horarios';

export class HorariosQueries {
  
  static getDocentesActivos(universidad: HorarioUniversidad, timestamp: Date): DocenteActivo[] {
    const diaActual = this.getDiaSemana(timestamp);
    const horaActual = timestamp.getHours();

    const docentes: DocenteActivo[] = [];

    universidad.facultades.forEach(facultad => {
      facultad.carreras.forEach(carrera => {
        carrera.asignaturas.forEach(asignatura => {
          asignatura.grupos.forEach(grupo => {
            grupo.bloques.forEach(bloque => {
              // Verificar si el docente está activo ahora
              if (bloque.dia === diaActual && 
                  bloque.horaInicio <= horaActual && 
                  bloque.horaFin > horaActual) {
                
                docentes.push({
                  docente: bloque.docente,
                  asignatura: asignatura.nombre,
                  salon: bloque.salon,
                  edificio: bloque.edificio,
                  horaInicio: bloque.horaInicio,
                  horaFin: bloque.horaFin
                });
              }
            });
          });
        });
      });
    });

    return docentes;
  }

  static getProximosDocentes(universidad: HorarioUniversidad, timestamp: Date): DocenteActivo[] {
    const diaActual = this.getDiaSemana(timestamp);
    const horaActual = timestamp.getHours();
    const proximaHora = horaActual + 1;

    const docentes: DocenteActivo[] = [];

    universidad.facultades.forEach(facultad => {
      facultad.carreras.forEach(carrera => {
        carrera.asignaturas.forEach(asignatura => {
          asignatura.grupos.forEach(grupo => {
            grupo.bloques.forEach(bloque => {
              // Docentes que empiezan en la próxima hora
              if (bloque.dia === diaActual && 
                  bloque.horaInicio >= proximaHora && 
                  bloque.horaInicio <= proximaHora + 2) {
                
                docentes.push({
                  docente: bloque.docente,
                  asignatura: asignatura.nombre,
                  salon: bloque.salon,
                  edificio: bloque.edificio,
                  horaInicio: bloque.horaInicio,
                  horaFin: bloque.horaFin
                });
              }
            });
          });
        });
      });
    });

    return docentes;
  }

  static agruparPorBloques(docentes: DocenteActivo[]): BloqueDocentes[] {
    const bloques = new Map<string, DocenteActivo[]>();

    docentes.forEach(docente => {
      const bloqueKey = `${docente.horaInicio}-${docente.horaFin}`;
      
      if (!bloques.has(bloqueKey)) {
        bloques.set(bloqueKey, []);
      }
      
      bloques.get(bloqueKey)!.push(docente);
    });

    return Array.from(bloques.entries())
      .map(([horario, docentes]) => ({
        horario,
        docentes: docentes.sort((a, b) => a.docente.localeCompare(b.docente))
      }))
      .sort((a, b) => {
        const aHora = parseInt(a.horario.split('-')[0]);
        const bHora = parseInt(b.horario.split('-')[0]);
        return aHora - bHora;
      });
  }

  private static getDiaSemana(date: Date): DiaSemana {
    const dias: DiaSemana[] = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return dias[date.getDay()];
  }
}