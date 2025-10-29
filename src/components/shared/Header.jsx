import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';

export default function Header({ user, logout, title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-2xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              {user.rol === 'ADMIN' ? (
                <Shield className="text-green-600" size={28} />
              ) : (
                <User className="text-green-600" size={28} />
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-green-100">{subtitle || `${user.nombre} ${user.apellido}`}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}