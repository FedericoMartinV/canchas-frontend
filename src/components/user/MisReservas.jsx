import React, { useState } from 'react';
import { Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatearHora, localTimeAMinutos } from '../../utils/tiempo';

/**
 * Determina si una reserva tiene los datos anidados mínimos para renderizarse
 * sin errores. Retorna true si cancha es null/undefined, lo que indica que el
 * backend no populó la relación (JOIN faltante, dato eliminado, etc.).
 * A diferencia de ReservasList, aquí no se verifica usuario porque este
 * componente es de vista de usuario propio y no muestra datos de terceros.
 */
const esReservaIncompleta = (reserva) => !reserva.cancha;

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

const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha desconocida';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaLocal = new Date(anio, mes - 1, dia);

  if (Number.isNaN(fechaLocal.getTime())) return fecha;

  const fechaFormateada = fechaLocal.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return fechaFormateada.charAt(0).toLocaleUpperCase('es-AR') + fechaFormateada.slice(1);
};

export default function MisReservas({ reservas }) {
  const [diasExpandidos, setDiasExpandidos] = useState([]);

  if (reservas.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">⚽</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No tienes reservas aún</h3>
        <p className="text-gray-600">¡Reserva tu primera cancha y comienza a jugar!</p>
      </div>
    );
  }

  const reservasOrdenadas = reservas.slice().sort((a, b) => {
    const ordenFecha = (a.fecha ?? '').localeCompare(b.fecha ?? '');
    return ordenFecha || localTimeAMinutos(a.horaInicio) - localTimeAMinutos(b.horaInicio);
  });

  const reservasAgrupadas = reservasOrdenadas.reduce((grupos, reserva) => {
    const fecha = reserva.fecha ?? '';
    const grupo = grupos[grupos.length - 1];

    if (!grupo || grupo.fecha !== fecha) {
      grupos.push({ fecha, reservas: [reserva] });
    } else {
      grupo.reservas.push(reserva);
    }

    return grupos;
  }, []);

  const alternarDiaExpandido = (fecha) => {
    setDiasExpandidos((diasActuales) => (
      diasActuales.includes(fecha)
        ? diasActuales.filter((dia) => dia !== fecha)
        : [...diasActuales, fecha]
    ));
  };

  return (
    <div className="admin-reservation-groups">
      {reservasAgrupadas.map(({ fecha, reservas: reservasDelDia }) => {
        const expandido = diasExpandidos.includes(fecha);
        const idGrupo = `mis-reservas-${fecha || 'fecha-desconocida'}`;

        return (
          <section
            className="admin-reservation-day-group"
            aria-label={formatearFecha(fecha)}
            key={fecha || 'fecha-desconocida'}
          >
            <div className="admin-reservations-results-heading">
              <h3 className="text-xl font-bold text-gray-800">{formatearFecha(fecha)}</h3>
              <div className="admin-reservation-day-controls">
                <span>
                  {reservasDelDia.length} {reservasDelDia.length === 1 ? 'reserva' : 'reservas'}
                </span>
                <button
                  type="button"
                  className="admin-court-toggle admin-reservation-day-toggle"
                  aria-label={`${expandido ? 'Ocultar' : 'Mostrar'} reservas del ${formatearFecha(fecha)}`}
                  aria-expanded={expandido}
                  aria-controls={idGrupo}
                  onClick={() => alternarDiaExpandido(fecha)}
                >
                  {expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  {expandido ? 'Ocultar reservas' : 'Mostrar reservas'}
                </button>
              </div>
            </div>
            {expandido && (
              <div className="admin-reservations-list" id={idGrupo}>
                {reservasDelDia.map((reserva) => {
                  /*
                   * GUARD DE DATOS INCOMPLETOS
                   * Antes de acceder a reserva.cancha.* verificamos que cancha exista.
                   * Si falta, renderizamos una tarjeta de advertencia en lugar de
                   * explotar con TypeError. El .map() continúa con el resto de las
                   * reservas, que se muestran normalmente.
                   * No verificamos usuario aquí porque MisReservas solo muestra la
                   * cancha asociada a la reserva del usuario autenticado.
                   */
                  if (esReservaIncompleta(reserva)) {
                    return (
                      /*
                       * TARJETA ANÓMALA
                       * Borde naranja + ícono AlertTriangle, igual que en ReservasList,
                       * para mantener consistencia visual entre vistas. Se muestra el
                       * ID de la reserva para que el usuario pueda reportarla al soporte.
                       * No se intentan accesos a reserva.cancha aquí.
                       */
                      <div
                        key={reserva.id}
                        className="admin-reservation-card admin-reservation-card-incomplete"
                        role="alert"
                        aria-label={`Reserva ${reserva.id} con datos incompletos`}
                      >
                        <div className="flex items-center gap-3 text-orange-700">
                          <AlertTriangle size={24} className="flex-shrink-0" />
                          <div>
                            <p className="font-bold text-orange-800">
                              Datos incompletos — Reserva #{reserva.id}
                            </p>
                            {/* Indicamos qué relación falta para facilitar el debug */}
                            <p className="text-sm mt-1">• Cancha no disponible</p>
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
                   * Solo llegamos aquí si cancha existe. Aun así usamos optional
                   * chaining (?.) + fallback ('—') en cada campo anidado para cubrir
                   * el caso de que un campo individual esté ausente dentro del objeto
                   * cancha (ej: cancha sin ubicacion o sin tipo).
                   */
                  return (
                    <div key={reserva.id} className="admin-reservation-card">
                      <div className="admin-reservation-heading">
                        <div>
                          <h3 className="admin-reservation-court-name text-2xl font-bold text-gray-800 mb-1">
                            {reserva.cancha?.nombre ?? '—'}
                          </h3>
                        </div>
                        <span className={`admin-reservation-status rounded-full font-bold ${getEstadoColor(reserva.estado)}`}>
                          {getEstadoEmoji(reserva.estado)} {reserva.estado}
                        </span>
                      </div>

                      <div className="admin-reservation-details">
                        <p className="text-gray-700 flex items-center gap-2">
                          <Clock size={20} className="text-green-600" />
                          <span className="font-semibold">
                            {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
                          </span>
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold">Tipo:</span>{' '}
                          {reserva.cancha?.tipo ?? '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}