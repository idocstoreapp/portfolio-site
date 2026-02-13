'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createOrderFromDiagnostic, getSolutionTemplates, getSolutionTemplate, type SolutionTemplate, type SolutionModule } from '@/lib/api';
import type { Diagnostic } from '@/lib/api';
import type { CreateOrderFromDiagnosticRequest } from '@/types/order';

interface CreateOrderFromDiagnosticProps {
  diagnostic: Diagnostic;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateOrderFromDiagnostic({
  diagnostic,
  onSuccess,
  onCancel,
}: CreateOrderFromDiagnosticProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SolutionTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState<CreateOrderFromDiagnosticRequest>({
    diagnostico_id: diagnostic.id,
    included_modules: [],
    excluded_modules: [],
    custom_features: '',
    base_price: undefined,
    modules_price: undefined,
    custom_adjustments: 0,
    discount_amount: 0,
    payment_terms: '',
    warranty_text: '',
    maintenance_policy: '',
    exclusions_text: '',
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
      if (templateResponse.success && templateResponse.data) {
        setSelectedTemplate(templateResponse.data);
        if (templateResponse.data.modules) {
          setModules(templateResponse.data.modules);
          // Auto-seleccionar módulos requeridos
          const requiredModules = templateResponse.data.modules
            .filter(m => m.is_required)
            .map(m => m.id);
          setSelectedModules(new Set(requiredModules));
        }
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

  function handleModuleToggle(moduleId: string) {
    const module = modules.find(m => m.id === moduleId);
    if (module?.is_required) {
      return;
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
      const orderData: CreateOrderFromDiagnosticRequest = {
        ...formData,
        solution_template_id: selectedTemplateId || undefined,
        included_modules: Array.from(selectedModules),
        excluded_modules: modules
          .filter(m => !selectedModules.has(m.id))
          .map(m => m.code),
      };

      const response = await createOrderFromDiagnostic(orderData);
      
      if (response.success) {
        alert('Orden creada correctamente desde el diagnóstico');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/ordenes/${response.data.id}`);
        }
      }
    } catch (error: any) {
      alert(`Error al crear la orden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Crear Orden desde Diagnóstico
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Este diagnóstico será convertido en una orden de trabajo. Completa los siguientes campos:
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Diagnóstico */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Información del Diagnóstico</h3>
          <p className="text-sm text-gray-600">
            <strong>Cliente:</strong> {diagnostic.empresa || diagnostic.nombre || 'Sin nombre'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tipo:</strong> {diagnostic.tipo_empresa}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Solución Principal:</strong> {diagnostic.solucion_principal}
          </p>
        </div>

        {/* Template de Solución */}
        <div>
          <label htmlFor="solution_template" className="block text-sm font-medium text-gray-700 mb-2">
            Solución *
          </label>
          <select
            id="solution_template"
            required
            value={selectedTemplateId}
            onChange={(e) => {
              setSelectedTemplateId(e.target.value);
              if (e.target.value) {
                loadTemplateModules(e.target.value);
              } else {
                setSelectedTemplate(null);
                setModules([]);
                setSelectedModules(new Set());
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Seleccionar solución...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.icon && `${template.icon} `}{template.name} 
                {template.is_prefabricated ? ' (Prefabricada)' : ' (Personalizada)'}
                {' - $'}{template.base_price.toLocaleString()} {template.currency}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                {selectedTemplate.icon && (
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedTemplate.description_detailed || selectedTemplate.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Tipo: <strong>{selectedTemplate.is_prefabricated ? 'App Prefabricada' : 'Desarrollo Personalizado'}</strong></span>
                    {selectedTemplate.estimated_delivery_days && (
                      <span>Entrega: <strong>{selectedTemplate.estimated_delivery_days} días</strong></span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Funcionalidades Incluidas */}
              {selectedTemplate.features_list && Array.isArray(selectedTemplate.features_list) && selectedTemplate.features_list.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <h5 className="font-medium text-sm text-gray-900 mb-2">Funcionalidades Incluidas:</h5>
                  <div className="space-y-2">
                    {selectedTemplate.features_list
                      .filter((f: any) => f.included && f.category === 'core')
                      .slice(0, 5)
                      .map((feature: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          <div>
                            <span className="font-medium text-gray-900">{feature.name}</span>
                            {feature.description && (
                              <span className="text-gray-600 ml-2">- {feature.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    {selectedTemplate.features_list.filter((f: any) => f.included && f.category === 'core').length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{selectedTemplate.features_list.filter((f: any) => f.included && f.category === 'core').length - 5} funcionalidades más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Módulos */}
        {modules.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Módulos a Incluir
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-4">
              {modules.map((module) => (
                <label
                  key={module.id}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer ${
                    selectedModules.has(module.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Características Personalizadas */}
        <div>
          <label htmlFor="custom_features" className="block text-sm font-medium text-gray-700 mb-2">
            Características Personalizadas
          </label>
          <textarea
            id="custom_features"
            rows={3}
            value={formData.custom_features}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_features: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Características adicionales..."
          />
        </div>

        {/* Ajustes de Precio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="custom_adjustments" className="block text-sm font-medium text-gray-700 mb-2">
              Ajustes Personalizados
            </label>
            <input
              id="custom_adjustments"
              type="number"
              value={formData.custom_adjustments}
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
              value={formData.discount_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Términos de Pago */}
        <div>
          <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
            Términos de Pago
          </label>
          <textarea
            id="payment_terms"
            rows={2}
            value={formData.payment_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Ej: 50% al inicio, 50% al finalizar..."
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !selectedTemplateId}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Orden'}
          </button>
        </div>
      </form>
    </div>
  );
}
