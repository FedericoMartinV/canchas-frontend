import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanchasGrid from './CanchasGrid';

describe('CanchasGrid', () => {
  it('muestra el tipo de cancha con el ícono de pelota y el tooltip propio', () => {
    render(
      <CanchasGrid
        canchas={[{
          id: 1,
          nombre: 'Cancha Norte',
          ubicacion: 'Av. Principal 123',
          tipo: 'Futbol 7',
          precioPorHora: 12000,
          iluminacion: true,
        }]}
        onReservar={jest.fn()}
      />,
    );

    const tipoCancha = screen.getByRole('img', { name: 'Tipo de cancha: Fútbol 7' });
    expect(tipoCancha).toBeInTheDocument();
    expect(tipoCancha).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Fútbol 7');
  });
});
