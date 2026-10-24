import React from 'react';

export default function CanchaTipoIcono({ tipo }) {
  const numeroJugadores = typeof tipo === 'string' ? tipo.match(/\d+/)?.[0] : null;
  const descripcion = numeroJugadores ? `Fútbol ${numeroJugadores}` : tipo ?? 'Tipo desconocido';

  return (
    <span
      aria-label={`Tipo de cancha: ${descripcion}`}
      className="admin-court-type-icon app-tooltip-container"
      role="img"
      tabIndex={0}
    >
      <svg aria-hidden="true" viewBox="0 0 48 48">
        <circle className="admin-court-type-ball" cx="24" cy="24" r="21.5" />
        <path
          className="admin-court-type-panels"
          d="m17 4.6 14 0 4 9.3-11 8-11-8 4-9.3ZM3.1 19.5l10.8-5.6 11 8-4.2 13-10.9 1.3-5.9-8.1-.8-8.6ZM44.9 19.5l-10.8-5.6-11 8 4.2 13 10.9 1.3 5.9-8.1.8-8.6ZM9.8 36.2l10.9-1.3 3.3 10.5-8.1-.8-6.1-8.4ZM38.2 36.2l-10.9-1.3L24 45.4l8.1-.8 6.1-8.4Z"
        />
        <path
          className="admin-court-type-center"
          d="m24 18 7.6 5.5-2.9 8.9h-9.4l-2.9-8.9L24 18Z"
        />
        <text x="24" y="28">{numeroJugadores ?? '?'}</text>
      </svg>
      <span className="app-tooltip" role="tooltip">{descripcion}</span>
    </span>
  );
}
