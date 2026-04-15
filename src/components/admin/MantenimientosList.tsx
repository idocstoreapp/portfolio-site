import { useEffect, useState } from 'react';
import { getOrders } from '../../utils/backendClient';
import { format, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MantenimientosList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMantenimientos();
  }, [page]);

  async function loadMantenimientos() {
    try {
      setLoading(true);
      const res = await getOrders(page, 20, { orderType: 'maintenance' });
      if (res.success) {
        setOrders(res.data);
        setTotal(res.total);
      }
    } catch (error) {
      console.error('Error loading mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  }

  const getMaintenanceTypeLabel = (type: string) => {
    switch(type) {
      case 'monthly': return 'Mensual';
      case 'one_time': return 'Puntual';
      case 'hourly_bank': return 'Bolsa de Horas';
      default: return 'No especificado';
    }
  };

  const getStatusBadge = (order: any) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Cerrado</span>;
    }
    
    if (order.maintenance_end_date && isPast(new Date(order.maintenance_end_date))) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Vencido</span>;
    }

    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Activo</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Mantenimiento</h1>
          <p className="text-gray-600 mt-1">Acuerdos recurrentes, integraciones y bolsas de horas</p>
        </div>
        <a 
          href="/admin/ordenes/nueva" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <span>+</span> Nuevo Mantenimiento
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando mantenimientos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 rounded-lg bg-gray-50 m-4 text-gray-500">
            No se encontraron órdenes de mantenimiento activas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Proyecto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas Vigencia</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{order.client_name || 'Sin cliente'}</div>
                      <div className="text-sm text-gray-500">{order.order_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{getMaintenanceTypeLabel(order.maintenance_type)}</div>
                      {order.maintenance_type === 'hourly_bank' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.hourly_bank_used || 0} / {order.hourly_bank_total || 0} hrs usadas
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.maintenance_start_date ? format(new Date(order.maintenance_start_date), "dd/MMM/yy", { locale: es }) : 'N/A'} - 
                      {order.maintenance_end_date ? format(new Date(order.maintenance_end_date), "dd/MMM/yy", { locale: es }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${parseFloat(order.total_price || 0).toLocaleString()} {order.maintenance_type === 'monthly' ? '/mes' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > 20 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-700">Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 transition"
            >Anterior</button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 transition"
            >Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
