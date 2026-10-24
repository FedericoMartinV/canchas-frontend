import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { reservasAPI } from '../../services/api';

/**
 * Convierte un string "HH:MM" a minutos desde la medianoche.
 * Retorna NaN si el string está vacío o tiene formato incorrecto.
 *
 * Usamos minutos (y no comparación de strings) porque la aritmética de
 * duración requiere restar valores numéricos, no strings.
 */
function horaAMinutos(horaStr) {
  if (!horaStr) return NaN;
  const [hh, mm] = horaStr.split(':').map(Number);
  return hh * 60 + mm;
}

/**
 * Dado un número de minutos totales, devuelve un string legible.
 * Ejemplos: 90 → "1 h 30 min", 60 → "1 h", 45 → "45 min".
 */
function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas} h`;
  return `${horas} h ${mins} min`;
}

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD usando hora local.
 *
 * CORRECCIÓN: new Date().toISOString() usa UTC, por lo que después de las
 * 21:00 en Argentina (UTC-3) devuelve el día siguiente. Construimos la fecha
 * con getFullYear/getMonth/getDate, que respetan el timezone local del browser.
 */
function fechaLocalHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // getMonth() es 0-indexed
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Valida la coherencia entre horaInicio y horaFin.
 * Retorna un string con el mensaje de error, o null si todo está bien.
 *
 * Reglas de negocio decididas:
 *  - horaFin debe ser estrictamente mayor que horaInicio en minutos.
 *  - Si horaFin < horaInicio el usuario probablemente intentó cruzar la
 *    medianoche (ej. 23:00 → 01:00); se rechaza con mensaje explicativo.
 *  - Si alguno está vacío, no hay nada que validar aún (retorna null).
 */
function validarCoherenciaHoras(horaInicio, horaFin) {
  const inicioMin = horaAMinutos(horaInicio);
  const finMin = horaAMinutos(horaFin);

  // Alguno de los dos campos todavía no fue completado → sin error por ahora
  if (isNaN(inicioMin) || isNaN(finMin)) return null;

  if (finMin < inicioMin) {
    // horaFin menor que horaInicio → probable intento de cruzar medianoche
    return 'La reserva debe terminar el mismo día (no se permiten reservas que cruzan la medianoche).';
  }
  if (finMin === inicioMin) {
    // horaFin igual a horaInicio → duración cero, sin sentido
    return 'La hora de fin debe ser posterior a la hora de inicio.';
  }

  return null; // Sin error
}

export default function ReservaModal({ cancha, user, onClose, onReservaCreada, agregarNotificacion }) {
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorReserva, setErrorReserva] = useState(null);

  // Error específico del campo "Hora de fin".
  // null = sin error; string = mensaje a mostrar debajo del input.
  const [errorHoraFin, setErrorHoraFin] = useState(null);

  /**
   * Handler unificado para los campos de hora.
   * Actualiza formData y re-valida en tiempo real para que el error
   * aparezca/desaparezca mientras el usuario escribe, sin esperar al submit.
   */
  function handleHoraChange(campo, valor) {
    const nuevoFormData = { ...formData, [campo]: valor };
    setFormData(nuevoFormData);
    setErrorReserva(null);

    // Validamos con los valores ya actualizados (no con el state anterior)
    const error = validarCoherenciaHoras(nuevoFormData.horaInicio, nuevoFormData.horaFin);
    setErrorHoraFin(error);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación final antes de enviar: cubre el caso en que el usuario
    // cambia horaInicio sin volver a tocar horaFin (el onChange de horaFin
    // ya lo cubre en tiempo real, pero el submit es la última barrera).
    const error = validarCoherenciaHoras(formData.horaInicio, formData.horaFin);
    if (error) {
      setErrorHoraFin(error);
      return; // Cortamos aquí: NO se llama a la API
    }

    setLoading(true);
    setErrorReserva(null);
    try {
      // El contrato con reservasAPI.create no cambia: recibe usuarioId, canchaId,
      // fecha, horaInicio y horaFin (los tres últimos vienen de formData via spread).
      await reservasAPI.create({
        usuarioId: user.id,
        canchaId: cancha.id,
        ...formData
      });
      agregarNotificacion('¡Reserva creada! Espera la confirmación del administrador ⚽', 'success');
      onReservaCreada();
    } catch (error) {
      const status = error.response?.status;
      const detalle = [
        error.response?.data?.message,
        error.response?.data?.error,
        error.response?.data?.mensaje,
      ].find((mensaje) => typeof mensaje === 'string');
      const esConflicto = status === 409 || /ocupad|reservad|disponib|solap|overlap|already exists|conflict/i.test(detalle ?? '');

      setErrorReserva(
        esConflicto
          ? 'Ese horario ya está ocupado. Elegí otra fecha u horario para la cancha.'
          : detalle || 'No se pudo crear la reserva. Revisá los datos e intentá nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Cálculo derivado: duración y precio total
  // Solo se computan cuando ambas horas son válidas y no hay error activo.
  // ---------------------------------------------------------------------------

  const inicioMin = horaAMinutos(formData.horaInicio);
  const finMin = horaAMinutos(formData.horaFin);

  // duracionMin es positivo solo si no hay error y ambos campos tienen valor
  const duracionMin = (!errorHoraFin && !isNaN(inicioMin) && !isNaN(finMin) && finMin > inicioMin)
    ? finMin - inicioMin
    : null;

  // precioPorHora se convierte explícitamente a Number para evitar que una
  // respuesta del backend como "1500" (string) cause concatenación en lugar de suma.
  const precioPorHora = Number(cancha.precioPorHora);

  // Precio total = duración en horas × precio por hora
  const precioTotal = duracionMin !== null
    ? (duracionMin / 60) * precioPorHora
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border-4 border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Reservar Cancha</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
          <h4 className="text-xl font-bold text-gray-800 mb-2">{cancha.nombre}</h4>
          <p className="text-sm text-gray-600 mb-1">{cancha.ubicacion}</p>
          <p className="text-sm text-gray-600 mb-1">Tipo: {cancha.tipo}</p>
          <p className="text-2xl font-bold text-green-600 mt-2">${cancha.precioPorHora}/hora</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-green-600" />
              Fecha
            </label>
            {/* fechaLocalHoy() evita el bug de UTC: toISOString() después de las
                21:00 ARG devolvería el día siguiente porque usa UTC-0. */}
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => {
                setFormData({ ...formData, fecha: e.target.value });
                setErrorReserva(null);
              }}
              min={fechaLocalHoy()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-green-600" />
              Hora de inicio
            </label>
            <input
              type="time"
              required
              value={formData.horaInicio}
              onChange={(e) => handleHoraChange('horaInicio', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-green-600" />
              Hora de fin
            </label>
            {/* El borde cambia a rojo cuando errorHoraFin no es null,
                manteniendo todas las demás clases del formulario intactas. */}
            <input
              type="time"
              required
              value={formData.horaFin}
              onChange={(e) => handleHoraChange('horaFin', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 ${
                errorHoraFin ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {/* Mensaje de error inline, debajo del input.
                Solo se renderiza cuando errorHoraFin tiene valor.
                role="alert" lo hace accesible para lectores de pantalla. */}
            {errorHoraFin && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errorHoraFin}
              </p>
            )}
          </div>

          {errorReserva && (
            <div
              className="flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-red-800"
              role="alert"
            >
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-600" />
              <p className="text-sm font-semibold">{errorReserva}</p>
            </div>
          )}

          {/* Resumen de duración y precio total.
              Solo aparece cuando duracionMin es un número positivo, es decir,
              cuando ambas horas son válidas y no hay error activo.
              Se ubica entre el campo de hora de fin y el botón de confirmar. */}
          {duracionMin !== null && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-600">Duración</span>
                {/* formatearDuracion convierte los minutos a "X h Y min" */}
                <span className="text-sm font-bold text-gray-800">{formatearDuracion(duracionMin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Precio total</span>
                {/* toLocaleString formatea con separador de miles según locale argentino.
                    Se muestran 0 decimales si el total es entero, hasta 2 si no. */}
                <span className="text-xl font-bold text-green-600">
                  ${precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="reservation-modal-actions">
            <button
              type="submit"
              disabled={loading}
              className="admin-court-submit"
            >
              {loading ? 'Reservando...' : 'Confirmar ⚽'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="admin-court-toggle admin-court-toggle-cancel"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
