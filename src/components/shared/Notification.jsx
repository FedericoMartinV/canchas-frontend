import React from 'react';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

export default function Notification({ notificaciones }) {
  const getIcon = (tipo) => {
    switch (tipo) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColor = (tipo) => {
    switch (tipo) {
      case 'success': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'error': return 'bg-gradient-to-r from-red-500 to-rose-500';
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notificaciones.map(n => (
        <div
          key={n.id}
          className={`${getColor(n.tipo)} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 text-white animate-slide-in min-w-[300px]`}
        >
          {getIcon(n.tipo)}
          <span className="font-medium">{n.mensaje}</span>
        </div>
      ))}
    </div>
  );
}