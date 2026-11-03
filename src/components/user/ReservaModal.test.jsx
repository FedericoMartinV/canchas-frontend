/**
 * ReservaModal.test.jsx
 *
 * Pruebas unitarias para el componente ReservaModal.
 * Se usa React Testing Library (RTL) + Jest, ambos incluidos por CRA.
 *
 * Cobertura requerida:
 *  (a) Con horaFin <= horaInicio → NO se llama a reservasAPI.create
 *      y aparece el mensaje de error junto al campo horaFin.
 *  (b) Con horarios válidos → se muestra la duración y el precio total correctos.
 *  (c) Con horarios válidos → el submit llama a reservasAPI.create con
 *      exactamente los mismos campos de siempre (usuarioId, canchaId, fecha,
 *      horaInicio, horaFin), sin campos extra.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReservaModal from './ReservaModal';

// ---------------------------------------------------------------------------
// MOCK DE LA CAPA DE API
// Igual que en ReservasList.test.jsx: mockeamos el módulo completo para que
// Jest nunca intente parsear axios (ESM no transformable por CRA).
// reservasAPI.create devuelve una Promise resuelta por defecto.
// ---------------------------------------------------------------------------
jest.mock('../../services/api', () => ({
  reservasAPI: {
    create: jest.fn().mockResolvedValue({ data: { id: 99 } }),
  },
}));

// Importamos el mock DESPUÉS de jest.mock para poder llamar .mockClear()
import { reservasAPI } from '../../services/api';

// ---------------------------------------------------------------------------
// DATOS MOCKEADOS
// ---------------------------------------------------------------------------

/** Cancha de prueba con precio numérico (el componente lo convierte con Number() igualmente). */
const canchaBase = {
  id: 5,
  nombre: 'Cancha Norte',
  ubicacion: 'Av. Corrientes 1234',
  tipo: 'FÚTBOL 5',
  precioPorHora: 1200,
};

/** Usuario mínimo necesario para armar el payload. */
const userBase = {
  id: 7,
  nombre: 'Laura',
};

