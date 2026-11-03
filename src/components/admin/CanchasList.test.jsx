import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanchasList from './CanchasList';
import { canchasAPI } from '../../services/api';

jest.mock('../../services/api', () => ({
  canchasAPI: {
    delete: jest.fn(),
  },
}));

const cancha = {
  id: 5,
  nombre: 'Cancha Central',
  ubicacion: 'Av. Siempreviva 742',
  tipo: 'Futbol 5',
  precioPorHora: 15000,
  iluminacion: true,
};

describe('CanchasList', () => {
  let onCanchaEliminada;
  let agregarNotificacion;

  beforeEach(() => {
    jest.clearAllMocks();
    onCanchaEliminada = jest.fn();
    agregarNotificacion = jest.fn();
  });

  const renderCanchas = () => render(
    <CanchasList
      canchas={[cancha]}
      onCanchaEditar={jest.fn()}
      onCanchaEliminada={onCanchaEliminada}
      agregarNotificacion={agregarNotificacion}
    />,
  );

  it('muestra el tipo de cancha como una pelota con el número y una descripción accesible', () => {
    renderCanchas();

    expect(screen.getByRole('img', { name: 'Tipo de cancha: Fútbol 5' })).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Fútbol 5');
  });

  it('abre un modal propio y permite cancelar sin eliminar la cancha', () => {
    renderCanchas();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Cancha' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Cancha Central');

    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(canchasAPI.delete).not.toHaveBeenCalled();
  });

  it('elimina la cancha al confirmar desde el modal', async () => {
    canchasAPI.delete.mockResolvedValue({});
    renderCanchas();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Cancha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar cancha' }));

    await waitFor(() => {
      expect(canchasAPI.delete).toHaveBeenCalledWith(5);
    });
    expect(onCanchaEliminada).toHaveBeenCalledTimes(1);
    expect(agregarNotificacion).toHaveBeenCalledWith('Cancha eliminada correctamente', 'success');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
