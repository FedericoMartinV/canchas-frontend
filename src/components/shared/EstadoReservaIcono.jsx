import React from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';

const estadoVisual = {
  CONFIRMADA: {
    Icono: CheckCircle2,
    clase: 'is-confirmada',
  },
  CANCELADA: {
    Icono: XCircle,
    clase: 'is-cancelada',
  },
};

export default function EstadoReservaIcono({ estado }) {
  const visual = estadoVisual[estado] ?? {
    Icono: Clock3,
    clase: 'is-pendiente',
  };
  const { Icono, clase } = visual;

  return (
    <span
      aria-label={`Estado de la reserva: ${estado ?? 'PENDIENTE'}`}
      className={`admin-reservation-status-icon app-tooltip-container ${clase}`}
      tabIndex={0}
    >
      <Icono aria-hidden="true" size={19} strokeWidth={2.5} />
      <span className="app-tooltip" role="tooltip">{estado ?? 'PENDIENTE'}</span>
    </span>
  );
}
