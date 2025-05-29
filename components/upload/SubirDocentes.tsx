// src/components/upload/SubirDocentes.tsx
'use client';

import { useState } from 'react';

interface SubirDocentesProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
  docentesCargados: boolean;
}

export default function SubirDocentes({ onFileUpload, loading, docentesCargados }: SubirDocentesProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      onFileUpload(file);
    } else {
      alert('Por favor selecciona un archivo .txt válido con la lista de docentes');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/plain') {
        onFileUpload(file);
      } else {
        alert('Por favor arrastra un archivo .txt válido');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        👥 Lista de Docentes
        {docentesCargados && <span className="ml-2 text-green-600">✅</span>}
      </h3>
      
      {!docentesCargados ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">
              {dragActive ? '📂' : '📋'}
            </div>
            <p className="text-gray-600 mb-4">
              {dragActive ? 'Suelta el archivo aquí' : 'Sube la lista de docentes (.txt)'}
            </p>
            
            <label className={`${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            } text-white px-4 py-2 rounded-lg inline-block transition-colors text-sm`}>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              {loading ? 'Cargando...' : 'Seleccionar Archivo'}
            </label>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">
            ✅ Lista de docentes cargada correctamente
          </p>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Formato: Un nombre por línea (ej: SANTANA CARLOS)</p>
      </div>
    </div>
  );
}