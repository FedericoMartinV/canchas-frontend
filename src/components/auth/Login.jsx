import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function Login({ setUser, setView, agregarNotificacion }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(formData.email, formData.password);
      setUser(res.data);
      agregarNotificacion(`¡Bienvenido ${res.data.nombre}! 🎉`, 'success');
    } catch (error) {
      agregarNotificacion('Email o contraseña incorrectos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginRapido = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      setUser(res.data);
      agregarNotificacion(`¡Bienvenido ${res.data.nombre}! 🎉`, 'success');
    } catch (error) {
      agregarNotificacion('Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border-4 border-green-200">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-xl animate-pulse">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
            Futbol Reservas
          </h1>
          <p className="text-gray-600 font-medium">Tu cancha, tu horario, tu partido</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="tu@email.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Ingresando...
              </>
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-semibold">O</span>
          </div>
        </div>

        {/* Botones de acceso rápido */}
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-gray-700 mb-3">Acceso rápido de prueba:</p>
          <button
            onClick={() => loginRapido('admin@canchas.com', 'admin123')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300 text-purple-800 px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            🛡️ Entrar como Administrador
          </button>
          <button
            onClick={() => loginRapido('federico@example.com', 'fede123')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 text-blue-800 px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            👤 Entrar como Usuario
          </button>
        </div>

        {/* Link a Registro */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">¿No tienes cuenta?</p>
          <button
            onClick={() => setView('register')}
            className="text-green-600 font-bold text-lg hover:text-green-700 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            Regístrate aquí
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}