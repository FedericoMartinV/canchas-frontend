/**
 * Helpers compartidos para mostrar el estado de una reserva.
 *
 * Fuente de verdad unica: antes estas funciones vivian duplicadas
 * como closures dentro de MisReservas.jsx (user) y ReservasList.jsx (admin).
 * Al extraerlas aqui se garantiza que ambas vistas siempre muestren
 * exactamente los mismos colores y emojis.
 */

/**
 * Devuelve las clases CSS de Tailwind para el badge de estado.
 *
 * Comportamiento heredado (no modificar sin revisar ambos componentes):
 *   CONFIRMADA -> fondo verde degradado, texto verde oscuro, borde verde claro
 *   CANCELADA  -> fondo rojo degradado,  texto rojo oscuro,  borde rojo claro
 *   cualquier otro estado (ej: PENDIENTE o desconocido) -> amarillo/amber
 *
 * @param {string} estado - Estado de la reserva tal como llega del backend.
 * @returns {string}      - Clases CSS listas para interpolar en className.
 */
export function getEstadoColor(estado) {
  switch (estado) {
    case 'CONFIRMADA':
      return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
    case 'CANCELADA':
      return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300';
    default:
      return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300';
  }
}

/**
 * Devuelve el emoji correspondiente al estado de la reserva.
 *
 * Comportamiento heredado:
 *   CONFIRMADA -> 'checkmark' verde
 *   CANCELADA  -> 'X' roja
 *   cualquier otro estado (ej: PENDIENTE o desconocido) -> reloj de arena
 *
 * @param {string} estado - Estado de la reserva tal como llega del backend.
 * @returns {string}      - Emoji listo para mostrar en la UI.
 */
export function getEstadoEmoji(estado) {
  switch (estado) {
    case 'CONFIRMADA': return '\u2705';
    case 'CANCELADA':  return '\u274C';
    default:           return '\u23F3';
  }
}
