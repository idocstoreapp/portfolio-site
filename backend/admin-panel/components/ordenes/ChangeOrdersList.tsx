'use client';

import { useState, useEffect } from 'react';
import { getChangeOrdersByOrderId, approveChangeOrder, rejectChangeOrder, type ChangeOrder } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChangeOrdersListProps {
  orderId: string;
  onUpdate: () => void;
}

export default function ChangeOrdersList({ orderId, onUpdate }: ChangeOrdersListProps) {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChangeOrders();
  }, [orderId]);

  async function loadChangeOrders() {
    try {
      setLoading(true);
      const response = await getChangeOrdersByOrderId(orderId);
      if (response.success) {
        setChangeOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading change orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    if (!confirm('¿Aprobar esta orden de cambio?')) return;

    try {
      await approveChangeOrder(id, 'admin'); // TODO: usar usuario real
      loadChangeOrders();
      onUpdate();
      alert('Orden de cambio aprobada');
    } catch (error: any) {
      alert(`Error al aprobar: ${error.message}`);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Razón del rechazo:');
    if (!reason) return;

    try {
      await rejectChangeOrder(id, reason);
      loadChangeOrders();
      onUpdate();
      alert('Orden de cambio rechazada');
    } catch (error: any) {
      alert(`Error al rechazar: ${error.message}`);
    }
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return <div className="text-center py-4">Cargando órdenes de cambio...</div>;
  }

  if (changeOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Órdenes de Cambio</h2>
      
      <div className="space-y-4">
        {changeOrders.map((co) => (
          <div key={co.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{co.title}</h3>
                <p className="text-sm text-gray-500">{co.change_order_number}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[co.status] || 'bg-gray-100'}`}>
                {statusLabels[co.status] || co.status}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3">{co.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-500">Costo Estimado:</span>
                <p className="font-semibold">${co.estimated_cost.toLocaleString()} {co.currency}</p>
              </div>
              {co.estimated_hours && (
                <div>
                  <span className="text-gray-500">Horas Estimadas:</span>
                  <p className="font-semibold">{co.estimated_hours}h</p>
                </div>
              )}
              {co.actual_cost && (
                <div>
                  <span className="text-gray-500">Costo Real:</span>
                  <p className="font-semibold">${co.actual_cost.toLocaleString()} {co.currency}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Fecha:</span>
                <p className="font-semibold">
                  {format(new Date(co.created_at), "d MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {co.status === 'pending' && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <button
                  onClick={() => handleApprove(co.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(co.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Rechazar
                </button>
              </div>
            )}

            {co.rejected_reason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Razón del rechazo:</strong> {co.rejected_reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
