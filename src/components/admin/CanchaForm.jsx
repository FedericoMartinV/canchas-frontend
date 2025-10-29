import React, { useState } from 'react';
import { canchasAPI } from '../../services/api';

export default function CanchaForm({ onCanchaCreada, agregarNotificacion }) {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    tipo: 'Futbol 5',
    precioPorHora: '',
    iluminacion: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await canchasAPI.create({
        ...formData,
        precioPorHora: parseFloat(formData.precioPorHora)
      });
      agregarNotificacion('¡Cancha creada exitosamente! 🏟️', 'success');
      onCanchaCreada();
    } catch (error) {
      agregarNotificacion('Error al crear cancha', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8 border-2 border-green-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Cancha</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la cancha</label>
          <input
            type="text"
            placeholder="Ej: Cancha Central"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Ubicación</label>
          <input
            type="text"
            placeholder="Ej: Av. San Martín 500"
            required
            value={formData.ubicacion}
            onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de cancha</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
          >
            <option value="Futbol 5">Futbol 5</option>
            <option value="Futbol 7">Futbol 7</option>
            <option value="Futbol 11">Futbol 11</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Precio por hora ($)</label>
          <input
            type="number"
            placeholder="15000"
            required
            value={formData.precioPorHora}
            onChange={(e) => setFormData({...formData, precioPorHora: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.iluminacion}
              onChange={(e) => setFormData({...formData, iluminacion: e.target.checked})}
              className="w-6 h-6 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-bold text-gray-700">Tiene iluminación 💡</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Cancha ⚽'}
          </button>
        </div>
      </form>
    </div>
  );
}