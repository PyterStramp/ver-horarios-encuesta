// src/types/horarios.ts
export interface HorarioUniversidad {
  facultades: Facultad[];
  fechaActualizacion: Date;
}

export interface Facultad {
  nombre: string;
  carreras: Carrera[];
}

export interface Carrera {
  nombre: string;
  codigo: string;
  asignaturas: Asignatura[];
}

export interface Asignatura {
  codigo: string;
  nombre: string;
  grupos: Grupo[];
}

export interface Grupo {
  numero: string;
  inscritos: number;
  bloques: BloqueHorario[];
}

export interface BloqueHorario {
  codigoAsignatura: string;
  dia: DiaSemana;
  horaInicio: number;
  horaFin: number;
  sede: string;
  edificio: string;
  salon: string;
  docente: string;
}

export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

// Para el dashboard
export interface DocenteActivo {
  docente: string;
  asignatura: string;
  salon: string;
  edificio: string;
  horaInicio: number;
  horaFin: number;
  yaEncuestado?: boolean;
}

export interface BloqueDocentes {
  horario: string; // "6-8", "8-10", etc.
  docentes: DocenteActivo[];
}