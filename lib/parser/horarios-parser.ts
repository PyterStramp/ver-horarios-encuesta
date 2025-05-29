// src/lib/parser/horarios-parser.ts
import {
  HorarioUniversidad,
  Facultad,
  Carrera,
  Asignatura,
  Grupo,
  BloqueHorario,
  DiaSemana,
} from "@/types/horarios";
import { DocenteMatcher } from "./matchers/DocenteMatcher";
import { EdificioMatcher } from "./matchers/EdificioMatcher";
import { sanitizeHorarioText } from "./text-sanitizer";

export class HorariosParser {
  private docenteMatcher: DocenteMatcher;
  private edificioMatcher: EdificioMatcher;

  constructor() {
    this.docenteMatcher = new DocenteMatcher();
    this.edificioMatcher = new EdificioMatcher();
  }

  static async parseFromText(content: string): Promise<HorarioUniversidad> {
    const parser = new HorariosParser();
    await parser.docenteMatcher.loadDocentes();

    return parser.parse(content);
  }

  private async parse(content: string): Promise<HorarioUniversidad> {
    // PASO 1: Sanitizar el texto antes de procesar
    const sanitizedContent = sanitizeHorarioText(content);

    const lines = sanitizedContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const universidad: HorarioUniversidad = {
      facultades: [],
      fechaActualizacion: new Date(),
    };

    let currentFacultad: Facultad | null = null;
    let currentCarrera: Carrera | null = null;
    let currentAsignatura: Asignatura | null = null;
    let currentGrupo: Grupo | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      try {
        // Detectar nueva carrera
        if (line.startsWith("PROYECTO CURRICULAR")) {
          // CERRAR TODO ANTES DE NUEVA CARRERA
          this.cerrarTodosLosDatos(
            universidad,
            currentFacultad,
            currentCarrera,
            currentAsignatura,
            currentGrupo
          );

          currentCarrera = this.parseCarrera(line);
          currentFacultad = this.getOrCreateFacultad(
            universidad,
            "FACULTAD TECNOLÓGICA"
          );
          currentAsignatura = null;
          currentGrupo = null;

          continue;
        }

        // Detectar nueva asignatura
        if (line.startsWith("ESPACIO ACADEMICO")) {
          this.cerrarAsignaturaYGrupo(
            currentCarrera,
            currentAsignatura,
            currentGrupo
          );

          currentAsignatura = this.parseAsignatura(line);
          currentGrupo = null;

          continue;
        }

        // Detectar nuevo grupo
        if (line.startsWith("GRP.")) {
          this.cerrarGrupo(currentAsignatura, currentGrupo);

          const nextLine = lines[i + 1];
          currentGrupo = this.parseGrupo(line, nextLine);
          i++; // Saltar la línea de INSCRITOS

          continue;
        }

        // Detectar línea de horario
        if (this.isHorarioLine(line) && currentGrupo && currentAsignatura) {
          const bloque = this.parseBloqueHorario(
            line,
            currentAsignatura.codigo
          );
          if (bloque) {
            currentGrupo.bloques.push(bloque);
          }
        }
      } catch (error) {
        console.warn(`Error procesando línea ${i}: ${line}`, error);
      }
    }

    // Guardar últimos datos
    this.cerrarTodosLosDatos(
      universidad,
      currentFacultad,
      currentCarrera,
      currentAsignatura,
      currentGrupo
    );

