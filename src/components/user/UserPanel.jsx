import React, { useState, useEffect } from 'react';
// MainLayout ya incluye Header y Footer, por eso acá ya no se importan
import MainLayout from '../layout/MainLayout';
import CanchasGrid from './CanchasGrid';
import MisReservas from './MisReservas';
import ReservaModal from './ReservaModal';
import { canchasAPI, reservasAPI } from '../../services/api';

export default function UserPanel({ user, logout, agregarNotificacion }) {
  const [tab, setTab] = useState('canchas');
  const [canchas, setCanchas] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([cargarCanchas(), cargarMisReservas()]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCanchas = async () => {
    try {
      const res = await canchasAPI.getAll();
      setCanchas(res.data);
    } catch (error) {
      agregarNotificacion('Error al cargar canchas', 'error');
    }
  };

  const cargarMisReservas = async () => {
    try {
      const res = await reservasAPI.getByUsuario(user.id);
      setMisReservas(res.data);
    } catch (error) {
      agregarNotificacion('Error al cargar reservas', 'error');
    }
  };

  const handleReservaCreada = () => {
    setSelectedCancha(null);
    cargarMisReservas();
    setTab('reservas');
  };

  /*
   * MainLayout aporta el contenedor raíz, el Header, el <main> con el
   * contenedor centrado y el Footer. Lo que va entre sus etiquetas es el
   * "children" que se muestra dentro de <main>.
   *
   * El ReservaModal ahora va como último hijo. Antes estaba entre el
   * contenido y el Footer, pero como el modal usa "fixed inset-0" se
   * posiciona respecto de la ventana, así que visualmente no cambia.
   */
  return (
    <MainLayout
      user={user}
      logout={logout}
      title={`¡Hola, ${user.nombre}! ⚽`}
      subtitle="Encuentra y reserva tu cancha ideal"
    >
      {/* Tabs con diseño mejorado */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('canchas')}
          className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${tab === 'canchas'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
              : 'bg-white text-gray-700 shadow-md hover:shadow-lg hover:scale-102'
            }`}
        >
          🏟️ Canchas Disponibles
        </button>
        <button
          onClick={() => setTab('reservas')}
          className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${tab === 'reservas'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
              : 'bg-white text-gray-700 shadow-md hover:shadow-lg hover:scale-102'
            }`}
        >
          📅 Mis Reservas {misReservas.length > 0 && (
            <span className="ml-2 bg-white text-green-600 px-2 py-1 rounded-full text-sm">
              {misReservas.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⚽</div>
            <p className="text-xl font-semibold text-gray-700">Cargando...</p>
          </div>
        </div>
      ) : (
        <>
          {tab === 'canchas' ? (
            <CanchasGrid
              canchas={canchas}
              onReservar={setSelectedCancha}
            />
          ) : (
            <MisReservas
              reservas={misReservas}
            />
          )}
        </>
      )}

      {selectedCancha && (
        <ReservaModal
          cancha={selectedCancha}
          user={user}
          onClose={() => setSelectedCancha(null)}
          onReservaCreada={handleReservaCreada}
          agregarNotificacion={agregarNotificacion}
        />
      )}
    </MainLayout>
  );
}