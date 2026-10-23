import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Calendar, Activity } from 'lucide-react';
import { reservasAPI, canchasAPI } from '../../services/api';

// ---------------------------------------------------------------------------
// Helpers de tiempo
// El DTO serializa LocalTime como { hour, minute, second, nano }.
// Antes (entidad JPA directa) llegaba como string "19:00:00".
// Soportamos ambos formatos.
// ---------------------------------------------------------------------------

function localTimeAMinutos(hora) {
  if (!hora) return 0;
  if (typeof hora === 'string') {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }
  return (hora.hour ?? 0) * 60 + (hora.minute ?? 0);
}

function duracionEnHoras(horaInicio, horaFin) {
  const diff = localTimeAMinutos(horaFin) - localTimeAMinutos(horaInicio);
  return diff > 0 ? diff / 60 : 0;
}

// ---------------------------------------------------------------------------
// Cálculo de estadísticas — todo en el cliente, sin endpoint propio
// ---------------------------------------------------------------------------

function calcularEstadisticas(reservas, canchas, mes, anio) {
  // Filtramos por mes y año sobre el campo "fecha" (string "YYYY-MM-DD")
  const delMes = reservas.filter(r => {
    if (!r.fecha) return false;
    const [y, m] = r.fecha.split('-').map(Number);
    return y === anio && m === mes;
  });

  const confirmadas = delMes.filter(r => r.estado === 'CONFIRMADA');
  const pendientes  = delMes.filter(r => r.estado === 'PENDIENTE');
  const canceladas  = delMes.filter(r => r.estado === 'CANCELADA');

  // Horas e ingresos — solo reservas CONFIRMADAS
  const horasTotales = confirmadas.reduce((sum, r) =>
    sum + duracionEnHoras(r.horaInicio, r.horaFin), 0);

  const ingresosTotales = confirmadas.reduce((sum, r) => {
    const precio = Number(r.cancha?.precioPorHora ?? 0);
    const horas  = duracionEnHoras(r.horaInicio, r.horaFin);
    return sum + precio * horas;
  }, 0);

  // Agrupación por cancha (para los gráficos de barras)
  const porCanchaMap = {};
  confirmadas.forEach(r => {
    const id     = r.cancha?.id ?? 'sin-cancha';
    const nombre = r.cancha?.nombre ?? 'Sin cancha';
    const precio = Number(r.cancha?.precioPorHora ?? 0);
    const horas  = duracionEnHoras(r.horaInicio, r.horaFin);

    if (!porCanchaMap[id]) {
      porCanchaMap[id] = { nombreCancha: nombre, cantidadReservas: 0, horasReservadas: 0, ingresos: 0 };
    }
    porCanchaMap[id].cantidadReservas += 1;
    porCanchaMap[id].horasReservadas  += horas;
    porCanchaMap[id].ingresos         += precio * horas;
  });

  return {
    stats: {
      totalReservas:        delMes.length,
      reservasConfirmadas:  confirmadas.length,
      reservasPendientes:   pendientes.length,
      reservasCanceladas:   canceladas.length,
      horasTotalesReservadas: horasTotales,
      ingresosTotales,
    },
    porCancha: Object.values(porCanchaMap),
  };
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function DashboardStats({ agregarNotificacion }) {
  const [todasLasReservas, setTodasLasReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [mesSeleccionado,  setMesSeleccionado]  = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // Cargamos UNA sola vez todos los datos crudos
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [resRes, canchasRes] = await Promise.all([
          reservasAPI.getAll(),
          canchasAPI.getAll(),
        ]);
        setTodasLasReservas(resRes.data);
        setCanchas(canchasRes.data);
      } catch {
        agregarNotificacion('Error al cargar estadísticas', 'error');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []); // sin dependencias: solo al montar

  // El filtro por mes/año se recalcula en el cliente cada vez que cambia el selector
  const { stats: estadisticas, porCancha: reservasPorCancha } =
    calcularEstadisticas(todasLasReservas, canchas, mesSeleccionado, anioSeleccionado);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-xl font-semibold text-gray-700">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const dataPie = [
    { name: 'Confirmadas', value: estadisticas.reservasConfirmadas, color: '#10b981' },
    { name: 'Pendientes',  value: estadisticas.reservasPendientes,  color: '#f59e0b' },
    { name: 'Canceladas',  value: estadisticas.reservasCanceladas,  color: '#ef4444' },
  ];

  const meses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Selector de Mes y Año */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <Calendar className="text-green-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">Período de Análisis</h3>
          <div className="flex gap-3 ml-auto">
            <select
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            >
              {meses.map((mes, index) => (
                <option key={index} value={index + 1}>{mes}</option>
              ))}
            </select>
            <select
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500"
            >
              {[2024, 2025, 2026].map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity size={32} />
            <span className="text-3xl font-bold">{estadisticas.totalReservas}</span>
          </div>
          <h3 className="text-lg font-semibold">Total Reservas</h3>
          <p className="text-green-100 text-sm">Del mes seleccionado</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <span className="text-3xl font-bold">{estadisticas.horasTotalesReservadas.toFixed(1)}</span>
          </div>
          <h3 className="text-lg font-semibold">Horas Reservadas</h3>
          <p className="text-blue-100 text-sm">Confirmadas únicamente</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <span className="text-3xl font-bold">${estadisticas.ingresosTotales.toLocaleString()}</span>
          </div>
          <h3 className="text-lg font-semibold">Ingresos Totales</h3>
          <p className="text-purple-100 text-sm">Reservas confirmadas</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} />
            <span className="text-3xl font-bold">{estadisticas.reservasConfirmadas}</span>
          </div>
          <h3 className="text-lg font-semibold">Confirmadas</h3>
          <p className="text-orange-100 text-sm">{estadisticas.reservasPendientes} pendientes</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Reservas por Cancha</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservasPorCancha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombreCancha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidadReservas" fill="#10b981" name="Reservas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Horas Reservadas por Cancha</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservasPorCancha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombreCancha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="horasReservadas" fill="#3b82f6" name="Horas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Ingresos por Cancha</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservasPorCancha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombreCancha" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="ingresos" fill="#f59e0b" name="Ingresos ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla Detallada */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Detalle por Cancha</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50 border-b-2 border-green-200">
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Cancha</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Reservas</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Horas</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {reservasPorCancha.map((cancha, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-800">{cancha.nombreCancha}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{cancha.cantidadReservas}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{cancha.horasReservadas.toFixed(1)}h</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    ${cancha.ingresos.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}