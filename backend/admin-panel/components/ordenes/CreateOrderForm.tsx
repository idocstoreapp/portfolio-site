'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, getSolutionTemplates, getSolutionTemplate, getSolutionModules, type SolutionTemplate, type SolutionModule } from '@/lib/api';
import type { CreateOrderRequest, ProjectType } from '@/types/order';

export default function CreateOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState<CreateOrderRequest>({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    project_type: 'sistema' as ProjectType,
    scope_description: '',
    included_modules: [],
    excluded_modules: [],
    custom_features: '',
    base_price: 0,
    modules_price: 0,
    custom_adjustments: 0,
    discount_amount: 0,
    payment_terms: '',
    warranty_text: '',
    maintenance_policy: '',
    exclusions_text: '',
    estimated_start_date: '',
    estimated_completion_date: '',
    internal_notes: '',
    client_notes: '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplateModules(selectedTemplateId);
    } else {
      setModules([]);
      setSelectedModules(new Set());
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    calculatePrices();
  }, [selectedTemplateId, selectedModules, formData.custom_adjustments, formData.discount_amount]);

  async function loadTemplates() {
    try {
      const response = await getSolutionTemplates();
      if (response.success) {
        setTemplates(response.data.filter(t => t.is_active));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async function loadTemplateModules(templateId: string) {
    try {
      const templateResponse = await getSolutionTemplate(templateId);
      if (templateResponse.success && templateResponse.data.modules) {
        setModules(templateResponse.data.modules);
        // Auto-seleccionar módulos requeridos
        const requiredModules = templateResponse.data.modules
          .filter(m => m.is_required)
          .map(m => m.id);
        setSelectedModules(new Set(requiredModules));
        // Establecer precio base del template
        setFormData(prev => ({
          ...prev,
          base_price: templateResponse.data.base_price,
        }));
      }
    } catch (error) {
      console.error('Error loading template modules:', error);
    }
  }

  function calculatePrices() {
    let modulesPrice = 0;
    let basePrice = formData.base_price || 0;

    // Calcular precio de módulos seleccionados
    selectedModules.forEach(moduleId => {
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        modulesPrice += module.base_price;
      }
    });

    // Calcular total
    const total = basePrice + modulesPrice + (formData.custom_adjustments || 0) - (formData.discount_amount || 0);

    setFormData(prev => ({
      ...prev,
      modules_price: modulesPrice,
    }));
  }

  function handleModuleToggle(moduleId: string) {
    const module = modules.find(m => m.id === moduleId);
    if (module?.is_required) {
      return; // No permitir deseleccionar módulos requeridos
    }

    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: CreateOrderRequest = {
        ...formData,
        solution_template_id: selectedTemplateId || undefined,
        included_modules: Array.from(selectedModules),
        excluded_modules: modules
          .filter(m => !selectedModules.has(m.id))
          .map(m => m.code),
      };

      const response = await createOrder(orderData);
      
      if (response.success) {
        alert('Orden creada correctamente');
        router.push(`/ordenes/${response.data.id}`);
      }
    } catch (error: any) {
      alert(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const totalPrice = (formData.base_price || 0) + (formData.modules_price || 0) + (formData.custom_adjustments || 0) - (formData.discount_amount || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Cliente */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Cliente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Cliente *
            </label>
            <input
              id="client_name"
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="client_company" className="block text-sm font-medium text-gray-700 mb-2">
              Empresa
            </label>
            <input
              id="client_company"
              type="text"
              value={formData.client_company}
              onChange={(e) => setFormData(prev => ({ ...prev, client_company: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              id="client_phone"
              type="tel"
              value={formData.client_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tipo de Proyecto y Template */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de Proyecto</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Proyecto *
            </label>
            <select
              id="project_type"
              required
              value={formData.project_type}
              onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value as ProjectType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="web">Sitio Web</option>
              <option value="sistema">Sistema</option>
              <option value="app">Aplicación</option>
              <option value="marketing">Marketing</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label htmlFor="solution_template" className="block text-sm font-medium text-gray-700 mb-2">
              Template de Solución (Opcional)
            </label>
            <select
              id="solution_template"
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                if (e.target.value) {
                  loadTemplateModules(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Seleccionar template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - ${template.base_price.toLocaleString()} {template.currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Módulos */}
      {modules.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Módulos</h2>
          <p className="text-sm text-gray-600 mb-4">
            Selecciona los módulos que se incluirán en esta orden. Los módulos marcados como requeridos no se pueden deseleccionar.
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {modules.map((module) => (
              <label
                key={module.id}
                className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                  selectedModules.has(module.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${module.is_required ? 'opacity-75' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedModules.has(module.id)}
                  onChange={() => handleModuleToggle(module.id)}
                  disabled={module.is_required}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {module.name}
                      {module.is_required && (
                        <span className="ml-2 text-xs text-red-600">(Requerido)</span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      ${module.base_price.toLocaleString()} CLP
                    </span>
                  </div>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  )}
                  {module.category && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {module.category}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Alcance del Proyecto */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Alcance del Proyecto</h2>
        
        <div>
          <label htmlFor="scope_description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del Alcance
          </label>
          <textarea
            id="scope_description"
            rows={6}
            value={formData.scope_description}
            onChange={(e) => setFormData(prev => ({ ...prev, scope_description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Describe el alcance del proyecto, qué se incluye y qué se excluye..."
          />
        </div>

        <div className="mt-4">
          <label htmlFor="custom_features" className="block text-sm font-medium text-gray-700 mb-2">
            Características Personalizadas
          </label>
          <textarea
            id="custom_features"
            rows={4}
            value={formData.custom_features}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_features: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Características adicionales o personalizaciones específicas..."
          />
        </div>
      </div>

      {/* Aspectos Económicos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Aspectos Económicos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Base *
            </label>
            <input
              id="base_price"
              type="number"
              required
              min="0"
              value={formData.base_price || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="modules_price" className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Módulos (Calculado)
            </label>
            <input
              id="modules_price"
              type="number"
              readOnly
              value={formData.modules_price || 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
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
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-gray-900">
              ${totalPrice.toLocaleString()} CLP
            </span>
          </div>
        </div>
      </div>

      {/* Términos de Pago */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Términos de Pago</h2>
        
        <div>
          <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
            Términos de Pago
          </label>
          <textarea
            id="payment_terms"
            rows={4}
            value={formData.payment_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Ej: 50% al inicio, 50% al finalizar..."
          />
        </div>
      </div>

      {/* Términos Legales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Términos Legales</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="warranty_text" className="block text-sm font-medium text-gray-700 mb-2">
              Texto de Garantía
            </label>
            <textarea
              id="warranty_text"
              rows={3}
              value={formData.warranty_text}
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
              value={formData.maintenance_policy}
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
              value={formData.exclusions_text}
              onChange={(e) => setFormData(prev => ({ ...prev, exclusions_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Qué NO está incluido en el proyecto..."
            />
          </div>
        </div>
      </div>

      {/* Fechas Estimadas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Fechas Estimadas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimated_start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio Estimada
            </label>
            <input
              id="estimated_start_date"
              type="date"
              value={formData.estimated_start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="estimated_completion_date" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Finalización Estimada
            </label>
            <input
              id="estimated_completion_date"
              type="date"
              value={formData.estimated_completion_date}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="internal_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas Internas
            </label>
            <textarea
              id="internal_notes"
              rows={4}
              value={formData.internal_notes}
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
              value={formData.client_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, client_notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Notas visibles para el cliente..."
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando...' : 'Crear Orden'}
        </button>
      </div>
    </form>
  );
}
