import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { reservasAPI } from '../../services/api';

export default function ReservaModal({ cancha, user, onClose, onReservaCreada, agregarNotificacion }) {
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reservasAPI.create({
        usuarioId: user.id,
        canchaId: cancha.id,
        ...formData
      });
      agregarNotificacion('¡Reserva creada! Espera la confirmación del administrador ⚽', 'success');
      onReservaCreada();
    } catch (error) {
      agregarNotificacion('Error al crear la reserva', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Reservar Cancha</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
          <h4 className="text-xl font-bold text-gray-800 mb-2">{cancha.nombre}</h4>
          <p className="text-sm text-gray-600 mb-1">{cancha.ubicacion}</p>
          <p className="text-sm text-gray-600 mb-1">Tipo: {cancha.tipo}</p>
          <p className="text-2xl font-bold text-green-600 mt-2">${cancha.precioPorHora}/hora</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-green-600" />
              Fecha
            </label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-green-600" />
              Hora de inicio
            </label>
            <input
              type="time"
              required
              value={formData.horaInicio}
              onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-green-600" />
              Hora de fin
            </label>
            <input
              type="time"
              required
              value={formData.horaFin}
              onChange={(e) => setFormData({...formData, horaFin: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva ⚽'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
