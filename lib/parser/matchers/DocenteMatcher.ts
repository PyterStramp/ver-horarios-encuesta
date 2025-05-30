// src/lib/parser/matchers/DocenteMatcher.ts

export class DocenteMatcher {
  private docentes: string[] = [];
  private docentesNormalizados: Map<string, string> = new Map(); // normalizado -> original

  constructor() {
    this.loadDocentes();
  }

  async loadDocentes() {
    try {
      // Primero intentar cargar desde localStorage
      const docentesGuardados = localStorage.getItem("docentes-lista");

      if (docentesGuardados) {
        this.docentes = JSON.parse(docentesGuardados);
      } else {
        // Fallback: intentar cargar desde archivo público
        const response = await fetch("/data/docentes.txt");
        if (response.ok) {
          const content = await response.text();
          this.docentes = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
        } else {
          console.warn("No se pudo cargar la lista de docentes");
          this.docentes = [];
        }
      }

      // Crear mapeo normalizado -> original
      this.docentesNormalizados.clear();
      this.docentes.forEach((docente) => {
        const normalizado = this.normalizeText(docente);
        this.docentesNormalizados.set(normalizado, docente);
      });
    } catch (error) {
      console.error("Error cargando docentes:", error);
      this.docentes = [];
    }
  }

  /**
   * Encuentra el nombre del docente más probable desde un texto corrupto
   */
  findDocente(textoPosibleDocente: string): string {
    if (!textoPosibleDocente || textoPosibleDocente.trim().length === 0) {
      return "";
    }

    // Normalizar el texto de entrada
    const textoNormalizado = this.normalizeText(textoPosibleDocente);

    // Buscar coincidencias exactas o parciales
    for (const docente of this.docentes) {
      const docenteNormalizado = this.normalizeText(docente);

      // Verificar si el docente está contenido en el texto
      if (this.contieneDocente(textoNormalizado, docenteNormalizado)) {
        return docente;
        // Por si no lo detecta con la función
      } else if (docente===textoPosibleDocente) {
        return docente;
      }
    }

    console.warn(`No se encontró docente en: "${textoPosibleDocente}"`);
    return ""; // No se encontró, devolver vacío
  }

  /**
   * Verificar si un docente está contenido en el texto
   */
  private contieneDocente(texto: string, docenteNormalizado: string): boolean {
    // Dividir el nombre del docente en palabras
    const palabrasDocente = docenteNormalizado
      .split(" ")
      .filter((p) => p.length > 2);

    // Verificar que todas las palabras del docente estén en el texto
    const todasLasPalabrasPresentes = palabrasDocente.every((palabra) => {
      // Buscar la palabra completa o como substring
      return texto.includes(palabra);
    });

    // Si todas las palabras están presentes, verificar el orden aproximado
    if (todasLasPalabrasPresentes && palabrasDocente.length >= 2) {
      // Verificar que al menos las primeras dos palabras aparezcan en orden similar
      const indicePrimera = texto.indexOf(palabrasDocente[0]);
      const indiceSegunda = texto.indexOf(palabrasDocente[1]);

      // La segunda palabra debe aparecer después de la primera (con cierta tolerancia)
      return indicePrimera >= 0 && indiceSegunda > indicePrimera;
    }

    return todasLasPalabrasPresentes;
  }

  /**
   * Normalizar texto: remover acentos, ñ especiales, mayúsculas
   */
  private normalizeText(text: string): string {
    return text
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/Ñ/g, "N")
      .replace(/\?/g, "N") // Reemplazar ? por N
      .replace(/[^A-Z\s]/g, "") // Solo letras y espacios
      .replace(/\s+/g, " ") // Normalizar espacios
      .trim();
  }
}
