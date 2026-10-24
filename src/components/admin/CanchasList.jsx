import React, { useState } from 'react';
import { MapPin, DollarSign, Trash2, Users, Pencil, AlertTriangle } from 'lucide-react';
import { canchasAPI } from '../../services/api';

export default function CanchasList({ canchas, onCanchaEliminada, onCanchaEditar, agregarNotificacion }) {
  const [canchaAEliminar, setCanchaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const eliminarCancha = async () => {
    if (!canchaAEliminar) return;

    setEliminando(true);
    try {
      await canchasAPI.delete(canchaAEliminar.id);
      setCanchaAEliminar(null);
      agregarNotificacion('Cancha eliminada correctamente', 'success');
      onCanchaEliminada();
    } catch (error) {
      setCanchaAEliminar(null);
      agregarNotificacion('Error al eliminar cancha', 'error');
    } finally {
      setEliminando(false);
    }
  };

  if (canchas.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="text-6xl mb-4">🏟️</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay canchas registradas</h3>
        <p className="text-gray-600">Crea la primera cancha para comenzar</p>
      </div>
    );
  }

  return (
    <div className="admin-court-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {canchas.map(cancha => (
        <div key={cancha.id} className="card-cancha admin-court-card group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{cancha.nombre}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={16} className="text-green-600" />
                {cancha.ubicacion}
              </p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              {cancha.tipo}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Users size={18} className="text-green-600" />
                Capacidad:
              </span>
              <span className="font-semibold text-gray-800">
                {cancha.tipo === 'Futbol 5' ? '10 jugadores' : 
                 cancha.tipo === 'Futbol 7' ? '14 jugadores' : '22 jugadores'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Iluminación:</span>
              <span className="font-semibold">
                {cancha.iluminacion ? '💡 Sí' : '🌙 No'}
              </span>
            </div>

            <div className="pt-3 border-t-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold">Precio/hora:</span>
                <span className="text-3xl font-bold text-green-600 flex items-center">
                  <DollarSign size={24} />
                  {cancha.precioPorHora}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onCanchaEditar(cancha)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Pencil size={18} />
            Editar Cancha
          </button>

          <button
            onClick={() => setCanchaAEliminar(cancha)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Trash2 size={18} />
            Eliminar Cancha
          </button>
        </div>
      ))}

      {canchaAEliminar && (
        <div
          className="court-delete-modal-overlay"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !eliminando) setCanchaAEliminar(null);
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !eliminando) setCanchaAEliminar(null);
          }}
        >
          <section
            aria-labelledby="court-delete-modal-title"
            aria-modal="true"
            className="court-delete-modal"
            role="dialog"
          >
            <div className="court-delete-modal-icon">
              <AlertTriangle aria-hidden="true" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800" id="court-delete-modal-title">
              ¿Eliminar cancha?
            </h2>
            <p className="mt-3 text-gray-600">
              ¿Estás seguro de que querés eliminar <strong>{canchaAEliminar.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="court-delete-modal-actions">
              <button
                className="admin-court-toggle"
                disabled={eliminando}
                onClick={() => setCanchaAEliminar(null)}
                type="button"
              >
                Volver
              </button>
              <button
                className="admin-court-toggle admin-court-toggle-cancel"
                disabled={eliminando}
                onClick={eliminarCancha}
                type="button"
              >
                <Trash2 aria-hidden="true" size={18} />
                {eliminando ? 'Eliminando...' : 'Eliminar cancha'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}