'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getDiagnostics, getClients, getOrders } from '@/lib/api';
import { format, subMonths, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    total: 0,
    nuevos: 0,
    enProyecto: 0,
    cerrados: 0,
    clientesTotales: 0,
    clientesActivos: 0,
    nuevosLeads: 0,
    ingresosMes: 0,
    ingresosMesPasado: 0,
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

      // 1. Calc Diagnosticos stats (Old Dashboard logic)
      const diagsTotal = data.diagnosticos.length;
      const diagsNuevos = data.diagnosticos.filter((d: any) => d.estado === 'nuevo').length;
      const diagsProyecto = data.diagnosticos.filter((d: any) => d.estado === 'proyecto').length;
      const diagsCerrados = data.diagnosticos.filter((d: any) => d.estado === 'cerrado').length;

      // 2. Calc Clientes (New Dashboard Logic)
      const clientesTotales = data.clientes.length;
      const clientesActivos = data.clientes.filter((c: any) => c.estado === 'activo').length;
      const leads = data.clientes.filter((c: any) => c.estado === 'lead').length;
      
      // 3. Calc Ingresos (Mes actual vs Pasado)
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

      // 4. Alertas
      const mantenimientos = data.orders.filter((o: any) => o.order_type === 'maintenance' && o.status !== 'cancelled');
      const mantVencenPronto = mantenimientos.filter((m: any) => {
        if (!m.maintenance_end_date) return false;
        const end = new Date(m.maintenance_end_date);
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        return isBefore(end, in30Days) && isAfter(end, ahora);
      });
      
      const newAlerts = [];
      if (mantVencenPronto.length > 0) {
        newAlerts.push({ type: 'warning', text: `${mantVencenPronto.length} mantenimientos vencen en los próximos 30 días.` });
      }
      
      const uncontactedLeads = data.clientes.filter((c: any) => c.estado === 'lead');
      if (uncontactedLeads.length > 0) {
        newAlerts.push({ type: 'info', text: `${uncontactedLeads.length} leads (prospectos) sin convertir.` });
      }

      // 5. Actividad Reciente
      let actividadesCrudas: any[] = [];
      
      data.clientes.slice(0, 5).forEach((c: any) => {
        actividadesCrudas.push({
          id: `c-${c.id}`,
          date: new Date(c.created_at),
          type: 'client',
          text: `Nuevo cliente: ${c.nombre}`,
          link: `/clientes/${c.id}`
        });
      });
      
      data.orders.slice(0, 5).forEach((o: any) => {
        actividadesCrudas.push({
          id: `o-${o.id}`,
          date: new Date(o.created_at),
          type: 'order',
          text: `Orden ${o.order_number}: ${o.order_type}`,
          link: o.order_type === 'maintenance' ? '/ordenes/mantenimientos' : `/ordenes`
        });
      });

      actividadesCrudas.sort((a, b) => b.date.getTime() - a.date.getTime());

      setStats({
        total: diagsTotal,
        nuevos: diagsNuevos,
        enProyecto: diagsProyecto,
        cerrados: diagsCerrados,
        clientesTotales,
        clientesActivos,
        nuevosLeads: leads,
        ingresosMes,
        ingresosMesPasado,
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
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6 max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center bg-gray-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
                <p className="text-gray-300">Resumen integral: Leads → Diagnósticos → Proyectos → Mantenimientos</p>
              </div>
              <Link
                href="/ordenes/nueva"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-500 transition font-medium flex items-center gap-2 relative z-10 whitespace-nowrap"
              >
                <span>+</span> Nueva Orden de Trabajo
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Sincronizando información...</p>
              </div>
            ) : (
              <>
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
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Ingresos de Órdenes (30d)</p>
                      <p className="text-4xl font-black text-green-600">{formatMoney(stats.ingresosMes)}</p>
                    </div>
                    <div className="text-sm mt-4 font-medium text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <span className="text-gray-500">Mes pasado:</span> {formatMoney(stats.ingresosMesPasado)}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Diagnósticos</p>
                      <p className="text-4xl font-black text-indigo-600">{stats.nuevos}</p>
                    </div>
                    <div className="text-sm mt-4 font-medium text-gray-600">
                      <Link href="/diagnosticos" className="text-indigo-600 hover:underline">Ver {stats.total} totales →</Link>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-xl shadow-sm p-6 flex flex-col justify-between text-white">
                    <div>
                      <p className="text-sm font-medium text-indigo-200 uppercase tracking-wider mb-1">Embudo Activo</p>
                      <p className="text-3xl font-black text-white mt-1">{stats.enProyecto} Proyectos</p>
                    </div>
                    <div className="text-sm mt-4 font-medium text-indigo-100 mb-1">
                      {stats.cerrados} Históricos entregados
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
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

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>📈</span> Actividad Reciente
                    </h3>
                    {actividad.length === 0 ? (
                      <p className="text-gray-500 py-4">No hay actividad registrada aún.</p>
                    ) : (
                      <div className="space-y-4">
                        {actividad.map((act) => (
                          <div key={act.id} className="flex gap-4 items-start border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50 transition p-2 -mx-2 rounded-lg">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${act.type === 'client' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                              {act.type === 'client' ? '👤' : '📦'}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="text-sm font-medium text-gray-900">{act.text}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{format(act.date, "d MMM, h:mm a", { locale: es })}</p>
                            </div>
                            {act.link && (
                              <Link href={act.link} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-2 px-2">Ver →</Link>
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
        </div>
      </div>
    </AuthGuard>
  );
}
