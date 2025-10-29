import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function MisReservas({ reservas }) {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      case 'CANCELADA':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';
      default:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300';
    }
  };

  const getEstadoEmoji = (estado) => {
    switch (estado) {
      case 'CONFIRMADA': return '✅';
      case 'CANCELADA': return '❌';
      default: return '⏳';
    }
  };

  if (reservas.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">⚽</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No tienes reservas aún</h3>
        <p className="text-gray-600">¡Reserva tu primera cancha y comienza a jugar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reservas.map(reserva => (
        <div key={reserva.id} className="card hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {reserva.cancha.nombre}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                {reserva.cancha.ubicacion}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getEstadoColor(reserva.estado)}`}>
              {getEstadoEmoji(reserva.estado)} {reserva.estado}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-gray-100">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} className="text-green-600" />
              <span className="font-semibold">{reserva.fecha}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock size={20} className="text-green-600" />
              <span className="font-semibold">
                {reserva.horaInicio} - {reserva.horaFin}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Tipo: <span className="font-semibold text-gray-800">{reserva.cancha.tipo}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}