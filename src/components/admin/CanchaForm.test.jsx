import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanchaForm from './CanchaForm';
import { canchasAPI } from '../../services/api';

jest.mock('../../services/api', () => ({
  canchasAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const cancha = {
  id: 'cancha-1',
  nombre: 'Cancha Central',
  ubicacion: 'Av. Siempreviva 742',
  tipo: 'Futbol 7',
  precioPorHora: 15000,
  iluminacion: false,
};

describe('CanchaForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('carga los datos actuales y actualiza la cancha seleccionada', async () => {
    const onCanchaGuardada = jest.fn();
    const agregarNotificacion = jest.fn();
    canchasAPI.update.mockResolvedValue({});

    render(
      <CanchaForm
        cancha={cancha}
        onCanchaGuardada={onCanchaGuardada}
        agregarNotificacion={agregarNotificacion}
      />,
    );

    expect(screen.getByLabelText('Nombre de la cancha')).toHaveValue('Cancha Central');
    expect(screen.getByLabelText('Ubicación')).toHaveValue('Av. Siempreviva 742');
    expect(screen.getByLabelText('Tipo de cancha')).toHaveValue('Futbol 7');
    expect(screen.getByLabelText('Precio por hora ($)')).toHaveValue(15000);
    expect(screen.getByLabelText('Tiene iluminación 💡')).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(canchasAPI.update).toHaveBeenCalledWith('cancha-1', {
        nombre: 'Cancha Central',
        ubicacion: 'Av. Siempreviva 742',
        tipo: 'Futbol 7',
        precioPorHora: 15000,
        iluminacion: false,
      });
    });
    expect(canchasAPI.create).not.toHaveBeenCalled();
    expect(agregarNotificacion).toHaveBeenCalledWith(
      'Cancha actualizada correctamente',
      'success',
    );
    expect(onCanchaGuardada).toHaveBeenCalledTimes(1);
  });
});