/** Props base para el componente; los callbacks son mocks vacíos. */
const defaultProps = {
  cancha: canchaBase,
  user: userBase,
  onClose: jest.fn(),
  onReservaCreada: jest.fn(),
  agregarNotificacion: jest.fn(),
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Devuelve la fecha de mañana en formato YYYY-MM-DD usando HORA LOCAL.
 *
 * Por qué no usamos una fecha fija (ej. '2026-11-01'):
 *   El input de fecha del componente tiene min = hoy. Si la fecha fija
 *   queda en el pasado, el formulario se vuelve inválido y los tests
 *   fallarían sin que nadie haya tocado el código.
 *
 * Por qué no usamos toISOString():
 *   toISOString() usa UTC. Después de las 21:00 en Argentina (UTC-3)
 *   devuelve el día siguiente, reintroduciendo el mismo bug que corregimos
 *   en el componente con fechaLocalHoy().
 */
function fechaFutura() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const anio = manana.getFullYear();
  const mes  = String(manana.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexed
  const dia  = String(manana.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Renderiza ReservaModal con defaultProps, completa los inputs de fecha,
 * horaInicio y horaFin usando fireEvent.change, y retorna el botón submit.
 *
 * Seleccionamos los inputs por posición en el DOM porque los labels
 * tienen íconos SVG inline que dificultan el uso de getByLabelText.
 * Orden garantizado por el marcado: date[0], time[1]=inicio, time[2]=fin.
 *
 * El parámetro fecha usa fechaFutura() como default para que el campo
 * tenga siempre una fecha válida respecto al min = hoy del componente.
 */
function completarFormulario({ fecha = fechaFutura(), horaInicio, horaFin } = {}) {
  render(<ReservaModal {...defaultProps} />);

  // Obtenemos los inputs por el atributo type (orden de aparición en el DOM)
  const allInputs = document.querySelectorAll('input');
  const inputDate   = allInputs[0]; // type="date"
  const inputInicio = allInputs[1]; // type="time" → horaInicio
  const inputFin    = allInputs[2]; // type="time" → horaFin

  fireEvent.change(inputDate,   { target: { value: fecha } });
  fireEvent.change(inputInicio, { target: { value: horaInicio } });
  fireEvent.change(inputFin,    { target: { value: horaFin } });

  return screen.getByRole('button', { name: /Confirmar Reserva/i });
}

// ---------------------------------------------------------------------------
// SUITE DE PRUEBAS
// ---------------------------------------------------------------------------

describe('ReservaModal', () => {
  // Limpiamos mocks entre tests para no contaminar llamadas
  beforeEach(() => {
    reservasAPI.create.mockClear();
    defaultProps.onClose.mockClear();
    defaultProps.onReservaCreada.mockClear();
    defaultProps.agregarNotificacion.mockClear();
  });

  // --------------------------------------------------------------------------
  // (a) horaFin <= horaInicio → error inline, sin llamada a la API
  // --------------------------------------------------------------------------

  describe('(a) cuando horaFin es menor que horaInicio', () => {
    /**
     * 01:00 como fin con 23:00 como inicio → fin < inicio en minutos.
     * Caso de cruce de medianoche: debe rechazarse con mensaje específico.
     */
    it('muestra el error "mismo día" junto al campo horaFin', () => {
      completarFormulario({ horaInicio: '23:00', horaFin: '01:00' });

      // El mensaje de error aparece en un elemento con role="alert"
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('mismo día');
    });

    it('no llama a reservasAPI.create al hacer submit con horaFin < horaInicio', async () => {
      const btnSubmit = completarFormulario({ horaInicio: '23:00', horaFin: '01:00' });

      fireEvent.click(btnSubmit);

      // Damos un tick para cubrir cualquier efecto async
      await waitFor(() => {
        expect(reservasAPI.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('(a) cuando horaFin es igual a horaInicio', () => {
    it('muestra el error "posterior" junto al campo horaFin', () => {
      completarFormulario({ horaInicio: '10:00', horaFin: '10:00' });

      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('posterior');
    });

    it('no llama a reservasAPI.create al hacer submit con horaFin === horaInicio', async () => {
      const btnSubmit = completarFormulario({ horaInicio: '10:00', horaFin: '10:00' });

      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(reservasAPI.create).not.toHaveBeenCalled();
      });
    });
  });

  // --------------------------------------------------------------------------
  // (b) Horarios válidos → duración y precio total correctos en pantalla
  // --------------------------------------------------------------------------

  describe('(b) cuando los horarios son válidos', () => {
    /**
     * 10:00 → 11:30 = 90 min = 1 h 30 min
     * Precio: 1.5 h × $1200 = $1800
     */
    it('muestra la duración "1 h 30 min" para 10:00 → 11:30', () => {
      completarFormulario({ horaInicio: '10:00', horaFin: '11:30' });

      expect(screen.getByText('1 h 30 min')).toBeInTheDocument();
    });

    it('muestra la duración "1 h" para 09:00 → 10:00', () => {
      completarFormulario({ horaInicio: '09:00', horaFin: '10:00' });

      expect(screen.getByText('1 h')).toBeInTheDocument();
    });

    it('muestra el precio total de 1800 para 1.5 h × $1200', () => {
      completarFormulario({ horaInicio: '10:00', horaFin: '11:30' });

      /*
       * toLocaleString('es-AR') puede formatear 1800 como "1.800" (con punto
       * de miles) en algunos entornos de Node, o como "1800" en otros.
       * Usamos regex para capturar ambos casos.
       */
      expect(screen.getByText(/1.?800/)).toBeInTheDocument();
    });

    it('muestra el precio total de 1200 para 1 h × $1200', () => {
      completarFormulario({ horaInicio: '09:00', horaFin: '10:00' });

      /*
       * CORRECCIÓN: el test anterior usaba getAllByText(/1.?200/) en toda la
       * pantalla. Ese regex también coincide con "$1200/hora" del card de la
       * cancha, así que habría pasado aunque el total estuviera MAL calculado.
       *
       * Ahora ancamos la búsqueda: encontramos el elemento que dice
       * "Precio total" y luego verificamos el texto del nodo hermano
       * que contiene el valor numérico dentro del mismo contenedor flex.
       *
       * toLocaleString('es-AR') puede formatear 1200 como "1.200" (punto de
       * miles) en algunos entornos de Node, o como "1200" en otros.
       * El regex /1[,.]?200/ captura ambas variantes sin falsos positivos.
       */
      const labelPrecio = screen.getByText('Precio total');
      // El valor está en el span hermano dentro del mismo div flex
      const valorPrecio = labelPrecio.nextElementSibling;
      expect(valorPrecio).not.toBeNull();
      expect(valorPrecio.textContent).toMatch(/1[.,]?200/);
    });

    it('no muestra ningún error en el campo horaFin cuando los horarios son válidos', () => {
      completarFormulario({ horaInicio: '10:00', horaFin: '11:30' });

      // Sin error → no debe haber ningún role="alert"
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // (c) Submit válido → reservasAPI.create recibe el payload exacto de siempre
  // --------------------------------------------------------------------------

  describe('(c) envío del formulario con horarios válidos', () => {
    it('muestra dentro del modal cuando el horario ya está ocupado', async () => {
      reservasAPI.create.mockRejectedValueOnce({
        response: { status: 409, data: { message: 'Conflicto de horario' } },
      });
      const btnSubmit = completarFormulario({
        fecha: fechaFutura(),
        horaInicio: '10:00',
        horaFin: '11:30',
      });

      fireEvent.click(btnSubmit);

      const aviso = await screen.findByRole('alert');
      expect(aviso).toHaveTextContent('Ese horario ya está ocupado');
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onReservaCreada).not.toHaveBeenCalled();
      expect(defaultProps.agregarNotificacion).not.toHaveBeenCalled();
      expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
    });

    it('llama a reservasAPI.create una sola vez con los campos correctos', async () => {
      // Usamos fechaFutura() y la guardamos en una constante para que el
      // valor pasado al formulario y el valor esperado en toHaveBeenCalledWith
      // sean siempre idénticos, sin importar cuándo corra el test.
      const fecha = fechaFutura();

      const btnSubmit = completarFormulario({
        fecha,
        horaInicio: '10:00',
        horaFin: '11:30',
      });

      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(reservasAPI.create).toHaveBeenCalledTimes(1);
      });

      /*
       * El contrato con la API no cambió: se reciben exactamente
       * usuarioId, canchaId, fecha, horaInicio y horaFin.
       */
      expect(reservasAPI.create).toHaveBeenCalledWith({
        usuarioId: userBase.id,      // 7
        canchaId: canchaBase.id,     // 5
        fecha,                       // valor dinámico: mañana en hora local
        horaInicio: '10:00',
        horaFin: '11:30',
      });
    });

    it('llama a onReservaCreada cuando la API responde con éxito', async () => {
      const btnSubmit = completarFormulario({
        fecha: fechaFutura(),
        horaInicio: '10:00',
        horaFin: '11:30',
      });

      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(defaultProps.onReservaCreada).toHaveBeenCalledTimes(1);
      });
    });

    it('dispara una notificación de éxito con "Reserva creada"', async () => {
      const btnSubmit = completarFormulario({
        fecha: fechaFutura(),
        horaInicio: '10:00',
        horaFin: '11:30',
      });

      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(defaultProps.agregarNotificacion).toHaveBeenCalledWith(
          expect.stringContaining('Reserva creada'),
          'success'
        );
      });
    });
  });
});
