import React, { useState } from 'react';
import { Clock, User, Mail, Check, X, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { reservasAPI } from '../../services/api';
import { formatearHora, localTimeAMinutos } from '../../utils/tiempo';

/**
 * Determina si una reserva tiene los datos anidados mínimos para renderizarse
 * sin errores. Retorna true si cancha o usuario son null/undefined, lo que
 * indica que el backend no populó la relación (JOIN faltante, dato eliminado,
 * etc.). Usamos este flag para mostrar la tarjeta en modo "anómalo" en lugar
 * de lanzar un TypeError que destruiría toda la lista.
 */
const esReservaIncompleta = (reserva) =>
  !reserva.cancha || !reserva.usuario;

const diasDelMes = (anio, mes) => {
  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const cantidadDias = new Date(anio, mes + 1, 0).getDate();

  return [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: cantidadDias }, (_, indice) => indice + 1),
    ...Array(42 - primerDia - cantidadDias).fill(null),
  ];
};

const fechaComoClave = (anio, mes, dia) =>
  `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

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

export default function ReservasList({ reservas, onReservaActualizada, agregarNotificacion }) {
  const hoy = new Date();
  const [mesVisible, setMesVisible] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(true);
  const [diasExpandidos, setDiasExpandidos] = useState([]);

  const reservasPorFecha = reservas.reduce((conteo, reserva) => {
    if (reserva.fecha) {
      conteo[reserva.fecha] = (conteo[reserva.fecha] ?? 0) + 1;
    }
    return conteo;
  }, {});

  const reservasFiltradas = reservas
    .filter((reserva) => !fechaSeleccionada || reserva.fecha === fechaSeleccionada)
    .slice()
    .sort((a, b) => {
      const ordenFecha = (a.fecha ?? '').localeCompare(b.fecha ?? '');
      return ordenFecha || localTimeAMinutos(a.horaInicio) - localTimeAMinutos(b.horaInicio);
    });

  const reservasAgrupadas = reservasFiltradas.reduce((grupos, reserva) => {
    const fecha = reserva.fecha ?? '';
    const grupo = grupos[grupos.length - 1];

    if (!grupo || grupo.fecha !== fecha) {
      grupos.push({ fecha, reservas: [reserva] });
    } else {
      grupo.reservas.push(reserva);
    }

    return grupos;
  }, []);

  const cambiarMes = (cantidad) => {
    setMesVisible((mesActual) =>
      new Date(mesActual.getFullYear(), mesActual.getMonth() + cantidad, 1),
    );
  };

  const alternarDiaExpandido = (fecha) => {
    setDiasExpandidos((diasActuales) => (
      diasActuales.includes(fecha)
        ? diasActuales.filter((dia) => dia !== fecha)
        : [...diasActuales, fecha]
    ));
  };

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

  return (
    <div className="admin-reservations">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Todas las Reservas</h2>
      {mostrarCalendario ? (
      <section className="admin-reservations-calendar-view">
      <section className="admin-reservations-calendar" aria-label="Calendario de reservas">
        <div className="admin-reservations-calendar-heading">
          <h3>
            {mesVisible.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).replace(' de ', ' ')}
          </h3>
          <div className="admin-reservations-calendar-navigation">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="admin-reservations-calendar-grid" role="grid">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
            <span className="admin-reservations-calendar-weekday" role="columnheader" key={dia}>
              {dia}
            </span>
          ))}
          {diasDelMes(mesVisible.getFullYear(), mesVisible.getMonth()).map((dia, indice) => {
            if (!dia) {
              return <span className="admin-reservations-calendar-empty" key={`vacio-${indice}`} />;
            }

            const fecha = fechaComoClave(mesVisible.getFullYear(), mesVisible.getMonth(), dia);
            const cantidadReservas = reservasPorFecha[fecha] ?? 0;
            const esHoy = fecha === fechaComoClave(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

            return (
              <button
                type="button"
                key={fecha}
                className={[
                  'admin-reservations-calendar-day',
                  fechaSeleccionada === fecha ? 'is-selected' : '',
                  esHoy ? 'is-today' : '',
                  cantidadReservas > 0 ? 'has-reservations' : '',
                ].filter(Boolean).join(' ')}
                aria-label={`${fecha}${cantidadReservas ? `, ${cantidadReservas} reservas` : ', sin reservas'}`}
                aria-pressed={fechaSeleccionada === fecha}
                onClick={() => {
                  setFechaSeleccionada(fecha);
                  setMostrarCalendario(false);
                }}
              >
                <span>{dia}</span>
                {cantidadReservas > 0 && <span className="admin-reservations-calendar-count">{cantidadReservas}</span>}
              </button>
            );
          })}
        </div>
        <div className="admin-reservations-calendar-footer">
          <span>Los días destacados tienen reservas. Seleccioná un día para verlas.</span>
          <button
            type="button"
            className="admin-court-toggle"
            onClick={() => {
              setFechaSeleccionada(null);
              setMostrarCalendario(false);
            }}
          >
            Ver todas
          </button>
        </div>
      </section>
      </section>
      ) : (
      <>
      <div className="admin-reservations-results-toolbar">
        <button
          type="button"
          className="admin-court-toggle"
          onClick={() => setMostrarCalendario(true)}
        >
          <ChevronLeft size={18} />
          Volver al calendario
        </button>
      </div>
      {reservasFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {fechaSeleccionada ? 'No hay reservas para este día' : 'No hay reservas registradas'}
          </h3>
          <p className="text-gray-600">
            {fechaSeleccionada ? 'Elegí otro día del calendario.' : 'Las nuevas reservas aparecerán aquí.'}
          </p>
        </div>
      ) : (
        <div className="admin-reservation-groups">
          {reservasAgrupadas.map(({ fecha, reservas: reservasDelDia }) => (
            <section
              className="admin-reservation-day-group"
              aria-label={formatearFecha(fecha)}
              key={fecha || 'fecha-desconocida'}
            >
              <div className="admin-reservations-results-heading">
                <h3 className="text-xl font-bold text-gray-800">
                  {formatearFecha(fecha)}
                </h3>
                <div className="admin-reservation-day-controls">
                  <span>{reservasDelDia.length} {reservasDelDia.length === 1 ? 'reserva' : 'reservas'}</span>
                  {!fechaSeleccionada && (
                    <button
                      type="button"
                      className="admin-court-toggle admin-reservation-day-toggle"
                      aria-label={`${diasExpandidos.includes(fecha) ? 'Ocultar' : 'Mostrar'} reservas del ${formatearFecha(fecha)}`}
                      aria-expanded={diasExpandidos.includes(fecha)}
                      aria-controls={`reservas-${fecha || 'fecha-desconocida'}`}
                      onClick={() => alternarDiaExpandido(fecha)}
                    >
                      {diasExpandidos.includes(fecha) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      {diasExpandidos.includes(fecha) ? 'Ocultar reservas' : 'Mostrar reservas'}
                    </button>
                  )}
                </div>
              </div>
              {(fechaSeleccionada || diasExpandidos.includes(fecha)) && (
              <div className="admin-reservations-list" id={`reservas-${fecha || 'fecha-desconocida'}`}>
                {reservasDelDia.map(reserva => {
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
                        {!reserva.cancha && <span className="mr-2">• Cancha no disponible</span>}
                        {!reserva.usuario && <span>• Usuario no disponible</span>}
                      </p>
                      <p className="text-xs text-orange-600 mt-2">
                        Estado: {reserva.estado ?? 'desconocido'}
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
           * dentro de un objeto que sí existe.
           */
          return (
            <div className="admin-reservation-card" key={reserva.id}>
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
              )}
            </section>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
