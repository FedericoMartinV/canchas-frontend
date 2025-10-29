import React, { useState, useEffect } from 'react';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import CanchasList from './CanchasList';
import ReservasList from './ReservasList';
import CanchaForm from './CanchaForm';
import { canchasAPI, reservasAPI } from '../../services/api';
import { Plus } from 'lucide-react';

export default function AdminPanel({ user, logout, agregarNotificacion }) {
  const [tab, setTab] = useState('canchas');
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargarCanchas();
    cargarReservas();
  }, []);

  const cargarCanchas = async () => {
    try {
      const res = await canchasAPI.getAll();
      setCanchas(res.data);
    } catch (error) {
      agregarNotificacion('Error al cargar canchas', 'error');
    }
  };

  const cargarReservas = async () => {
    try {
      const res = await reservasAPI.getAll();
      setReservas(res.data);
    } catch (error) {
      agregarNotificacion('Error al cargar reservas', 'error');
    }
  };

  const handleCanchaCreada = () => {
    setShowForm(false);
    cargarCanchas();
  };

  const handleCanchaEliminada = () => {
    cargarCanchas();
  };

  const handleReservaActualizada = () => {
    cargarReservas();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        logout={logout} 
        title="Panel de Administrador 🛡️"
        subtitle="Gestiona canchas y reservas"
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('canchas')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              tab === 'canchas'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            🏟️ Gestionar Canchas
          </button>
          <button
            onClick={() => setTab('reservas')}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              tab === 'reservas'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl scale-105'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            📋 Ver Reservas
          </button>
        </div>

        {/* Contenido */}
        {tab === 'canchas' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Canchas Disponibles</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus size={20} />
                {showForm ? 'Cancelar' : 'Nueva Cancha'}
              </button>
            </div>

            {showForm && (
              <CanchaForm 
                onCanchaCreada={handleCanchaCreada}
                agregarNotificacion={agregarNotificacion}
              />
            )}

            <CanchasList 
              canchas={canchas}
              onCanchaEliminada={handleCanchaEliminada}
              agregarNotificacion={agregarNotificacion}
            />
          </div>
        )}

        {tab === 'reservas' && (
          <ReservasList 
            reservas={reservas}
            onReservaActualizada={handleReservaActualizada}
            agregarNotificacion={agregarNotificacion}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
