// src/components/dashboard/ExportImportModal.tsx
'use client';

import { useState } from 'react';
import { useEncuestas } from '@/contexts/EncuestasContext';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  docentesEncuestados: Set<string>;
}

export default function ExportImportModal({ 
  isOpen, 
  onClose, 
  docentesEncuestados 
}: ExportImportModalProps) {
  const { marcarComoEncuestado, desmarcarEncuestado } = useEncuestas();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportData = () => {
    const data = {
      docentes: Array.from(docentesEncuestados),
      timestamp: new Date().toISOString(),
      total: docentesEncuestados.size
    };

    const jsonString = JSON.stringify(data, null, 2);
    
    // Crear archivo y descargar
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `docentes-encuestados-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const data = {
      docentes: Array.from(docentesEncuestados),
      timestamp: new Date().toISOString(),
      total: docentesEncuestados.size
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Datos copiados al portapapeles');
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      
      if (!data.docentes || !Array.isArray(data.docentes)) {
        throw new Error('Formato de datos inválido');
      }

      // Limpiar datos actuales y cargar nuevos
      docentesEncuestados.forEach(docente => {
        desmarcarEncuestado(docente);
      });

      let importados = 0;
      data.docentes.forEach((docente: string) => {
        if (typeof docente === 'string' && docente.trim()) {
          marcarComoEncuestado(docente.trim());
          importados++;
        }
      });

      setImportResult(`✅ Importados ${importados} docentes correctamente`);
      setImportText('');
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setImportResult(`❌ Error: ${error instanceof Error ? error.message : 'Formato inválido'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Exportar/Importar Datos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'export'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📤 Exportar
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'import'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📥 Importar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Exportar datos de encuestas
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Actualmente tienes <strong>{docentesEncuestados.size} docentes marcados como encuestados</strong>. 
                  Puedes exportar estos datos para hacer respaldo o compartir con otros dispositivos.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Vista previa:</h4>
                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-40">
{JSON.stringify({
  docentes: Array.from(docentesEncuestados).slice(0, 3).concat(
    docentesEncuestados.size > 3 ? [`... y ${docentesEncuestados.size - 3} más`] : []
  ),
  timestamp: new Date().toISOString(),
  total: docentesEncuestados.size
}, null, 2)}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={exportData}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">💾</span>
                  Descargar archivo JSON
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📋</span>
                  Copiar al portapapeles
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Importar datos de encuestas
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pega aquí el contenido JSON exportado previamente. 
                  <strong className="text-red-600"> Esto reemplazará todos los datos actuales.</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datos JSON:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Pega aquí el JSON exportado, ejemplo:
{
  "docentes": ["GARCIA MARIA", "RODRIGUEZ CARLOS"],
  "timestamp": "2025-01-15T10:30:00.000Z",
  "total": 2
}'
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {importResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  importResult.startsWith('✅') 
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {importResult}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <span className="mr-2">📥</span>
                Importar datos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
