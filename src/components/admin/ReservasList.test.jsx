/**
 * ReservasList.test.jsx
 *
 * Pruebas unitarias para el componente ReservasList.
 * Se usa React Testing Library (RTL) + Jest, ambos incluidos por CRA.
 *
 * Cobertura mínima requerida:
 *  1. Reserva completa → se renderiza con sus datos normales.
 *  2. Reserva con cancha: null → se marca como anómala sin romper el resto.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReservasList from './ReservasList';

/*
 * MOCK DE LA CAPA DE API
 * ReservasList importa reservasAPI desde '../../services/api', que a su vez
 * importa axios (ESM). Jest con la config de CRA no puede transformar módulos
 * de node_modules que usen ESM, por lo que el suite falla antes de correr.
 * Mockeamos el módulo completo para que Jest nunca intente parsear axios.
 * Los tests aquí solo verifican el renderizado, no las llamadas HTTP.
 */
jest.mock('../../services/api', () => ({
  reservasAPI: {
    confirmar: jest.fn(),
    cancelar: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// DATOS MOCKEADOS
// ---------------------------------------------------------------------------

/**
 * Reserva completa: tiene cancha y usuario populados con todos sus campos.
 * Representa el caso feliz que debe renderizarse con datos normales.
 */
const reservaCompleta = {
  id: 1,
  fecha: '2025-10-15',
  horaInicio: '10:00',
  horaFin: '11:00',
  estado: 'CONFIRMADA',
  cancha: {
    nombre: 'Cancha Central',
    ubicacion: 'Av. Siempreviva 742',
    tipo: 'FÚTBOL 5',
  },
  usuario: {
    nombre: 'Martín',
    apellido: 'García',
    email: 'martin@example.com',
    telefono: '11-2345-6789',
  },
};

/**
 * Reserva incompleta: cancha es null para simular que el backend no populó
 * la relación (JOIN faltante, cancha eliminada, etc.).
 * Debe mostrarse como tarjeta anómala sin tirar TypeError.
 */
const reservaConCanchaNula = {
  id: 2,
  fecha: '2025-10-16',
  horaInicio: '12:00',
  horaFin: '13:00',
  estado: 'PENDIENTE',
  cancha: null,   // ← relación rota intencional
  usuario: {
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana@example.com',
    telefono: '11-9876-5432',
  },
};

const reservaConCanchaNulaMismaFecha = {
  ...reservaConCanchaNula,
  fecha: reservaCompleta.fecha,
};

// ---------------------------------------------------------------------------
// HELPERS DE PRUEBA
// ---------------------------------------------------------------------------

/**
 * Props mínimas que necesita ReservasList.
 * Los callbacks son jest.fn() vacíos; no necesitamos verificar su lógica aquí.
 */
const defaultProps = {
  onReservaActualizada: jest.fn(),
  agregarNotificacion: jest.fn(),
};

const renderReservasEnFecha = (reservas, fecha = reservas[0]?.fecha) => {
  render(<ReservasList reservas={reservas} {...defaultProps} />);
  if (!fecha) return;

  const [anio, mes] = fecha.split('-').map(Number);
  const hoy = new Date();
  const diferenciaMeses = (anio - hoy.getFullYear()) * 12 + (mes - 1 - hoy.getMonth());
  const botonMes = diferenciaMeses < 0 ? 'Mes anterior' : 'Mes siguiente';

  for (let paso = 0; paso < Math.abs(diferenciaMeses); paso += 1) {
    fireEvent.click(screen.getByRole('button', { name: botonMes }));
  }

  const cantidadReservas = reservas.filter((reserva) => reserva.fecha === fecha).length;
  fireEvent.click(screen.getByRole('button', {
    name: new RegExp(`${fecha}, ${cantidadReservas} reservas`),
  }));
};

// ---------------------------------------------------------------------------
// SUITE DE PRUEBAS
// ---------------------------------------------------------------------------

describe('ReservasList', () => {
  it('marca en el calendario los días que tienen reservas pendientes', () => {
    const hoy = new Date();
    const fechaHoy = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    const reservasDeHoy = [
      { ...reservaCompleta, id: 10, fecha: fechaHoy, estado: 'PENDIENTE' },
      { ...reservaCompleta, id: 11, fecha: fechaHoy, estado: 'CONFIRMADA' },
    ];
    render(<ReservasList reservas={reservasDeHoy} {...defaultProps} />);

    const diaConPendiente = screen.getByRole('button', {
      name: `${fechaHoy}, 2 reservas, 1 pendiente`,
    });
    expect(diaConPendiente).toHaveClass('has-pending-reservations');
    expect(screen.getByRole('tooltip')).toHaveTextContent('1 solicitud pendiente');
  });

  it('filtra las reservas al seleccionar un día del calendario', () => {
    const hoy = new Date();
    const fechaSeleccionada = [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-');
    const reservasDelDia = [
      { ...reservaCompleta, id: 3, fecha: fechaSeleccionada, cancha: { ...reservaCompleta.cancha, nombre: 'Cancha del día' } },
      { ...reservaCompleta, id: 4, fecha: fechaSeleccionada, horaInicio: '08:00', horaFin: '09:00', cancha: { ...reservaCompleta.cancha, nombre: 'Cancha temprana' } },
      { ...reservaCompleta, id: 5, fecha: '2025-10-15', cancha: { ...reservaCompleta.cancha, nombre: 'Cancha de otro día' } },
    ];
    render(
      <ReservasList reservas={reservasDelDia} {...defaultProps} />,
    );

    const diaConReservas = screen.getByRole('button', { name: new RegExp(`${fechaSeleccionada}, 2 reservas`) });
    expect(diaConReservas).toHaveClass('has-reservations');
    fireEvent.click(diaConReservas);

    expect(screen.queryByLabelText('Calendario de reservas')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al calendario' })).toBeInTheDocument();
    expect(screen.getByText('Cancha del día')).toBeInTheDocument();
    expect(screen.getByText('Cancha temprana')).toBeInTheDocument();
    expect(screen.queryByText('Cancha de otro día')).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
        .filter((name) => ['Cancha temprana', 'Cancha del día'].includes(name)),
    ).toEqual(['Cancha temprana', 'Cancha del día']);
  });

  it('muestra todas las reservas sin volver a mostrar el calendario', () => {
    const otraReservaMismoDia = {
      ...reservaCompleta,
      id: 3,
      horaInicio: '08:00',
      horaFin: '09:00',
      cancha: { ...reservaCompleta.cancha, nombre: 'Cancha temprana' },
    };
    render(
      <ReservasList
        reservas={[reservaCompleta, otraReservaMismoDia, reservaConCanchaNula]}
        {...defaultProps}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver todas' }));

    expect(screen.queryByLabelText('Calendario de reservas')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver al calendario' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver todas' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /miércoles, 15 de octubre de 2025|jueves, 16 de octubre de 2025/i })).toHaveLength(2);
    expect(screen.getAllByRole('heading', { name: /miércoles, 15 de octubre de 2025/i })[0])
      .toHaveTextContent(/miércoles/i);
    expect(screen.getByText('2 reservas')).toBeInTheDocument();
    expect(screen.getByText('1 reserva')).toBeInTheDocument();
    expect(screen.queryByText('Cancha Central')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancha temprana')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const grupoMiercoles = screen.getByRole('button', {
      name: 'Mostrar reservas del Miércoles, 15 de octubre de 2025',
    });
    fireEvent.click(grupoMiercoles);
    expect(screen.getByText('Cancha Central')).toBeInTheDocument();
    expect(screen.getByText('Cancha temprana')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {
      name: 'Mostrar reservas del Jueves, 16 de octubre de 2025',
    }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Ocultar reservas del/ })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Volver al calendario' }));
    expect(screen.getByLabelText('Calendario de reservas')).toBeInTheDocument();
  });

  // -- Caso 1: reserva completa ------------------------------------------

  describe('cuando todas las reservas tienen datos completos', () => {
    it('renderiza el nombre de la cancha de la reserva completa', () => {
      renderReservasEnFecha([reservaCompleta]);

      // El nombre de la cancha debe aparecer en pantalla
      expect(screen.getByText('Cancha Central')).toBeInTheDocument();
    });

    it('no muestra la ubicación en la tarjeta de reserva', () => {
      renderReservasEnFecha([reservaCompleta]);

      expect(screen.queryByText('Av. Siempreviva 742')).not.toBeInTheDocument();
    });

    it('renderiza el tipo de cancha', () => {
      renderReservasEnFecha([reservaCompleta]);

      expect(screen.getByText('FÚTBOL 5')).toBeInTheDocument();
    });

    it('renderiza el nombre completo del usuario', () => {
      renderReservasEnFecha([reservaCompleta]);

      // RTL no garantiza el orden del DOM, así que buscamos los textos por separado
      expect(screen.getByText(/Martín/)).toBeInTheDocument();
    });

    it('renderiza el email del usuario', () => {
      renderReservasEnFecha([reservaCompleta]);

      expect(screen.getByText('martin@example.com')).toBeInTheDocument();
    });

    it('renderiza el estado de la reserva', () => {
      renderReservasEnFecha([reservaCompleta]);

      expect(screen.getByLabelText('Estado de la reserva: CONFIRMADA')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('CONFIRMADA');
    });
  });

  // -- Caso 2: reserva con cancha null ------------------------------------

  describe('cuando una reserva tiene cancha: null', () => {
    it('muestra la tarjeta anómala para la reserva incompleta', () => {
      renderReservasEnFecha([reservaConCanchaNula]);

      /*
       * La tarjeta anómala debe indicar el ID de la reserva afectada.
       * Buscamos por role="alert" para verificar también la accesibilidad.
       */
      const alerta = screen.getByRole('alert');
      expect(alerta).toBeInTheDocument();
      expect(alerta).toHaveTextContent('Datos incompletos');
      expect(alerta).toHaveTextContent('Reserva #2');
    });

    it('indica que la cancha no está disponible', () => {
      renderReservasEnFecha([reservaConCanchaNula]);

      expect(screen.getByText(/Cancha no disponible/)).toBeInTheDocument();
    });

    it('muestra la fecha de la reserva anómala como subtítulo fuera de la tarjeta', () => {
      renderReservasEnFecha([reservaConCanchaNula]);

      expect(
        screen.getByRole('heading', { name: /jueves, 16 de octubre de 2025/i }),
      ).toBeInTheDocument();
    });
  });

  // -- Caso 3: lista mixta -----------------------------------------------

  describe('cuando la lista mezcla reservas completas e incompletas', () => {
    it('renderiza la reserva completa con sus datos sin errores', () => {
      /*
       * Este es el test central del guard: pasamos AMBAS reservas al mismo
       * tiempo. Si el guard falla, el TypeError de reservaConCanchaNula
       * destruiría todo el .map() y la reserva completa tampoco aparecería.
       */
      renderReservasEnFecha([reservaCompleta, reservaConCanchaNulaMismaFecha], reservaCompleta.fecha);

      // La reserva completa debe verse normalmente
      expect(screen.getByText('Cancha Central')).toBeInTheDocument();
      expect(screen.getByText('martin@example.com')).toBeInTheDocument();
    });

    it('marca la reserva incompleta como anómala en la misma lista', () => {
      renderReservasEnFecha([reservaCompleta, reservaConCanchaNulaMismaFecha], reservaCompleta.fecha);

      // La tarjeta anómala debe coexistir con la tarjeta normal
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Datos incompletos — Reserva #2')).toBeInTheDocument();
    });

    it('no muestra más de una tarjeta anómala si solo hay una reserva rota', () => {
      renderReservasEnFecha([reservaCompleta, reservaConCanchaNulaMismaFecha], reservaCompleta.fecha);

      // Solo debe haber un role="alert" (el de la reserva con cancha: null)
      const alertas = screen.getAllByRole('alert');
      expect(alertas).toHaveLength(1);
    });
  });

  // -- Caso 4: lista vacía -----------------------------------------------

  describe('cuando no hay reservas', () => {
    it('muestra el mensaje de lista vacía', () => {
      render(<ReservasList reservas={[]} {...defaultProps} />);

      fireEvent.click(screen.getAllByRole('button', { name: /sin reservas/ })[0]);
      expect(screen.getByText('No hay reservas para este día')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Volver al calendario' }));
      fireEvent.click(screen.getByRole('button', { name: 'Ver todas' }));
      expect(screen.getByText('No hay reservas registradas')).toBeInTheDocument();
    });
  });
});
