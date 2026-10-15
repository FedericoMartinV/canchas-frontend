/**
 * Mapa de tipo de cancha a su capacidad maxima de jugadores.
 * Solo se listan los tipos con capacidad especifica; cualquier tipo
 * desconocido cae en el default de getCapacidadLabel.
 *
 * Fuente de verdad unica: antes esta misma ternaria vivia duplicada en
 * CanchasGrid.jsx (user) y CanchasList.jsx (admin).
 */
export const CAPACIDAD_POR_TIPO = {
  'Futbol 5': '10 jugadores',
  'Futbol 7': '14 jugadores',
};

/**
 * Devuelve la etiqueta de capacidad para un tipo de cancha dado.
 *
 * Comportamiento heredado (no modificar sin revisar ambos componentes):
 *   - 'Futbol 5'  -> '10 jugadores'
 *   - 'Futbol 7'  -> '14 jugadores'
 *   - cualquier otro valor (incluido undefined/null) -> '22 jugadores'
 *
 * @param {string} tipo - Tipo de cancha tal como llega del backend.
 * @returns {string}    - Etiqueta lista para mostrar en la UI.
 */
export function getCapacidadLabel(tipo) {
  return CAPACIDAD_POR_TIPO[tipo] ?? '22 jugadores';
}
