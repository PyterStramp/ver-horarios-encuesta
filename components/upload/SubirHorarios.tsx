// src/components/upload/SubirHorarios.tsx

'use client';

import { useState } from 'react';

interface SubirHorariosProps {
  onFileUpload: (file: File) => void;
  loading: boolean;
}

export default function SubirHorarios({ onFileUpload, loading }: SubirHorariosProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      onFileUpload(file);
    } else {
      alert('Por favor selecciona un archivo .txt válido');
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
    <div className="text-center">
      <div className="text-6xl mb-4">📄</div>
      <h2 className="text-2xl font-bold mb-4">Cargar Horarios</h2>
      <p className="text-gray-600 mb-6">
        Sube el archivo .txt con los horarios de docentes (texto copiado del PDF)
      </p>
      
      {/* Zona de drag & drop */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-2">
          {dragActive ? '📂' : '📁'}
        </div>
        <p className="text-gray-600 mb-4">
          {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu archivo .txt aquí'}
        </p>
        
        <label className={`${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
        } text-white px-6 py-3 rounded-lg inline-block transition-colors`}>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            '📁 Seleccionar Archivo TXT'
          )}
        </label>
      </div>
      
      <div className="text-sm text-gray-500">
        <p className="mb-2">✅ El sanitizador se encargará de unir las líneas partidas automáticamente</p>
        <p className="mb-2">✅ Los caracteres especiales (?) se convertirán a Ñ</p>
        <p>✅ Los nombres de docentes se limpiarán usando la base de datos</p>
      </div>

      {loading && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="text-left">
              <p className="text-blue-700 font-medium">Procesando horarios...</p>
              <p className="text-blue-600 text-sm">Sanitizando texto, extrayendo horarios y limpiando nombres</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}