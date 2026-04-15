'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClient, getClientOrders, getClientMetrics } from '@/lib/api';
import type { Client, ClientDetail } from '@/types/client';
import type { Order } from '@/types/order';

interface ClientDetailContentProps {
  clientId: string;
}

export default function ClientDetailContent({ clientId }: ClientDetailContentProps) {
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'notes'>('overview');

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  async function loadClientData() {
    setLoading(true);
    try {
      const [clientRes, metricsRes, ordersRes] = await Promise.all([
        getClient(clientId),
        getClientMetrics(clientId),
        getClientOrders(clientId),
      ]);

      if (clientRes.success) {
        setClient(clientRes.data);
      }
      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }
      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      in_development: 'bg-purple-100 text-purple-800',
      completed: 'bg-teal-100 text-teal-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      draft: 'Borrador',
      sent: 'Enviado',
      accepted: 'Aceptado',
      in_development: 'En desarrollo',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando datos del cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cliente no encontrado</p>
        <button
          onClick={() => router.push('/clientes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {client.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.nombre}</h1>
              {client.empresa && (
                <p className="text-gray-600">🏢 {client.empresa}</p>
              )}
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  client.estado === 'activo' ? 'bg-green-100 text-green-800' :
                  client.estado === 'cliente' ? 'bg-blue-100 text-blue-800' :
                  client.estado === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {client.estado}
                </span>
                {client.tags?.map((tag, i) => (
                  <span key={i} className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/clientes')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Total Órdenes</p>
            <p className="text-2xl font-bold text-blue-900">{metrics?.total_orders || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Total Invertido</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(metrics?.total_spent || 0)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Órdenes Activas</p>
            <p className="text-2xl font-bold text-purple-900">{metrics?.in_progress_orders || 0}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600">Contratos Mantenimiento</p>
            <p className="text-2xl font-bold text-yellow-900">{metrics?.active_maintenance_contracts || 0}</p>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{client.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-medium">{client.telefono || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Empresa</p>
            <p className="font-medium">{client.empresa || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de Alta</p>
            <p className="font-medium">{formatDate(client.created_at)}</p>
          </div>
        </div>
        {client.notas && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Notas</p>
            <p className="font-medium">{client.notas}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Órdenes ({orders.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Últimas Órdenes</h3>
              {orders.length === 0 ? (
                <p className="text-gray-600">No hay órdenes registradas</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="font-medium mt-1">{formatCurrency(order.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <p className="text-gray-600">No hay órdenes registradas</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.project_type} - {formatDate(order.created_at)}
                          </p>
                          {order.scope_description && (
                            <p className="text-sm text-gray-600 mt-1">{order.scope_description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="font-medium mt-1">{formatCurrency(order.total_price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
