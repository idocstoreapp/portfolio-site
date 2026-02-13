'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getPricingConfigs, 
  createPricingConfig, 
  updatePricingConfig, 
  deletePricingConfig,
  getSolutionTemplates,
  getSolutionModules,
  type PricingConfig,
  type SolutionTemplate,
  type SolutionModule
} from '@/lib/api';

export default function PreciosContent() {
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingConfig>>({
    price_type: 'customization_hour',
    base_price: 0,
    currency: 'CLP',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Cargar templates y módulos primero (estos son críticos)
      const [templatesRes, modulesRes] = await Promise.all([
        getSolutionTemplates().catch(err => {
          console.error('Error loading templates:', err);
          return { success: false, data: [] };
        }),
        getSolutionModules().catch(err => {
          console.error('Error loading modules:', err);
          return { success: false, data: [] };
        }),
      ]);

      // Cargar pricing configs (puede fallar si no existe la tabla)
      let configsRes: { success: boolean; data: PricingConfig[] } = { success: true, data: [] };
      try {
        configsRes = await getPricingConfigs();
      } catch (err: any) {
        console.warn('⚠️ Pricing configs no disponibles (puede ser normal si no se ha creado la tabla):', err.message);
        // No es crítico, continuar sin pricing configs
      }

      setPricingConfigs(configsRes.data || []);
      setTemplates(templatesRes.data || []);
      setModules(modulesRes.data || []);
      
      // Debug: mostrar en consola
      console.log('✅ Templates cargados:', templatesRes.data?.length || 0);
      console.log('✅ Módulos cargados:', modulesRes.data?.length || 0);
      console.log('✅ Pricing configs cargados:', configsRes.data?.length || 0);
      
      if (!templatesRes.data || templatesRes.data.length === 0) {
        console.warn('⚠️ No hay templates disponibles. Verifica que seed_solution_templates.sql se ejecutó correctamente.');
      }
      if (!modulesRes.data || modulesRes.data.length === 0) {
        console.warn('⚠️ No hay módulos disponibles. Verifica que seed_solution_templates.sql se ejecutó correctamente.');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      // No mostrar alert si solo falla pricing-config
      if (!error.message?.includes('pricing-config')) {
        alert(`Error al cargar los datos: ${error.message || 'Error desconocido'}\n\nVerifica que:\n1. El backend esté corriendo\n2. Hayas ejecutado seed_solution_templates.sql\n3. Las tablas existan en la base de datos`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (editingId) {
        await updatePricingConfig(editingId, formData);
      } else {
        await createPricingConfig(formData);
      }
      setEditingId(null);
      setShowAddForm(false);
      setFormData({
        price_type: 'customization_hour',
        base_price: 0,
        currency: 'CLP',
        is_active: true,
      });
      loadData();
      alert('Precio guardado correctamente');
    } catch (error: any) {
      console.error('Error saving pricing config:', error);
      alert(`Error al guardar: ${error.message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este precio?')) return;

    try {
      await deletePricingConfig(id);
      loadData();
      alert('Precio eliminado correctamente');
    } catch (error: any) {
      console.error('Error deleting pricing config:', error);
      alert(`Error al eliminar: ${error.message}`);
    }
  }

  function startEdit(config: PricingConfig) {
    setEditingId(config.id);
    setFormData(config);
    setShowAddForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      price_type: 'customization_hour',
      base_price: 0,
      currency: 'CLP',
      is_active: true,
    });
  }

  const groupedConfigs = pricingConfigs.reduce((acc, config) => {
    if (!acc[config.price_type]) {
      acc[config.price_type] = [];
    }
    acc[config.price_type].push(config);
    return acc;
  }, {} as Record<string, PricingConfig[]>);

  if (loading) {
    return <div className="text-center py-8">Cargando precios...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Precios</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los precios de templates, módulos y servicios
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/templates-modulos"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Ver Templates y Módulos
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              + Agregar Precio
            </button>
          </div>
        </div>

        {/* Formulario de Agregar/Editar */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Precio' : 'Nuevo Precio'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Precio *
                </label>
                <select
                  value={formData.price_type || 'customization_hour'}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="template">Template (Solución)</option>
                  <option value="module">Módulo</option>
                  <option value="customization_hour">Hora de Personalización</option>
                  <option value="revision">Revisión Adicional</option>
                  <option value="support_hour">Hora de Soporte</option>
                  <option value="maintenance_month">Mes de Mantenimiento</option>
                </select>
              </div>

              {(formData.price_type === 'template' || formData.price_type === 'module') && (
                <>
                  {formData.price_type === 'template' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template
                      </label>
                      <select
                        value={formData.item_id || ''}
                        onChange={(e) => {
                          const template = templates.find(t => t.id === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            item_id: e.target.value,
                            item_code: template?.slug,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="">Seleccionar template...</option>
                        {templates.length === 0 ? (
                          <option value="" disabled>
                            {loading ? 'Cargando templates...' : 'No hay templates disponibles. Ejecuta seed_solution_templates.sql'}
                          </option>
                        ) : (
                          templates.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} (${t.base_price.toLocaleString()} {t.currency})
                            </option>
                          ))
                        )}
                      </select>
                      {templates.length === 0 && !loading && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ No hay templates disponibles ({templates.length} encontrados). 
                          <br />
                          Ve a <Link href="/templates-modulos" className="underline">"Templates y Módulos"</Link> para verificar o ejecuta seed_solution_templates.sql
                        </p>
                      )}
                      {templates.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ {templates.length} template(s) disponible(s)
                        </p>
                      )}
                    </div>
                  )}

                  {formData.price_type === 'module' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Módulo
                      </label>
                      <select
                        value={formData.item_id || ''}
                        onChange={(e) => {
                          const module = modules.find(m => m.id === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            item_id: e.target.value,
                            item_code: module?.code,
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="">Seleccionar módulo...</option>
                        {modules.length === 0 ? (
                          <option value="" disabled>
                            {loading ? 'Cargando módulos...' : 'No hay módulos disponibles. Ejecuta seed_solution_templates.sql'}
                          </option>
                        ) : (
                          modules.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} (${m.base_price.toLocaleString()} CLP)
                            </option>
                          ))
                        )}
                      </select>
                      {modules.length === 0 && !loading && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ No hay módulos disponibles ({modules.length} encontrados). 
                          <br />
                          Ve a <Link href="/templates-modulos" className="underline">"Templates y Módulos"</Link> para verificar o ejecuta seed_solution_templates.sql
                        </p>
                      )}
                      {modules.length > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ {modules.length} módulo(s) disponible(s)
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Base *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  value={formData.currency || 'CLP'}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="CLP">CLP (Pesos Chilenos)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-4">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        )}

        {/* Sección: Templates y Módulos Disponibles */}
        <div className="mb-8 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Apps Pre-fabricadas y Webs Disponibles</h2>
          
          {/* Templates Disponibles */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Templates de Soluciones (Apps Pre-fabricadas)</h3>
            {templates.length === 0 ? (
              <p className="text-gray-500 text-sm mb-2">
                No hay templates disponibles. Asegúrate de ejecutar el seed de datos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moneda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templates.map((template) => {
                      const templatePrice = pricingConfigs.find(p => p.price_type === 'template' && p.item_id === template.id);
                      return (
                        <tr key={template.id}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{template.icon}</span>
                              <span className="text-sm font-medium text-gray-900">{template.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">{template.description}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {templatePrice ? (
                              <span className="font-semibold">${templatePrice.base_price.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-400">${template.base_price.toLocaleString()} (default)</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {templatePrice?.currency || template.currency}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              template.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {template.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {templatePrice ? (
                              <button
                                onClick={() => startEdit(templatePrice)}
                                className="text-gray-900 hover:text-gray-700"
                              >
                                Editar Precio
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setFormData({
                                    price_type: 'template',
                                    item_id: template.id,
                                    item_code: template.slug,
                                    base_price: template.base_price,
                                    currency: template.currency,
                                    is_active: true,
                                  });
                                  setShowAddForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Configurar Precio
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Módulos Disponibles */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Módulos Disponibles</h3>
            {modules.length === 0 ? (
              <p className="text-gray-500 text-sm mb-2">
                No hay módulos disponibles. Asegúrate de ejecutar el seed de datos.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requerido</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modules.map((module) => {
                      const modulePrice = pricingConfigs.find(p => p.price_type === 'module' && p.item_id === module.id);
                      return (
                        <tr key={module.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{module.name}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{module.category}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {modulePrice ? (
                              <span className="font-semibold">${modulePrice.base_price.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-400">${module.base_price.toLocaleString()} (default)</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              module.is_required 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {module.is_required ? 'Requerido' : 'Opcional'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {modulePrice ? (
                              <button
                                onClick={() => startEdit(modulePrice)}
                                className="text-gray-900 hover:text-gray-700"
                              >
                                Editar Precio
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setFormData({
                                    price_type: 'module',
                                    item_id: module.id,
                                    item_code: module.code,
                                    base_price: module.base_price,
                                    currency: 'CLP',
                                    is_active: true,
                                  });
                                  setShowAddForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Configurar Precio
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Precios Configurados */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Precios Configurados</h2>
          {Object.entries(groupedConfigs).map(([type, configs]) => (
            <div key={type} className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {type === 'template' && 'Precios de Templates'}
                {type === 'module' && 'Precios de Módulos'}
                {type === 'customization_hour' && 'Precio por Hora de Personalización'}
                {type === 'revision' && 'Precio por Revisión Adicional'}
                {type === 'support_hour' && 'Precio por Hora de Soporte'}
                {type === 'maintenance_month' && 'Precio por Mes de Mantenimiento'}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moneda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configs.map((config) => {
                      const itemName = config.item_code || config.item_id || 'Global';
                      return (
                        <tr key={config.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {itemName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${config.base_price.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config.currency}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              config.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {config.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => startEdit(config)}
                              className="text-gray-900 hover:text-gray-700 mr-4"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {pricingConfigs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay precios configurados. Agrega el primero usando el botón "Agregar Precio".
          </div>
        )}
      </div>
    </div>
  );
}
