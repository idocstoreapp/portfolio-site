'use client';

import { useState, useEffect } from 'react';
import { getOrders, type Order } from '@/lib/api';
import OrderCard from './OrderCard';
import OrderFilters from './OrderFilters';
import type { OrderStatus, ProjectType } from '@/types/order';

interface OrderListProps {
  initialOrders?: Order[];
  initialTotal?: number;
}

export default function OrderList({ 
  initialOrders = [],
  initialTotal = 0 
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState<{
    status?: OrderStatus | string;
    projectType?: ProjectType | string;
    search?: string;
  }>({
    status: undefined,
    projectType: undefined,
    search: undefined,
  });

  const limit = 20;

  useEffect(() => {
    loadOrders();
  }, [page, filters]);

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await getOrders(page, limit, filters);
      if (response.success) {
        setOrders(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => {
          setFilters({ status: undefined, projectType: undefined, search: undefined });
          setPage(1);
        }}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No se encontraron órdenes</p>
          <p className="text-sm text-gray-500 mt-2">
            Crea tu primera orden desde un diagnóstico o manualmente
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order}
                onUpdate={loadOrders}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} órdenes
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
