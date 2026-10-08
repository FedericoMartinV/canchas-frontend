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
import { render, screen } from '@testing-library/react';
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

// ---------------------------------------------------------------------------
// SUITE DE PRUEBAS
// ---------------------------------------------------------------------------

describe('ReservasList', () => {
  // -- Caso 1: reserva completa ------------------------------------------

  describe('cuando todas las reservas tienen datos completos', () => {
    it('renderiza el nombre de la cancha de la reserva completa', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      // El nombre de la cancha debe aparecer en pantalla
      expect(screen.getByText('Cancha Central')).toBeInTheDocument();
    });

    it('renderiza la ubicación de la cancha', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      expect(screen.getByText('Av. Siempreviva 742')).toBeInTheDocument();
    });

    it('renderiza el tipo de cancha', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      expect(screen.getByText('FÚTBOL 5')).toBeInTheDocument();
    });

    it('renderiza el nombre completo del usuario', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      // RTL no garantiza el orden del DOM, así que buscamos los textos por separado
      expect(screen.getByText(/Martín/)).toBeInTheDocument();
    });

    it('renderiza el email del usuario', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      expect(screen.getByText('martin@example.com')).toBeInTheDocument();
    });

    it('renderiza el estado de la reserva', () => {
      render(
        <ReservasList reservas={[reservaCompleta]} {...defaultProps} />,
      );

      // El badge de estado aparece con emoji + texto
      expect(screen.getByText(/CONFIRMADA/)).toBeInTheDocument();
    });
  });

  // -- Caso 2: reserva con cancha null ------------------------------------

  describe('cuando una reserva tiene cancha: null', () => {
    it('muestra la tarjeta anómala para la reserva incompleta', () => {
      render(
        <ReservasList reservas={[reservaConCanchaNula]} {...defaultProps} />,
      );

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
      render(
        <ReservasList reservas={[reservaConCanchaNula]} {...defaultProps} />,
      );

      expect(screen.getByText(/Cancha no disponible/)).toBeInTheDocument();
    });

    it('muestra la fecha de la reserva anómala como contexto de debug', () => {
      render(
        <ReservasList reservas={[reservaConCanchaNula]} {...defaultProps} />,
      );

      // La fecha debe aparecer en la tarjeta anómala para facilitar el debug
      expect(screen.getByText(/2025-10-16/)).toBeInTheDocument();
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
      render(
        <ReservasList
          reservas={[reservaCompleta, reservaConCanchaNula]}
          {...defaultProps}
        />,
      );

      // La reserva completa debe verse normalmente
      expect(screen.getByText('Cancha Central')).toBeInTheDocument();
      expect(screen.getByText('martin@example.com')).toBeInTheDocument();
    });

    it('marca la reserva incompleta como anómala en la misma lista', () => {
      render(
        <ReservasList
          reservas={[reservaCompleta, reservaConCanchaNula]}
          {...defaultProps}
        />,
      );

      // La tarjeta anómala debe coexistir con la tarjeta normal
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Datos incompletos — Reserva #2')).toBeInTheDocument();
    });

    it('no muestra más de una tarjeta anómala si solo hay una reserva rota', () => {
      render(
        <ReservasList
          reservas={[reservaCompleta, reservaConCanchaNula]}
          {...defaultProps}
        />,
      );

      // Solo debe haber un role="alert" (el de la reserva con cancha: null)
      const alertas = screen.getAllByRole('alert');
      expect(alertas).toHaveLength(1);
    });
  });

  // -- Caso 4: lista vacía -----------------------------------------------

  describe('cuando no hay reservas', () => {
    it('muestra el mensaje de lista vacía', () => {
      render(<ReservasList reservas={[]} {...defaultProps} />);

      expect(screen.getByText('No hay reservas registradas')).toBeInTheDocument();
    });
  });
});
