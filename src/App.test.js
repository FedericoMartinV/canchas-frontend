import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/api', () => ({
  authAPI: { login: jest.fn() },
  canchasAPI: { getAll: jest.fn() },
  reservasAPI: {
    getAll: jest.fn(),
    getByUsuario: jest.fn(),
    confirmar: jest.fn(),
    cancelar: jest.fn(),
  },
}));

test('renders the login screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Futbol Reservas' })).toBeInTheDocument();
});
