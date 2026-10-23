import React from 'react';
import { Calendar, Clock, User, Mail, Check, X, AlertTriangle } from 'lucide-react';
import { reservasAPI } from '../../services/api';
import { formatearHora } from '../../utils/tiempo';

/**
 * Determina si una reserva tiene los datos anidados mínimos para renderizarse
 * sin errores. Retorna true si cancha o usuario son null/undefined, lo que
 * indica que el backend no populó la relación (JOIN faltante, dato eliminado,
 * etc.). Usamos este flag para mostrar la tarjeta en modo "anómalo" en lugar
 * de lanzar un TypeError que destruiría toda la lista.
 */
const esReservaIncompleta = (reserva) =>
  !reserva.cancha || !reserva.usuario;

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
    <div className="admin-reservations">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Todas las Reservas</h2>
      <div className="admin-reservations-list">
        {reservas.map(reserva => {
          /*
           * GUARD DE DATOS INCOMPLETOS
           * Antes de intentar acceder a reserva.cancha.* o reserva.usuario.*
           * verificamos que ambas relaciones existan. Si una falta, rendrizamos
           * una tarjeta de advertencia en lugar de explotar con TypeError.
           * Esto aísla el fallo a esta tarjeta; el .map() continúa con el
           * resto y las demás reservas se muestran normalmente.
           */
          if (esReservaIncompleta(reserva)) {
            return (
              /*
               * TARJETA ANÓMALA
               * Borde naranja + ícono AlertTriangle para que sea visualmente
               * distinguible del resto. Se muestra el ID de la reserva para
               * que el administrador pueda identificarla y corregirla en el
               * backend. No se intentan accesos anidados aquí.
               */
              <div
                key={reserva.id}
                className="card admin-reservation-card admin-reservation-card-incomplete border-2 border-orange-400 bg-orange-50"
                role="alert"
                aria-label={`Reserva ${reserva.id} con datos incompletos`}
              >
                <div className="flex items-center gap-3 text-orange-700">
                  <AlertTriangle size={24} className="flex-shrink-0" />
                  <div>
                    <p className="font-bold text-orange-800">
                      Datos incompletos — Reserva #{reserva.id}
                    </p>
                    <p className="text-sm mt-1">
                      {/* Indicamos qué relación falta para facilitar el debug */}
                      {!reserva.cancha && <span className="mr-2">• Cancha no disponible</span>}
                      {!reserva.usuario && <span>• Usuario no disponible</span>}
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      Fecha: {reserva.fecha ?? 'desconocida'} · Estado: {reserva.estado ?? 'desconocido'}
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          /*
           * TARJETA NORMAL
           * Solo llegamos aquí si cancha Y usuario existen. Aun así usamos
           * optional chaining (?.) + fallback ('—') en cada acceso anidado
           * para cubrir el caso de que un campo individual esté ausente
           * dentro de un objeto que sí existe (ej: cancha sin ubicacion).
           */
          return (
            <div key={reserva.id} className="admin-reservation-card">
              <div className="admin-reservation-heading">
                <div>
                  <h3 className="admin-reservation-court-name text-2xl font-bold text-gray-800 mb-1">
                    {reserva.cancha?.nombre ?? 'Reserva'}
                  </h3>
                </div>
                <span className={`admin-reservation-status rounded-full font-bold ${getEstadoColor(reserva.estado)}`}>
                  {getEstadoEmoji(reserva.estado)} {reserva.estado}
                </span>
              </div>

              <div className="admin-reservation-details">
                <p className="text-gray-700 flex items-center gap-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="font-semibold">{reserva.fecha}</span>
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="font-semibold">
                    {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Tipo:</span>{' '}
                  {reserva.cancha?.tipo ?? '—'}
                </p>
              </div>

              <section className="admin-reservation-user">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Información del Usuario
                </h4>
                <div className="admin-reservation-details text-sm">
                  <p className="text-gray-700">
                    <span className="font-semibold">Nombre:</span>{' '}
                    {reserva.usuario?.nombre ?? '—'} {reserva.usuario?.apellido ?? ''}
                  </p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <Mail size={14} className="text-blue-600" />
                    {reserva.usuario?.email ?? '—'}
                  </p>
                </div>
              </section>

              {reserva.estado === 'PENDIENTE' && (
                <div className="admin-reservation-actions" aria-label="Acciones de la reserva">
                  <button
                    onClick={() => confirmarReserva(reserva.id)}
                    className="admin-reservation-action admin-reservation-action-confirm flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Check size={20} />
                    Confirmar
                  </button>
                  <button
                    onClick={() => cancelarReserva(reserva.id)}
                    className="admin-reservation-action admin-reservation-action-cancel flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <X size={20} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
