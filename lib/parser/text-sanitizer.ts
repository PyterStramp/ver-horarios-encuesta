export function sanitizeHorarioText(rawText: string): string {
  
  // 1. Normalizar caracteres especiales
  let sanitized = rawText.replace(/\?/g, "Ñ");

  // 2. Procesar líneas
  const lines = sanitized.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const reconstructedLines: string[] = [];
   
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    
    // Líneas de estructura se mantienen tal como están
    if (isStructureLine(currentLine)) {
      reconstructedLines.push(currentLine);
      continue;
    }
    
    // Líneas de horario: reconstruir si están partidas
    if (isHorarioStartLine(currentLine)) {
      let completeLine = currentLine;
      let j = i + 1;
      // Continuar uniendo líneas hasta que esté completa
      while (j < lines.length && !isCompleteLine(lines[j]) && shouldContinueLine(lines[j])) {
        // Agregar espacio solo si la línea siguiente no es continuación directa
        const nextLine = lines[j];
        if (!completeLine.endsWith(' ') && !nextLine.startsWith(' ')) {
          completeLine += ' ';
        }
        completeLine += nextLine;
        j++;
      }
      
      reconstructedLines.push(completeLine);
      i = j - 1; // Saltar las líneas procesadas
    } else {
      reconstructedLines.push(currentLine);
    }
  }

  return reconstructedLines.join('\n');
}

function isStructureLine(line: string): boolean {
  return line.startsWith('PROYECTO CURRICULAR') || 
         line.startsWith('ESPACIO ACADEMICO') || 
         line.startsWith('GRP.') || 
         line.startsWith('INSCRITOS') ||
         line.startsWith('Cod. Espacio Academico');
}

function isHorarioStartLine(line: string): boolean {
  return /^\d+\s+[A-Z]/.test(line);
}

function isCompleteLine(line: string): boolean {
  // Una línea está completa si tiene: código, materia, día, horario, ubicación y termina con nombre
  const hasDayAndTime = /\b(LUNES|MARTES|MIERCOLES|JUEVES|VIERNES|SABADO)\s+\d+-\d+\b/.test(line);
  const hasLocation = /\b(TECNOLOGICA|BLOQUE|TECHNE|AULA|LABORATORIO)\b/.test(line);
  const endsWithPersonName = /\b[A-Z]{2,}\s+[A-Z]{2,}(\s+[A-Z]{2,})*\s*$/.test(line);
  
  return hasDayAndTime && hasLocation && endsWithPersonName;
}

function shouldContinueLine(line: string): boolean {
  return !isStructureLine(line) && !isHorarioStartLine(line);
}