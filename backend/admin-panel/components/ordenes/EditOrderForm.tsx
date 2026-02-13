'use client';

import { useState, useEffect } from 'react';
import { updateOrder, getSolutionModules, getLegalTemplates, getDefaultLegalTemplate, getSolutionModules as fetchModules, type SolutionModule, type LegalTemplate } from '@/lib/api';
import type { Order, UpdateOrderRequest, OrderStatus } from '@/types/order';
import { format } from 'date-fns';

interface EditOrderFormProps {
  order: Order;
  onUpdate: () => void;
}

export default function EditOrderForm({ order, onUpdate }: EditOrderFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [legalTemplates, setLegalTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  
  const [formData, setFormData] = useState<UpdateOrderRequest>({
    status: order.status,
    scope_description: order.scope_description,
    included_modules: order.included_modules || [],
    excluded_modules: order.excluded_modules || [],
    custom_features: order.custom_features,
    base_price: order.base_price,
    modules_price: order.modules_price,
    custom_adjustments: order.custom_adjustments,
    discount_amount: order.discount_amount,
    total_price: order.total_price,
    payment_terms: order.payment_terms,
    warranty_text: order.warranty_text,
    maintenance_policy: order.maintenance_policy,
    exclusions_text: order.exclusions_text,
    estimated_start_date: order.estimated_start_date,
    estimated_completion_date: order.estimated_completion_date,
    internal_notes: order.internal_notes,
    client_notes: order.client_notes,
  });

  useEffect(() => {
    if (showForm) {
      if (order.solution_template_id) {
        loadModules();
      }
      loadLegalTemplates();
      if ((order as any).legal_template_id) {
        loadSelectedTemplate((order as any).legal_template_id);
      }
    }
  }, [showForm, order.solution_template_id]);

  async function loadLegalTemplates() {
    try {
      const category = getCategoryFromProjectType(order.project_type);
      const response = await getLegalTemplates(category);
      if (response.success) {
        setLegalTemplates(response.data);
      }
    } catch (error) {
      console.error('Error loading legal templates:', error);
    }
  }

  async function loadSelectedTemplate(templateId: string) {
    try {
      const templates = await getLegalTemplates();
      if (templates.success) {
        const template = templates.data.find(t => t.id === templateId);
        if (template) {
          setSelectedTemplate(template);
          // Auto-completar campos si no están llenos
          if (!formData.warranty_text && template.warranty_text) {
            setFormData(prev => ({ ...prev, warranty_text: template.warranty_text }));
          }
          if (!formData.maintenance_policy && template.maintenance_text) {
            setFormData(prev => ({ ...prev, maintenance_policy: template.maintenance_text }));
          }
          if (!formData.exclusions_text && template.exclusions_text) {
            setFormData(prev => ({ ...prev, exclusions_text: template.exclusions_text }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading selected template:', error);
    }
  }

  function getCategoryFromProjectType(projectType: string): string {
    if (projectType === 'web') return 'web';
    if (projectType === 'sistema') return 'system';
    if (projectType === 'combinado') return 'combined';
    return 'custom';
  }

  function handleTemplateChange(templateId: string) {
    const template = legalTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        warranty_text: template.warranty_text,
        maintenance_policy: template.maintenance_text || '',
        exclusions_text: template.exclusions_text,
      }));
    }
  }

  async function loadModules() {
    try {
      const response = await getSolutionModules(order.solution_template_id);
      if (response.success) {
        setModules(response.data);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  }

  function calculateTotal() {
    const base = formData.base_price || order.base_price || 0;
    const modules = formData.modules_price || order.modules_price || 0;
    const adjustments = formData.custom_adjustments || order.custom_adjustments || 0;
    const discount = formData.discount_amount || order.discount_amount || 0;
    return base + modules + adjustments - discount;
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Calcular total si no está definido manualmente
      const total = formData.total_price || calculateTotal();
      
      await updateOrder(order.id, {
        ...formData,
        total_price: total,
      });
      
      alert('Orden actualizada correctamente');
      setShowForm(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert(`Error al actualizar: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

  const totalPrice = calculateTotal();

  if (!showForm) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de la Orden</h2>
            <p className="text-sm text-gray-600 mt-1">
              Estado actual: <span className="font-medium">{order.status}</span>
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            ✏️ Editar Orden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Editar Orden</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
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
            <option value="draft">Borrador</option>
            <option value="sent">Enviada</option>
            <option value="accepted">Aceptada</option>
            <option value="in_development">En Desarrollo</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Alcance del Proyecto */}
        <div>
          <label htmlFor="scope_description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Alcance
          </label>
          <textarea
            id="scope_description"
            rows={6}
            value={formData.scope_description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, scope_description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Describe el alcance del proyecto..."
          />
        </div>

        {/* Características Personalizadas */}
        <div>
          <label htmlFor="custom_features" className="block text-sm font-medium text-gray-700 mb-2">
            Características Personalizadas
          </label>
          <textarea
            id="custom_features"
            rows={4}
            value={formData.custom_features || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_features: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Características adicionales..."
          />
        </div>

        {/* Aspectos Económicos */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspectos Económicos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio Base
              </label>
              <input
                id="base_price"
                type="number"
                min="0"
                value={formData.base_price || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="modules_price" className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Módulos
              </label>
              <input
                id="modules_price"
                type="number"
                min="0"
                value={formData.modules_price || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, modules_price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="custom_adjustments" className="block text-sm font-medium text-gray-700 mb-2">
                Ajustes Personalizados
              </label>
              <input
                id="custom_adjustments"
                type="number"
                value={formData.custom_adjustments || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_adjustments: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-2">
                Descuento
              </label>
              <input
                id="discount_amount"
                type="number"
                min="0"
                value={formData.discount_amount || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="total_price" className="block text-sm font-medium text-gray-700 mb-2">
                Total (Calculado automáticamente, puedes sobrescribir)
              </label>
              <input
                id="total_price"
                type="number"
                min="0"
                value={formData.total_price || totalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, total_price: parseFloat(e.target.value) || totalPrice }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total calculado: ${totalPrice.toLocaleString()} {order.currency || 'CLP'}
              </p>
            </div>
          </div>
        </div>

        {/* Términos de Pago */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Términos de Pago</h3>
          <textarea
            id="payment_terms"
            rows={4}
            value={formData.payment_terms || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Ej: 50% al inicio del proyecto, 50% al finalizar..."
          />
        </div>

        {/* Límites Cuantificables */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Límites y Contadores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="revisiones_incluidas" className="block text-sm font-medium text-gray-700 mb-2">
                Revisiones Incluidas
              </label>
              <input
                id="revisiones_incluidas"
                type="number"
                min="0"
                value={(order as any).revisiones_incluidas || 2}
                onChange={(e) => {
                  // Actualizar en el backend si es necesario
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usadas: {(order as any).revisiones_usadas || 0} / {(order as any).revisiones_incluidas || 2}
              </p>
            </div>

            <div>
              <label htmlFor="customization_hours_included" className="block text-sm font-medium text-gray-700 mb-2">
                Horas de Personalización Incluidas
              </label>
              <input
                id="customization_hours_included"
                type="number"
                min="0"
                step="0.5"
                value={(order as any).customization_hours_included || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usadas: {(order as any).customization_hours_used || 0} / {(order as any).customization_hours_included || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas Estimadas */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas Estimadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimated_start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                id="estimated_start_date"
                type="date"
                value={formData.estimated_start_date ? format(new Date(formData.estimated_start_date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="estimated_completion_date" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Finalización
              </label>
              <input
                id="estimated_completion_date"
                type="date"
                value={formData.estimated_completion_date ? format(new Date(formData.estimated_completion_date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Términos Legales */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Términos Legales</h3>
          <div className="space-y-4">
            {legalTemplates.length > 0 && (
              <div>
                <label htmlFor="legal_template" className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla Legal Pre-escrita
                </label>
                <select
                  id="legal_template"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-2"
                >
                  <option value="">Seleccionar plantilla...</option>
                  {legalTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.warranty_days} días garantía)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Selecciona una plantilla para auto-completar garantías y exclusiones
                </p>
              </div>
            )}
            <div>
              <label htmlFor="warranty_text" className="block text-sm font-medium text-gray-700 mb-2">
                Texto de Garantía
              </label>
              <textarea
                id="warranty_text"
                rows={3}
                value={formData.warranty_text || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Términos de garantía del proyecto..."
              />
            </div>

            <div>
              <label htmlFor="maintenance_policy" className="block text-sm font-medium text-gray-700 mb-2">
                Política de Mantenimiento
              </label>
              <textarea
                id="maintenance_policy"
                rows={3}
                value={formData.maintenance_policy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenance_policy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Política de mantenimiento y soporte..."
              />
            </div>

            <div>
              <label htmlFor="exclusions_text" className="block text-sm font-medium text-gray-700 mb-2">
                Exclusiones
              </label>
              <textarea
                id="exclusions_text"
                rows={3}
                value={formData.exclusions_text || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, exclusions_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Qué NO está incluido en el proyecto..."
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="internal_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas Internas
              </label>
              <textarea
                id="internal_notes"
                rows={4}
                value={formData.internal_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Notas internas para el equipo..."
              />
            </div>

            <div>
              <label htmlFor="client_notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas para el Cliente
              </label>
              <textarea
                id="client_notes"
                rows={4}
                value={formData.client_notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Notas visibles para el cliente..."
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
