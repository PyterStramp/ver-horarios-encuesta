// src/components/dashboard/DocenteMateriasModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface DocenteMateriasModalProps {
  isOpen: boolean;
  onClose: () => void;
  docente: string;
  materias: string[];
}

export default function DocenteMateriasModal({ 
  isOpen, 
  onClose, 
  docente, 
  materias 
}: DocenteMateriasModalProps) {
  const [notas, setNotas] = useState('');

  const [showCopied, setShowCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null> (null);

  useEffect(()=>{
    return (()=>{
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    });
  }, []);

  if (!isOpen) return null;

  const handleNotasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotas(e.target.value);
  };

  const handleCopyNotas = () => {
    if (notas.trim()) {
      navigator.clipboard.writeText(notas);
      setShowCopied(true);
      
      // Limpiar timeout existente si hay uno
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Ocultar mensaje después de 3 segundos
      timeoutRef.current = setTimeout(() => {
        setShowCopied(false);
      }, 3000);
    }
  };

  const handleClearNotas = () => {
    setNotas('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Información del Docente
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {docente}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Materias */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📚</span>
              Materias que dicta ({materias.length})
            </h3>
            
            {materias.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {materias.map((materia, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span className="text-blue-800 font-medium">
                        {materia}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-2xl mb-2">📭</div>
                <p className="text-gray-600 text-sm">
                  No se encontraron materias registradas para este docente
                </p>
              </div>
            )}
          </div>

          {/* Notas de Encuesta */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📝</span>
              Notas de la Encuesta
            </h3>
            
            <div className="space-y-3">
              <textarea
                value={notas}
                onChange={handleNotasChange}
                placeholder="Escribe aquí las respuestas del docente o cualquier observación relevante..."
                className="w-full h-40 sm:h-48 p-3 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Contador de caracteres */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  {notas.length} caracteres
                </span>
                <span>
                  {notas.split('\n').length} líneas
                </span>
              </div>

              {/* Botones de acción para notas */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCopyNotas}
                  disabled={!notas.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  Copiar al Portapapeles
                </button>
                
                <button
                  onClick={handleClearNotas}
                  disabled={!notas.trim()}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">🗑️</span>
                  Limpiar Notas
                </button>
              </div>

              {showCopied && (
                <div className="text-center mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-sm py-1 px-3 rounded-full animate-fade-in">
                    Copiado con éxito ✓
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            
            {materias.length > 0 && (
              <div className="flex-1 text-center text-xs text-gray-500 flex items-center justify-center">
                <span className="mr-1">💡</span>
                Tip: Las notas no se guardan automáticamente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
