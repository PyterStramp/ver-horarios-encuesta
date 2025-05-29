// src/lib/parser/matchers/EdificioMatcher.ts

interface EdificioInfo {
  nombre: string;
  aliases: string[];
  salones: SalonInfo[];
}

interface SalonInfo {
  nombre: string;
  aliases: string[];
  capacidad?: number;
}

export class EdificioMatcher {
  private edificios: EdificioInfo[] = [];

  constructor() {
    this.loadEdificios();
  }

  private loadEdificios() {
    // Configuración de edificios basada en el patrón del PDF
    this.edificios = [
      {
        nombre: "TECHNE",
        aliases: ["TECHNE", "TECNE", "TECHNE BUILDING"],
        salones: [
          {
            nombre: "LABORATORIO OPTICA Y MODERNA",
            aliases: [
              "LAB OPTICA",
              "LABORATORIO OPTICA",
              "LABORATORIO OPTICA Y MODERNA",
            ],
          },
          {
            nombre: "LABORATORIO DE BASES DE DATOS AVANZADAS",
            aliases: [
              "LAB BASES DATOS",
              "LABORATORIO BASES",
              "LABORATORIO DE BASES DE DATOS AVANZADAS",
            ],
          },
          {
            nombre: "LABORATORIO DE SISTEMAS DISTRIBUIDOS",
            aliases: [
              "LAB SISTEMAS",
              "LABORATORIO SISTEMAS",
              "LABORATORIO DE SISTEMAS DISTRIBUIDOS",
            ],
          },
          {
            nombre: "LABORATORIO REDES Y TELEMATICA",
            aliases: [
              "LAB REDES",
              "LABORATORIO REDES",
              "LABORATORIO REDES Y TELEMATICA",
            ],
          },
          {
            nombre: "LABORATORIO DE INGENIERIA DE SOFTWARE",
            aliases: [
              "LAB SOFTWARE",
              "LABORATORIO SOFTWARE",
              "LABORATORIO DE INGENIERIA DE SOFTWARE",
            ],
          },
          {
            nombre: "LABORATORIO FISICA MECANICA 1",
            aliases: ["LAB FISICA 1", "LABORATORIO FISICA MECANICA 1"],
          },
          {
            nombre: "LABORATORIO FISICA MECANICA 3",
            aliases: ["LAB FISICA 3", "LABORATORIO FISICA MECANICA 3"],
          },
          {
            nombre: "LABORATORIO DE ELECTROMAGNETISMO/CIENCIAS BASICAS",
            aliases: [
              "LAB ELECTROMAGNETISMO",
              "LABORATORIO DE ELECTROMAGNETISMO /CIENCIAS BASICAS",
            ],
          },
          {
            nombre: "LABORATORIO DE SIMULACION Y REALIDAD VIRTUAL",
            aliases: [
              "LAB SIMULACION",
              "LABORATORIO DE SIMULACION Y REALIDAD VIRTUAL",
            ],
          },
          {
            nombre: "LABORATORIO DE INTELIGENCIA ARTIFICIAL",
            aliases: ["LAB IA", "LABORATORIO DE INTELIGENCIA ARTIFICIAL"],
          },
          {
            nombre: "SALA DE INFORMATICA 1",
            aliases: ["SALA INFO 1", "INFORMATICA 1"],
          },
          {
            nombre: "SALA DE INFORMATICA 2",
            aliases: ["SALA INFO 2", "INFORMATICA 2"],
          },
          {
            nombre: "SALA DE INFORMATICA 3",
            aliases: ["SALA INFO 3", "INFORMATICA 3"],
          },
          {
            nombre: "SALA DE SOFTWARE DE CIENCIAS BASICAS",
            aliases: [
              "SALA SOFTWARE",
              "SOFTWARE CIENCIAS",
              "SALA DE SOFTWARE DE CIENCIAS BASICAS",
            ],
          },
        ],
      },
      {
        nombre: "BLOQUE 1-2-3-4",
        aliases: [
          "BLOQUE 1, 2, 3 Y 4",
          "BLOQUE 1-4",
          "B-1",
          "B-2",
          "B-3",
          "BLOQUE 1, 2, 3 Y 4",
        ],
        salones: [
          // B-1
          { nombre: "B-1 AULA 101", aliases: ["B-1 AULA 101", "AULA 101 B-1"] },
          { nombre: "B-1 AULA 102", aliases: ["B-1 AULA 102", "AULA 102 B-1"] },
          { nombre: "B-1 AULA 103", aliases: ["B-1 AULA 103", "AULA 103 B-1"] },
          { nombre: "B-1 AULA 104", aliases: ["B-1 AULA 104", "AULA 104 B-1"] },
          { nombre: "B-1 AULA 201", aliases: ["B-1 AULA 201", "AULA 201 B-1"] },
          { nombre: "B-1 AULA 202", aliases: ["B-1 AULA 202", "AULA 202 B-1"] },
          { nombre: "B-1 AULA 203", aliases: ["B-1 AULA 203", "AULA 203 B-1"] },
          { nombre: "B-1 AULA 204", aliases: ["B-1 AULA 204", "AULA 204 B-1"] },
          { nombre: "B-1 AULA 301", aliases: ["B-1 AULA 301", "AULA 301 B-1"] },
          { nombre: "B-1 AULA 302", aliases: ["B-1 AULA 302", "AULA 302 B-1"] },
          { nombre: "B-1 AULA 303", aliases: ["B-1 AULA 303", "AULA 303 B-1"] },
          { nombre: "B-1 AULA 304", aliases: ["B-1 AULA 304", "AULA 304 B-1"] },
          { nombre: "B-1 AULA 401", aliases: ["B-1 AULA 401", "AULA 401 B-1"] },
          { nombre: "B-1 AULA 402", aliases: ["B-1 AULA 402", "AULA 402 B-1"] },
          { nombre: "B-1 AULA 403", aliases: ["B-1 AULA 403", "AULA 403 B-1"] },
          { nombre: "B-1 AULA 404", aliases: ["B-1 AULA 404", "AULA 404 B-1"] },
          { nombre: "B-1 AULA 501", aliases: ["B-1 AULA 501", "AULA 501 B-1"] },
          { nombre: "B-1 AULA 502", aliases: ["B-1 AULA 502", "AULA 502 B-1"] },
          { nombre: "B-1 AULA 503", aliases: ["B-1 AULA 503", "AULA 503 B-1"] },
          { nombre: "B-1 AULA 504", aliases: ["B-1 AULA 504", "AULA 504 B-1"] }, 

          // B-2
          { nombre: "B-2 AULA 101", aliases: ["B-2 AULA 101", "AULA 101 B-2"] },
          { nombre: "B-2 AULA 102", aliases: ["B-2 AULA 102", "AULA 102 B-2"] },
          { nombre: "B-2 AULA 103", aliases: ["B-2 AULA 103", "AULA 103 B-2"] },
          { nombre: "B-2 AULA 104", aliases: ["B-2 AULA 104", "AULA 104 B-2"] },
          { nombre: "B-2 AULA 201", aliases: ["B-2 AULA 201", "AULA 201 B-2"] },
          { nombre: "B-2 AULA 202", aliases: ["B-2 AULA 202", "AULA 202 B-2"] },
          { nombre: "B-2 AULA 203", aliases: ["B-2 AULA 203", "AULA 203 B-2"] },
          { nombre: "B-2 AULA 204", aliases: ["B-2 AULA 204", "AULA 204 B-2"] },
          { nombre: "B-2 AULA 301", aliases: ["B-2 AULA 301", "AULA 301 B-2"] },
          { nombre: "B-2 AULA 302", aliases: ["B-2 AULA 302", "AULA 302 B-2"] },
          { nombre: "B-2 AULA 303", aliases: ["B-2 AULA 303", "AULA 303 B-2"] },
          { nombre: "B-2 AULA 304", aliases: ["B-2 AULA 304", "AULA 304 B-2"] },
          { nombre: "B-2 AULA 401", aliases: ["B-2 AULA 401", "AULA 401 B-2"] },
          { nombre: "B-2 AULA 402", aliases: ["B-2 AULA 402", "AULA 402 B-2"] },
          { nombre: "B-2 AULA 403", aliases: ["B-2 AULA 403", "AULA 403 B-2"] },
          { nombre: "B-2 AULA 404", aliases: ["B-2 AULA 404", "AULA 404 B-2"] },
          { nombre: "B-2 AULA 501", aliases: ["B-2 AULA 501", "AULA 501 B-2"] },
          { nombre: "B-2 AULA 502", aliases: ["B-2 AULA 502", "AULA 502 B-2"] },
          { nombre: "B-2 AULA 503", aliases: ["B-2 AULA 503", "AULA 503 B-2"] },
          { nombre: "B-2 AULA 504", aliases: ["B-2 AULA 504", "AULA 504 B-2"] },            

          // B-3
          { nombre: "B-3 AULA 101", aliases: ["B-3 AULA 101", "AULA 101 B-3"] },
          { nombre: "B-3 AULA 102", aliases: ["B-3 AULA 102", "AULA 102 B-3"] },
          { nombre: "B-3 AULA 103", aliases: ["B-3 AULA 103", "AULA 103 B-3"] },
          { nombre: "B-3 AULA 104", aliases: ["B-3 AULA 104", "AULA 104 B-3"] },
          { nombre: "B-3 AULA 201", aliases: ["B-3 AULA 201", "AULA 201 B-3"] },
          { nombre: "B-3 AULA 202", aliases: ["B-3 AULA 202", "AULA 202 B-3"] },
          { nombre: "B-3 AULA 203", aliases: ["B-3 AULA 203", "AULA 203 B-3"] },
          { nombre: "B-3 AULA 204", aliases: ["B-3 AULA 204", "AULA 204 B-3"] },
          { nombre: "B-3 AULA 301", aliases: ["B-3 AULA 301", "AULA 301 B-3"] },
          { nombre: "B-3 AULA 302", aliases: ["B-3 AULA 302", "AULA 302 B-3"] },
          { nombre: "B-3 AULA 303", aliases: ["B-3 AULA 303", "AULA 303 B-3"] },
          { nombre: "B-3 AULA 304", aliases: ["B-3 AULA 304", "AULA 304 B-3"] },
          { nombre: "B-3 AULA 401", aliases: ["B-3 AULA 401", "AULA 401 B-3"] },
          { nombre: "B-3 AULA 402", aliases: ["B-3 AULA 402", "AULA 402 B-3"] },
          { nombre: "B-3 AULA 403", aliases: ["B-3 AULA 403", "AULA 403 B-3"] },
          { nombre: "B-3 AULA 404", aliases: ["B-3 AULA 404", "AULA 404 B-3"] },
          { nombre: "B-3 AULA 501", aliases: ["B-3 AULA 501", "AULA 501 B-3"] },
          { nombre: "B-3 AULA 502", aliases: ["B-3 AULA 502", "AULA 502 B-3"] },
          { nombre: "B-3 AULA 503", aliases: ["B-3 AULA 503", "AULA 503 B-3"] },
          { nombre: "B-3 AULA 504", aliases: ["B-3 AULA 504", "AULA 504 B-3"] },          

          //B-4

          { nombre: "B-4 AULA 101", aliases: ["B-4 AULA 101", "AULA 101 B-4"] },
          { nombre: "B-4 AULA 102", aliases: ["B-4 AULA 102", "AULA 102 B-4"] },
          { nombre: "B-4 AULA 103", aliases: ["B-4 AULA 103", "AULA 103 B-4"] },
          { nombre: "B-4 AULA 104", aliases: ["B-4 AULA 104", "AULA 104 B-4"] },
          { nombre: "B-4 AULA 201", aliases: ["B-4 AULA 201", "AULA 201 B-4"] },
          { nombre: "B-4 AULA 202", aliases: ["B-4 AULA 202", "AULA 202 B-4"] },
          { nombre: "B-4 AULA 203", aliases: ["B-4 AULA 203", "AULA 203 B-4"] },
          { nombre: "B-4 AULA 204", aliases: ["B-4 AULA 204", "AULA 204 B-4"] },
          { nombre: "B-4 AULA 301", aliases: ["B-4 AULA 301", "AULA 301 B-4"] },
          { nombre: "B-4 AULA 302", aliases: ["B-4 AULA 302", "AULA 302 B-4"] },
          { nombre: "B-4 AULA 303", aliases: ["B-4 AULA 303", "AULA 303 B-4"] },
          { nombre: "B-4 AULA 304", aliases: ["B-4 AULA 304", "AULA 304 B-4"] },

          // Salones genéricos
          {
            nombre: "AULA 503",
            aliases: ["AULA 503", "BLOQUE 1, 2, 3 Y 4 AULA 503"],
          },
        ],
      },
      {
        nombre: "BLOQUE 9",
        aliases: ["BLOQUE 9", "BLQ 9"],
        salones: [
          { nombre: "AULA 101", aliases: ["AULA 101"] },
          { nombre: "AULA 102", aliases: ["AULA 102"] },
          { nombre: "AULA 103", aliases: ["AULA 103"] },
          { nombre: "AULA 104", aliases: ["AULA 104"] },
          { nombre: "AULA 105", aliases: ["AULA 105"] },
          { nombre: "AULA 106", aliases: ["AULA 106"] },
          { nombre: "AULA 201", aliases: ["AULA 201"] },
          { nombre: "AULA 202", aliases: ["AULA 202"] },
          { nombre: "AULA 203", aliases: ["AULA 203"] },
          { nombre: "AULA 204", aliases: ["AULA 204"] },
          { nombre: "AULA 205", aliases: ["AULA 205"] },
          { nombre: "AULA 206", aliases: ["AULA 206"] },
        ],
      },
      {
        nombre: "BLOQUE 11-12",
        aliases: ["BLOQUE 11-12", "BLOQUE 11 Y 12"],
        salones: [
          { nombre: "SALON 1", aliases: ["SALON 1"] },
          { nombre: "SALON 2", aliases: ["SALON 2"] },
          { nombre: "AULA DE INFORMATICA 1", aliases: ["AULA DE INFORMATICA 2"] },
          { nombre: "AULA DE INFORMATICA 2", aliases: ["AULA DE INFORMATICA 2"] },
          {
            nombre: "AULA MULTIPLE 1",
            aliases: ["MULTIPLE 1", "AULA MULT 1", "AULA MULTIPLE 1"],
          },
          {
            nombre: "AULA MULTIPLE 2",
            aliases: ["MULTIPLE 2", "AULA MULT 2", "AULA MULTIPLE 2"],
          },
        ],
      },
      {
        nombre: "BLOQUE 13 - CAFETERIA",
        aliases: ["BLOQUE 13 - CAFETERIA", "BLOQUE 13", "CAFETERIA"],
        salones: [
          {
            nombre: "SALA DE INFORMATICA 4",
            aliases: ["SALA INFO 4", "INFORMATICA 4"],
          },
          {
            nombre: "SALA DE INFORMATICA 5",
            aliases: ["SALA INFO 5", "INFORMATICA 5"],
          },
          {
            nombre: "SALA DE INFORMATICA 6",
            aliases: ["SALA INFO 6", "INFORMATICA 6"],
          },
          {
            nombre: "SALA DE INFORMATICA 7",
            aliases: ["SALA INFO 7", "INFORMATICA 7"],
          },
        ],
      },
      {
        nombre: "BLOQUE 5",
        aliases: ["BLOQUE 5", "BLQ 5"],
        salones: [
          {
            nombre: "LABORATORIO DE FISICA",
            aliases: ["LAB FISICA", "LABORATORIO DE FISICA"],
          },
          {
            nombre: "SALA DE SOFTWARE CIENCIAS BASICAS",
            aliases: [
              "SALA SOFTWARE CIENCIAS",
              "SALA DE SOFTWARE CIENCIAS BASICAS",
            ],
          },
          { nombre: "SALON 105", aliases: ["SALON 105", "AULA 105"] },
        ],
      },
    ];
  }

