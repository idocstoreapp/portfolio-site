'use client';

import { useState, useEffect } from 'react';
import { getSolutionTemplates, getSolutionModules, type SolutionTemplate, type SolutionModule } from '@/lib/api';
import Link from 'next/link';

export default function TemplatesModulosContent() {
  const [templates, setTemplates] = useState<SolutionTemplate[]>([]);
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'modules'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'modules' && selectedTemplate) {
      loadModules(selectedTemplate);
    } else if (activeTab === 'modules') {
      loadModules();
    }
  }, [activeTab, selectedTemplate]);

  async function loadData() {
    setLoading(true);
    try {
      const [templatesRes, modulesRes] = await Promise.all([
        getSolutionTemplates(),
        getSolutionModules(),
      ]);

      setTemplates(templatesRes.data || []);
      setModules(modulesRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert(`Error al cargar los datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadModules(templateId?: string) {
    try {
      const response = await getSolutionModules(templateId);
      setModules(response.data || []);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      alert(`Error al cargar módulos: ${error.message}`);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates y Módulos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las apps pre-fabricadas y sus módulos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/precios"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Ir a Precios
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates (Apps Pre-fabricadas)
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Módulos
            </button>
          </nav>
        </div>

        {/* Contenido de Templates */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Templates Disponibles ({templates.length})
              </h2>
              {templates.length === 0 && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  ⚠️ No hay templates. Ejecuta <code className="bg-red-100 px-2 py-1 rounded">seed_solution_templates.sql</code> en Supabase
                </div>
              )}
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No hay templates disponibles</p>
                <p className="text-sm text-gray-500">
                  Ejecuta el script SQL: <code className="bg-gray-200 px-2 py-1 rounded">backend/database/migrations/seed_solution_templates.sql</code>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icono</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moneda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-2xl">{template.icon || '📦'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <code className="bg-gray-100 px-2 py-1 rounded">{template.slug}</code>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">{template.description || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${template.base_price.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{template.currency}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            template.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contenido de Módulos */}
        {activeTab === 'modules' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Módulos Disponibles ({modules.length})
              </h2>
              <div className="flex items-center gap-4">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="">Todos los templates</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {modules.length === 0 && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    ⚠️ No hay módulos. Ejecuta <code className="bg-red-100 px-2 py-1 rounded">seed_solution_templates.sql</code>
                  </div>
                )}
              </div>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No hay módulos disponibles</p>
                <p className="text-sm text-gray-500">
                  Ejecuta el script SQL: <code className="bg-gray-200 px-2 py-1 rounded">backend/database/migrations/seed_solution_templates.sql</code>
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requerido</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modules.map((module) => {
                      const template = templates.find(t => t.id === module.solution_template_id);
                      return (
                        <tr key={module.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded">{module.code}</code>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{module.name}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              module.category === 'core' ? 'bg-blue-100 text-blue-800' :
                              module.category === 'advanced' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {module.category || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {template ? template.name : '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            ${module.base_price.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              module.is_required 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {module.is_required ? 'Sí' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              module.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {module.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Cómo Agregar Templates y Módulos</h3>
          <p className="text-sm text-blue-800 mb-2">
            Los templates y módulos se gestionan directamente en la base de datos mediante scripts SQL.
          </p>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>1. Para agregar templates/módulos:</strong> Ejecuta <code className="bg-blue-100 px-1 rounded">seed_solution_templates.sql</code> en Supabase</p>
            <p><strong>2. Para modificar precios:</strong> Ve a <Link href="/precios" className="underline">Precios</Link> y configura precios personalizados</p>
            <p><strong>3. Para editar datos:</strong> Modifica directamente en Supabase o ejecuta scripts SQL personalizados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