    return universidad;
  }

  private parseCarrera(line: string): Carrera {
    const match = line.match(/PROYECTO CURRICULAR (.+)/);
    const nombre = match ? match[1].trim() : line;
    const codigo = this.extractCodigoCarrera(nombre);

    return {
      nombre,
      codigo,
      asignaturas: [],
    };
  }

  private parseAsignatura(line: string): Asignatura {
    const nombre = line.replace("ESPACIO ACADEMICO ", "").trim();

    return {
      codigo: "", // Se asignará cuando encontremos los bloques
      nombre,
      grupos: [],
    };
  }

  private parseGrupo(grupoLine: string, inscritosLine: string): Grupo {
    const grupoMatch = grupoLine.match(/GRP\. (.+)/);
    const inscritosMatch = inscritosLine.match(/INSCRITOS (\d+)/);

    return {
      numero: grupoMatch ? grupoMatch[1].trim() : "",
      inscritos: inscritosMatch ? parseInt(inscritosMatch[1]) : 0,
      bloques: [],
    };
  }

  private parseBloqueHorario(
    line: string,
    asignaturaCode?: string
  ): BloqueHorario | null {
    try {
      const parts = line.split(/\s+/);

      // Extraer código de asignatura (primer número)
      const codigo = parts[0];
      if (!asignaturaCode) {
        // Asignar código a la asignatura si no lo tiene
        asignaturaCode = codigo;
      }

      // Extraer día y horario
      const dia = this.parseDia(parts);
      const horario = this.parseHorario(parts);

      if (!dia || !horario) return null;

      // Encontrar donde empieza "TECNOLOGICA"
      const tecnologicaIndex = parts.findIndex((p) => p === "TECNOLOGICA");
      if (tecnologicaIndex === -1) return null;

      // Todo después de TECNOLOGICA es ubicación + docente
      const locationAndTeacher = parts.slice(tecnologicaIndex).join(" ");

      // Usar EdificioMatcher para extraer ubicación
      const location = this.edificioMatcher.extractLocation(locationAndTeacher);

      // Usar DocenteMatcher para extraer docente
      const parteDocente = this.extractTeacherPart(locationAndTeacher);
      const docenteLimpio = this.docenteMatcher.findDocente(parteDocente);

      return {
        codigoAsignatura: asignaturaCode,
        dia,
        horaInicio: horario.inicio,
        horaFin: horario.fin,
        sede: "TECNOLOGICA",
        edificio: location.edificio,
        salon: location.salon,
        docente: docenteLimpio, // Fallback al nombre corrupto si no se encuentra match
      };
    } catch (error) {
      console.warn("Error parsing bloque horario:", line, error);
      return null;
    }
  }

  private parseDia(parts: string[]): DiaSemana | null {
    const dias: DiaSemana[] = [
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
      "DOMINGO",
    ];

    for (const part of parts) {
      if (dias.includes(part as DiaSemana)) {
        return part as DiaSemana;
      }
    }
    return null;
  }

  private parseHorario(
    parts: string[]
  ): { inicio: number; fin: number } | null {
    for (const part of parts) {
      const match = part.match(/^(\d+)-(\d+)$/);
      if (match) {
        return {
          inicio: parseInt(match[1]),
          fin: parseInt(match[2]),
        };
      }
    }
    return null;
  }

  /**
   * Extraer solo la parte que corresponde al docente
   */
  private extractTeacherPart(text: string): string {
    const words = text.split(" ");

    // Palabras que NO son parte del nombre del docente
    const locationWords = [
      "TECNOLOGICA",
      "BLOQUE",
      "AULA",
      "SALA",
      "LABORATORIO",
      "DE",
      "Y",
      "TECHNE",
      "OPTICA",
      "MODERNA",
      "BASES",
      "DATOS",
      "AVANZADAS",
      "SISTEMAS",
      "DISTRIBUIDOS",
      "REDES",
      "TELEMATICA",
      "INGENIERIA",
      "SOFTWARE",
      "INFORMATICA",
      "CIENCIAS",
      "BASICAS",
      "FISICA",
      "MECANICA",
      "ELECTROMAGNETISMO",
      "SIMULACION",
      "REALIDAD",
      "VIRTUAL",
      "INTELIGENCIA",
      "ARTIFICIAL",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "B-1",
      "B-2",
      "B-3",
      "MULTIPLE",
      "CAFETERIA",
    ];

    // Encontrar donde terminan las palabras de ubicación
    let teacherStartIndex = -1;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Si la palabra NO es de ubicación y parece ser nombre
      if (!locationWords.includes(word) && this.looksLikeName(word)) {
        // Verificar que las siguientes palabras también parezcan nombres
        if (i < words.length - 1 && this.looksLikeName(words[i + 1])) {
          teacherStartIndex = i;
          break;
        }
      }
    }

    if (teacherStartIndex === -1) {
      // Fallback: tomar las últimas 3-4 palabras
      return words.slice(-4).join(" ");
    }

    const parteDocente = words.slice(teacherStartIndex).join(" ");

    return parteDocente;
  }

  private looksLikeName(word: string): boolean {
    return (
      word.length >= 3 && word === word.toUpperCase() && /^[A-ZÑ?]+$/.test(word)
    ); // Solo letras mayúsculas, Ñ y ?
  }

  private isHorarioLine(line: string): boolean {
    return (
      /^\d+\s+/.test(line) &&
      /(LUNES|MARTES|MIERCOLES|JUEVES|VIERNES|SABADO)/.test(line) &&
      /\d+-\d+/.test(line) &&
      /TECNOLOGICA/.test(line)
    );
  }

  private extractCodigoCarrera(nombre: string): string {
    if (nombre.includes("TELEMATICA")) return "678";
    if (nombre.includes("SISTEMATIZACION")) return "578";
    return "000";
  }

  private getOrCreateFacultad(
    universidad: HorarioUniversidad,
    nombre: string
  ): Facultad {
    let facultad = universidad.facultades.find((f) => f.nombre === nombre);

    if (!facultad) {
      facultad = { nombre, carreras: [] };
      universidad.facultades.push(facultad);
    }

    return facultad;
  }

  private cerrarGrupo(asignatura: Asignatura | null, grupo: Grupo | null) {
    if (grupo && asignatura) {
      asignatura.grupos.push(grupo);
    }
  }

  private cerrarAsignaturaYGrupo(
    carrera: Carrera | null,
    asignatura: Asignatura | null,
    grupo: Grupo | null
  ) {
    // Cerrar grupo actual
    this.cerrarGrupo(asignatura, grupo);

    // Cerrar asignatura actual
    if (asignatura && carrera) {
      // Asignar código si no lo tiene
      if (!asignatura.codigo && asignatura.grupos.length > 0) {
        if (grupo?.bloques[0].codigoAsignatura) {
          asignatura.codigo = grupo?.bloques[0].codigoAsignatura;
        } else {
          asignatura.codigo = `${carrera.codigo}-${asignatura.nombre.substring(
            0,
            3
          )}`;
        }
      }
      carrera.asignaturas.push(asignatura);
    }
  }

  private cerrarTodosLosDatos(
    universidad: HorarioUniversidad,
    facultad: Facultad | null,
    carrera: Carrera | null,
    asignatura: Asignatura | null,
    grupo: Grupo | null
  ) {
    // Cerrar asignatura y grupo
    this.cerrarAsignaturaYGrupo(carrera, asignatura, grupo);

    // Cerrar carrera
    if (carrera && facultad) {
      facultad.carreras.push(carrera);
    }
  }
}
