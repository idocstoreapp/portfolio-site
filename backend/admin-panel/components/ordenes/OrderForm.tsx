'use client';

import { useState, useEffect } from 'react';
import { updateOrder } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { OrderStatus, UpdateOrderRequest } from '@/types/order';
import type { Order } from '@/types/order';

interface OrderFormProps {
  order: Order;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'accepted', label: 'Aceptada' },
  { value: 'in_development', label: 'En Desarrollo' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

export default function OrderForm({ order, onUpdate }: OrderFormProps) {
  const [formData, setFormData] = useState<UpdateOrderRequest>({
    status: order.status,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sincronizar estado cuando cambie la orden
    setFormData({ status: order.status });
  }, [order.status]);

  async function handleSave() {
    if (!formData.status) {
      alert('Por favor selecciona un estado');
      return;
    }

    setSaving(true);
    try {
      await updateOrder(order.id, formData);
      alert('Orden actualizada correctamente');
      onUpdate();
    } catch (error: unknown) {
      console.error('Error updating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de la Orden</h2>
      
      <div className="space-y-4">
        {/* Estado */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Estado de la Orden *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.status === 'draft' && 'La orden está en borrador. Puedes editarla libremente.'}
            {formData.status === 'sent' && 'La orden ha sido enviada al cliente. Esperando respuesta.'}
            {formData.status === 'accepted' && 'El cliente aceptó la orden. Lista para comenzar desarrollo.'}
            {formData.status === 'in_development' && 'El proyecto está en desarrollo activo.'}
            {formData.status === 'completed' && 'El proyecto ha sido completado y entregado.'}
            {formData.status === 'cancelled' && 'La orden ha sido cancelada.'}
          </p>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
