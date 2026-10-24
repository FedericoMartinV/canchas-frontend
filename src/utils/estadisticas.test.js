import { calcularEstadisticas } from './estadisticas';

describe('calcularEstadisticas', () => {
  it('incluye reservas canceladas en sus variantes de estado y las separa de las confirmadas', () => {
    const reservas = [
      {
        fecha: '2026-10-03',
        estado: 'CONFIRMADA',
        horaInicio: '10:00',
        horaFin: '11:00',
        cancha: { id: 1, nombre: 'Cancha Central', precioPorHora: 100 },
      },
      { fecha: '2026-10-04', estado: 'CANCELADA' },
      { fecha: '2026-10-05', estado: 'CANCELADO' },
      { fecha: '2026-10-06', estado: 'cancelled' },
      { fecha: '2026-10-07', estado: 'PENDIENTE' },
      { fecha: '2026-09-30', estado: 'CANCELADA' },
    ];

    const { stats, porCancha } = calcularEstadisticas(reservas, 10, 2026);

    expect(stats).toMatchObject({
      totalReservas: 5,
      reservasConfirmadas: 1,
      reservasPendientes: 1,
      reservasCanceladas: 3,
      horasTotalesReservadas: 1,
      ingresosTotales: 100,
    });
    expect(porCancha).toHaveLength(1);
    expect(porCancha[0].cantidadReservas).toBe(1);
  });
});
