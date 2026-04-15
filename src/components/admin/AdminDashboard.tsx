import { useEffect, useState } from 'react';
import { getDiagnostics, getClients, getOrders } from '../../utils/backendClient';
import { format, subMonths, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    clientesTotales: 0,
    clientesActivos: 0,
    nuevosLeads: 0,
    
    ingresosMes: 0,
    ingresosMesPasado: 0,
    
    diagnosticosPendientes: 0,
  });

  const [actividad, setActividad] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      
      const [diagsRes, clientsRes, ordersRes] = await Promise.all([
        getDiagnostics(1, 100),
        getClients(1, 500),
        getOrders(1, 200)
      ]);

      const data = {
        diagnosticos: diagsRes.success ? diagsRes.data : [],
        clientes: clientsRes.success ? clientsRes.data : [],
        orders: ordersRes.success ? ordersRes.data : []
      };

      // 1. Calc Clientes
      const clientesTotales = data.clientes.length;
      const clientesActivos = data.clientes.filter((c: any) => c.estado === 'activo').length;
      const leads = data.clientes.filter((c: any) => c.estado === 'lead').length;
      
      // 2. Calc Ingresos (Mes actual vs Pasado)
      const ahora = new Date();
      const haceUnMes = subMonths(ahora, 1);
      const haceDosMeses = subMonths(ahora, 2);

      let ingresosMes = 0;
      let ingresosMesPasado = 0;

      data.orders.forEach((o: any) => {
        if (!o.total_price) return;
        const checkDate = o.created_at ? new Date(o.created_at) : null;
        if (!checkDate) return;
        
        if (isAfter(checkDate, haceUnMes)) {
          ingresosMes += parseFloat(o.total_price);
        } else if (isBefore(checkDate, haceUnMes) && isAfter(checkDate, haceDosMeses)) {
          ingresosMesPasado += parseFloat(o.total_price);
        }
      });

      // 3. Alertas
      const mantenimientos = data.orders.filter((o: any) => o.order_type === 'maintenance' && o.status !== 'cancelled');
      const mantVencenPronto = mantenimientos.filter((m: any) => {
        if (!m.maintenance_end_date) return false;
        const end = new Date(m.maintenance_end_date);
        // Vencen en los próximos 30 días
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        return isBefore(end, in30Days) && isAfter(end, ahora);
      });
      
      const newAlerts = [];
      if (mantVencenPronto.length > 0) {
        newAlerts.push({ type: 'warning', text: `${mantVencenPronto.length} mantenimientos vencen este mes.` });
      }
      
      const uncontactedLeads = data.clientes.filter((c: any) => c.estado === 'lead');
      if (uncontactedLeads.length > 0) {
        newAlerts.push({ type: 'info', text: `${uncontactedLeads.length} leads (prospectos) sin convertir.` });
      }
      
      const nuevosDiags = data.diagnosticos.filter((d: any) => d.estado === 'nuevo');

      // 4. Actividad
      let actividadesCrudas: any[] = [];
      
      // Añadir clientes nuevos
      data.clientes.slice(0, 5).forEach((c: any) => {
        actividadesCrudas.push({
          id: `c-${c.id}`,
          date: new Date(c.created_at),
          type: 'client',
          text: `Nuevo cliente: ${c.nombre}`,
          link: `/admin/clientes/${c.id}`
        });
      });
      
      // Añadir ordenes recientes
      data.orders.slice(0, 5).forEach((o: any) => {
        actividadesCrudas.push({
          id: `o-${o.id}`,
          date: new Date(o.created_at),
          type: 'order',
          text: `Orden ${o.order_number}: ${o.order_type}`,
          link: o.order_type === 'maintenance' ? '/admin/ordenes/mantenimientos' : `/admin/diagnosticos/${o.id}`
        });
      });

      actividadesCrudas.sort((a, b) => b.date.getTime() - a.date.getTime());

      setStats({
        clientesTotales,
        clientesActivos,
        nuevosLeads: leads,
        ingresosMes,
        ingresosMesPasado,
        diagnosticosPendientes: nuevosDiags.length
      });
      
      setAlertas(newAlerts);
      setActividad(actividadesCrudas.slice(0, 6));

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Vista General
          </h2>
          <a
            href="/admin/ordenes/nueva"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex gap-2 items-center text-sm font-medium"
          >
            <span>+</span> Nueva Orden
          </a>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Sincronizando información...</p>
          </div>
        ) : (
          <>
            {/* ROW 1: Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Clientes</p>
                  <div className="flex items-end gap-3 mt-1">
                    <p className="text-4xl font-black text-gray-900">{stats.clientesTotales}</p>
                  </div>
                </div>
                <div className="text-sm mt-4 font-medium text-gray-600 bg-gray-50 p-2 rounded-lg inline-flex gap-2">
                  <span className="text-green-600">{stats.clientesActivos} Activos</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-blue-600">{stats.nuevosLeads} Leads</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Ingresos (Mes)</p>
                  <p className="text-4xl font-black text-green-600">{formatMoney(stats.ingresosMes)}</p>
                </div>
                <div className="text-sm mt-4 font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <span className="text-gray-500">Mes pasado:</span> {formatMoney(stats.ingresosMesPasado)}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Diagnósticos</p>
                  <p className="text-4xl font-black text-indigo-600">{stats.diagnosticosPendientes}</p>
                </div>
                <div className="text-sm mt-4 font-medium text-gray-600">
                  <a href="/admin/diagnosticos?estado=nuevo" className="text-indigo-600 hover:underline">Ver pendientes →</a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-xl shadow-sm p-6 border border-gray-800 flex flex-col justify-between text-white">
                <div>
                  <p className="text-sm font-medium text-indigo-200 uppercase tracking-wider mb-1">Crecimiento</p>
                  <p className="text-3xl font-black text-white mt-1">Óptimo</p>
                </div>
                <div className="text-sm mt-4 font-medium text-indigo-100">
                  Mantén el seguimiento de leads
                </div>
              </div>

            </div>

            {/* ROW 2: Alertas y Actividad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Alertas */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔔</span> Alertas Importantes
                </h3>
                {alertas.length === 0 ? (
                  <p className="text-gray-500 py-4">No hay alertas. Todo en orden.</p>
                ) : (
                  <div className="space-y-3">
                    {alertas.map((al, idx) => (
                      <div key={idx} className={`p-4 rounded-lg flex items-start gap-3 border ${al.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                        <div className="text-xl mt-1">{al.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                        <div>
                          <p className="font-medium text-sm pt-1">{al.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actividad */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📈</span> Actividad Reciente
                </h3>
                {actividad.length === 0 ? (
                  <p className="text-gray-500 py-4">No hay actividad registrada aún.</p>
                ) : (
                  <div className="space-y-4">
                    {actividad.map((act) => (
                      <div key={act.id} className="flex gap-4 items-start border-b border-gray-50 pb-3 last:border-0">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${act.type === 'client' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                          {act.type === 'client' ? '👤' : '📦'}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm font-medium text-gray-900">{act.text}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{format(act.date, "d MMM, h:mm a", { locale: es })}</p>
                        </div>
                        {act.link && (
                          <a href={act.link} className="text-xs text-indigo-600 hover:underline pt-2">Ver →</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </main>
    </>
  );
}