  /**
   * Extraer edificio y salón de un texto de ubicación
   */
  extractLocation(locationText: string): { edificio: string; salon: string } {
    const normalizedText = this.normalizeLocationText(locationText);

    // Buscar edificio
    const edificio = this.findEdificio(normalizedText);
    if (!edificio) {
      return { edificio: "DESCONOCIDO", salon: "DESCONOCIDO" };
    }

    // Buscar salón dentro del edificio
    const salon = this.findSalon(normalizedText, edificio);

    return {
      edificio: edificio.nombre,
      salon: salon ? salon.nombre : "SALON DESCONOCIDO",
    };
  }

  private findEdificio(text: string): EdificioInfo | null {
    for (const edificio of this.edificios) {
      // Verificar nombre principal
      if (text.includes(edificio.nombre)) {
        return edificio;
      }

      // Verificar aliases
      for (const alias of edificio.aliases) {
        if (text.includes(alias)) {
          return edificio;
        }
      }
    }
    return null;
  }

  private findSalon(text: string, edificio: EdificioInfo): SalonInfo | null {
    for (const salon of edificio.salones) {
      // Verificar nombre principal
      if (text.includes(salon.nombre)) {
        return salon;
      }

      // Verificar aliases
      for (const alias of salon.aliases) {
        if (text.includes(alias)) {
          return salon;
        }
      }
    }

    // Fallback: buscar patrones genéricos de salón
    const aulaMatch = text.match(/AULA\s+(\d+)/);
    if (aulaMatch) {
      return {
        nombre: `AULA ${aulaMatch[1]}`,
        aliases: [],
      };
    }

    const salaMatch = text.match(/SALA.*?(\d+)/);
    if (salaMatch) {
      return {
        nombre: `SALA ${salaMatch[1]}`,
        aliases: [],
      };
    }

    return null;
  }

  private normalizeLocationText(text: string): string {
    return text.toUpperCase().replace(/\s+/g, " ").trim();
  }
}
