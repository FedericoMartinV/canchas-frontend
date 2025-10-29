import React from 'react';
import { Calendar, Clock, User, Mail, Phone, MapPin, Check, X } from 'lucide-react';
import { reservasAPI } from '../../services/api';

export default function ReservasList({ reservas, onReservaActualizada, agregarNotificacion }) {
  const confirmarReserva = async (id) => {
    try {
      await reservasAPI.confirmar(id);
      agregarNotificacion('✅ Reserva confirmada - Notificaciones enviadas al usuario y admin', 'success');
      onReservaActualizada();
    } catch (error) {
      agregarNotificacion('Error al confirmar reserva', 'error');
    }
  };

  const cancelarReserva = async (id) => {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    
    try {
      await reservasAPI.cancelar(id);
      agregarNotificacion('❌ Reserva cancelada - Notificaciones enviadas al usuario y admin', 'success');
      onReservaActualizada();
    } catch (error) {
      agregarNotificacion('Error al cancelar reserva', 'error');
    }
  };

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
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay reservas registradas</h3>
        <p className="text-gray-600">Las nuevas reservas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Todas las Reservas</h2>
      <div className="space-y-6">
        {reservas.map(reserva => (
          <div key={reserva.id} className="card hover:shadow-2xl transition-all duration-300 border-2 border-green-100">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Información de la reserva */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Info del usuario */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <User size={18} className="text-blue-600" />
                      Información del Usuario
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-semibold">Nombre:</span> {reserva.usuario.nombre} {reserva.usuario.apellido}
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Mail size={14} className="text-blue-600" />
                        {reserva.usuario.email}
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone size={14} className="text-blue-600" />
                        {reserva.usuario.telefono}
                      </p>
                    </div>
                  </div>

                  {/* Info de la reserva */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <h4 className="font-bold text-gray-800 mb-3">Detalles de la Reserva</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 flex items-center gap-2">
                        <Calendar size={16} className="text-green-600" />
                        <span className="font-semibold">{reserva.fecha}</span>
                      </p>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Clock size={16} className="text-green-600" />
                        <span className="font-semibold">
                          {reserva.horaInicio} - {reserva.horaFin}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Tipo:</span> {reserva.cancha.tipo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {reserva.estado === 'PENDIENTE' && (
                <div className="flex flex-col gap-3 md:w-48">
                  <button
                    onClick={() => confirmarReserva(reserva.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Check size={20} />
                    Confirmar
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <X size={20} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
