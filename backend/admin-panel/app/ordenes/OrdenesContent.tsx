'use client';

import { useEffect, useState } from 'react';
import OrderList from '@/components/ordenes/OrderList';
import { getOrders } from '@/lib/api';
import type { Order } from '@/types/order';

export default function OrdenesContent() {
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const response = await getOrders(1, 20);
      if (response.success) {
        setInitialOrders(response.data);
        setInitialTotal(response.total);
      }
    } catch (error) {
      console.error('Error loading initial orders:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return <OrderList initialOrders={initialOrders} initialTotal={initialTotal} />;
}
