import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import MisReservas from './MisReservas';

const reservas = [
  {
    id: 1,
    fecha: '2026-10-25',
    horaInicio: '12:00',
    horaFin: '13:00',
    estado: 'CONFIRMADA',
    cancha: { nombre: 'Cancha Domingo', tipo: 'Futbol 5' },
  },
  {
    id: 2,
    fecha: '2026-10-24',
    horaInicio: '11:00',
    horaFin: '12:00',
    estado: 'PENDIENTE',
    cancha: { nombre: 'Cancha Tarde', tipo: 'Futbol 7' },
  },
  {
    id: 3,
    fecha: '2026-10-24',
    horaInicio: '09:00',
    horaFin: '10:00',
    estado: 'CONFIRMADA',
    cancha: { nombre: 'Cancha Mañana', tipo: 'Futbol 5' },
  },
];

describe('MisReservas', () => {
  it('agrupa por fecha, inicia los días colapsados y permite expandir varios grupos', () => {
    render(<MisReservas reservas={reservas} />);

    const grupos = screen.getAllByRole('region');
    expect(grupos).toHaveLength(2);
    expect(grupos[0]).toHaveAccessibleName(/sábado/i);
    expect(grupos[1]).toHaveAccessibleName(/domingo/i);
    expect(screen.getByText('2 reservas')).toBeInTheDocument();
    expect(screen.getByText('1 reserva')).toBeInTheDocument();
    expect(screen.queryByText('Cancha Mañana')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancha Domingo')).not.toBeInTheDocument();

    const botonesExpandir = screen.getAllByRole('button', { name: /Mostrar reservas del/ });
    fireEvent.click(botonesExpandir[0]);
    fireEvent.click(botonesExpandir[1]);

    expect(botonesExpandir[0]).toHaveAttribute('aria-expanded', 'true');
    expect(botonesExpandir[1]).toHaveAttribute('aria-expanded', 'true');

    const reservasDelSabado = within(grupos[0]).getAllByRole('heading', { level: 3 });
    expect(reservasDelSabado).toHaveLength(3);
    expect(within(grupos[0]).getByText('Cancha Mañana')).toBeInTheDocument();
    expect(within(grupos[0]).getByText('Cancha Tarde')).toBeInTheDocument();
    expect(within(grupos[1]).getByText('Cancha Domingo')).toBeInTheDocument();
    expect(within(grupos[0]).getByLabelText('Estado de la reserva: CONFIRMADA')).toBeInTheDocument();
    expect(within(grupos[0]).getAllByRole('tooltip').some((tooltip) => (
      tooltip.textContent === 'CONFIRMADA'
    ))).toBe(true);
  });
});
