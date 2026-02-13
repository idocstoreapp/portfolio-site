'use client';

import { useState } from 'react';
import { createChangeOrder, type ChangeOrder } from '@/lib/api';
import type { Order } from '@/types/order';

interface ChangeOrderFormProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeOrderForm({ order, onClose, onSuccess }: ChangeOrderFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ChangeOrder>>({
    order_id: order.id,
    title: '',
    description: '',
    reason: '',
    estimated_hours: 0,
    estimated_cost: 0,
    currency: order.currency || 'CLP',
    status: 'pending',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.estimated_cost) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      await createChangeOrder(formData);
      alert('Orden de cambio creada correctamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating change order:', error);
      alert(`Error al crear orden de cambio: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nueva Orden de Cambio</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Cambio *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Ej: Agregar botón de exportar datos"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Detallada *
              </label>
              <textarea
                id="description"
                rows={6}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Describe detalladamente el cambio solicitado..."
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Razón del Cambio
              </label>
              <textarea
                id="reason"
                rows={3}
                value={formData.reason || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="¿Por qué se solicita este cambio?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Estimadas
                </label>
                <input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimated_hours || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Estimado *
                </label>
                <input
                  id="estimated_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.estimated_cost || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.currency || 'CLP'}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="client_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas para el Cliente
              </label>
              <textarea
                id="client_notes"
                rows={3}
                value={formData.client_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Notas que verá el cliente en la orden de cambio..."
              />
            </div>

            <div>
              <label htmlFor="internal_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                id="internal_notes"
                rows={2}
                value={formData.internal_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Notas internas para el equipo..."
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creando...' : 'Crear Orden de Cambio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
