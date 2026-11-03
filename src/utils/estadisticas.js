import { localTimeAMinutos } from './tiempo';

const normalizarEstado = (estado) => String(estado ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toUpperCase()
  .replace(/[\s_-]+/g, '');

const esEstadoCancelado = (estado) =>
  ['CANCELADA', 'CANCELADO', 'CANCELED', 'CANCELLED'].includes(normalizarEstado(estado));

const duracionEnHoras = (horaInicio, horaFin) => {
  const diferencia = localTimeAMinutos(horaFin) - localTimeAMinutos(horaInicio);
  return diferencia > 0 ? diferencia / 60 : 0;
};

export function calcularEstadisticas(reservas, mes, anio) {
  const delMes = reservas.filter((reserva) => {
    if (!reserva.fecha) return false;
    const [anioReserva, mesReserva] = reserva.fecha.split('-').map(Number);
    return anioReserva === anio && mesReserva === mes;
  });

  const confirmadas = delMes.filter((reserva) => normalizarEstado(reserva.estado) === 'CONFIRMADA');
  const pendientes = delMes.filter((reserva) => normalizarEstado(reserva.estado) === 'PENDIENTE');
  const canceladas = delMes.filter((reserva) => esEstadoCancelado(reserva.estado));

  const horasTotales = confirmadas.reduce(
    (total, reserva) => total + duracionEnHoras(reserva.horaInicio, reserva.horaFin),
    0,
  );

  const ingresosTotales = confirmadas.reduce((total, reserva) => {
    const precio = Number(reserva.cancha?.precioPorHora ?? 0);
    const horas = duracionEnHoras(reserva.horaInicio, reserva.horaFin);
    return total + precio * horas;
  }, 0);

  const porCanchaMap = {};
  confirmadas.forEach((reserva) => {
    const id = reserva.cancha?.id ?? 'sin-cancha';
    const nombre = reserva.cancha?.nombre ?? 'Sin cancha';
    const precio = Number(reserva.cancha?.precioPorHora ?? 0);
    const horas = duracionEnHoras(reserva.horaInicio, reserva.horaFin);

    if (!porCanchaMap[id]) {
      porCanchaMap[id] = {
        nombreCancha: nombre,
        cantidadReservas: 0,
        horasReservadas: 0,
        ingresos: 0,
      };
    }
    porCanchaMap[id].cantidadReservas += 1;
    porCanchaMap[id].horasReservadas += horas;
    porCanchaMap[id].ingresos += precio * horas;
  });

  return {
    stats: {
      totalReservas: delMes.length,
      reservasConfirmadas: confirmadas.length,
      reservasPendientes: pendientes.length,
      reservasCanceladas: canceladas.length,
      horasTotalesReservadas: horasTotales,
      ingresosTotales,
    },
    porCancha: Object.values(porCanchaMap),
  };
}
