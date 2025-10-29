import React from 'react';
import { MapPin, DollarSign, Users } from 'lucide-react';

export default function CanchasGrid({ canchas, onReservar }) {
  if (canchas.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">🏟️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay canchas disponibles</h3>
        <p className="text-gray-600">Pronto habrá nuevas canchas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {canchas.map(cancha => (
        <div key={cancha.id} className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                {cancha.nombre}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                {cancha.ubicacion}
              </p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              {cancha.tipo}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Users size={18} className="text-green-600" />
                Capacidad:
              </span>
              <span className="font-semibold text-gray-800">
                {cancha.tipo === 'Futbol 5' ? '10 jugadores' : 
                 cancha.tipo === 'Futbol 7' ? '14 jugadores' : '22 jugadores'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Iluminación:</span>
              <span className="font-semibold">
                {cancha.iluminacion ? '💡 Sí' : '🌙 No'}
              </span>
            </div>

            <div className="pt-3 border-t-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Precio por hora:</span>
                <span className="text-3xl font-bold text-green-600 flex items-center">
                  <DollarSign size={24} />
                  {cancha.precioPorHora}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onReservar(cancha)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Reservar Ahora ⚽
          </button>
        </div>
      ))}
    </div>
  );
}