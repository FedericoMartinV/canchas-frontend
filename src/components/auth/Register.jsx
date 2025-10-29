import React, { useState } from 'react';
import { User, Mail, Phone, UserPlus, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function Register({ setView, agregarNotificacion }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(formData);
      agregarNotificacion('¡Registro exitoso! Ya puedes iniciar sesión 🎉', 'success');
      setView('login');
    } catch (error) {
      agregarNotificacion('Error en el registro. El email podría estar en uso.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border-4 border-green-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-xl">
            <UserPlus className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Únete y comienza a reservar</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tu nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
            <input
              type="text"
              placeholder="Tu apellido"
              required
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="tu@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                placeholder="261-1234567"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 mt-6"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta ⚽'}
          </button>
        </form>

        {/* Link a Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">¿Ya tienes cuenta?</p>
          <button
            onClick={() => setView('login')}
            className="text-green-600 font-bold hover:text-green-700 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
