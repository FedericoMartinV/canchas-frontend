// src/utils/tiempo.js

/**
 * Convierte un LocalTime del backend al total de minutos desde medianoche.
 * El DTO serializa LocalTime como { hour, minute, second, nano }.
 * Antes (entidad JPA directa) llegaba como string "19:00:00".
 * Soporta ambos formatos para no romper si algún endpoint aún usa el string.
 */
export function localTimeAMinutos(hora) {
  if (!hora) return 0;
  if (typeof hora === "string") {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  }
  // formato objeto: { hour, minute, second, nano }
  return (hora.hour ?? 0) * 60 + (hora.minute ?? 0);
}

/**
 * Convierte un LocalTime a string "HH:mm" para mostrar en pantalla.
 */
export function formatearHora(hora) {
  if (!hora) return "—";
  if (typeof hora === "string") {
    // "19:00:00" → "19:00"
    return hora.slice(0, 5);
  }
  const h = String(hora.hour ?? 0).padStart(2, "0");
  const m = String(hora.minute ?? 0).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Calcula la duración en horas entre dos LocalTime.
 */
export function duracionEnHoras(horaInicio, horaFin) {
  return (localTimeAMinutos(horaFin) - localTimeAMinutos(horaInicio)) / 60;
}
