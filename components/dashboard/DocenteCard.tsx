// src/components/dashboard/DocenteCard.tsx
'use client';

import { useState } from 'react';
import { DocenteActivo } from '@/types/horarios';
import { useEncuestas } from '@/contexts/EncuestasContext';

interface DocenteCardProps {
  docente: DocenteActivo;
  tipo: 'activo' | 'proximo';
}

export default function DocenteCard({ docente, tipo }: DocenteCardProps) {
  const { isEncuestado, marcarComoEncuestado, desmarcarEncuestado } = useEncuestas();
  
  const yaEncuestado = isEncuestado(docente.docente);

  const handleMarcarEncuestado = () => {
    if (yaEncuestado) {
      desmarcarEncuestado(docente.docente);
    } else {
      marcarComoEncuestado(docente.docente);
    }
  };

  const getCardClass = () => {
    if (yaEncuestado) {
      return 'bg-gray-100 border-gray-300';
    }
    return tipo === 'activo' 
      ? 'bg-white border-green-300 shadow-md' 
      : 'bg-white border-blue-300 shadow-md';
  };

  return (
    <div className={`border-2 rounded-lg p-3 ${getCardClass()} transition-all duration-200`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className={`font-semibold text-sm ${yaEncuestado ? 'text-gray-500' : 'text-gray-800'}`}>
            {docente.docente ? docente.docente : "Docente no identificado :/"}
          </h4>
          <p className={`text-xs ${yaEncuestado ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            📚 {docente.asignatura}
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-1 rounded-full ${
            yaEncuestado 
              ? 'bg-gray-200 text-gray-600' 
              : tipo === 'activo' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
          }`}>
            {tipo === 'activo' ? 'AHORA' : 'PRÓXIMO'}
          </span>
        </div>
      </div>
      
      <div className={`text-xs ${yaEncuestado ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
        <div className="flex items-center mb-1">
          <span className="mr-1">📍</span>
          <span>{docente.edificio}</span>
        </div>
        <div className="flex items-center mb-1">
          <span className="mr-1">🚪</span>
          <span>{docente.salon}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">⏰</span>
          <span>{docente.horaInicio}:00 - {docente.horaFin}:00</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleMarcarEncuestado}
          className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
            yaEncuestado
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {yaEncuestado ? '✅ Encuestado' : '📋 Marcar Encuestado'}
        </button>
        
        {!yaEncuestado && (
          <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
            📍 Ir
          </button>
        )}
      </div>
    </div>
  );
}