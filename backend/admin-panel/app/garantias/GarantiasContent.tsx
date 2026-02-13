'use client';

import { useState, useEffect } from 'react';
import { getLegalTemplates, createLegalTemplate, updateLegalTemplate, deleteLegalTemplate, type LegalTemplate } from '@/lib/api';

export default function GarantiasContent() {
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const response = await getLegalTemplates(selectedCategory || undefined);
      setTemplates(response.data || []);
      console.log('✅ Garantías cargadas:', response.data?.length || 0);
      
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ No hay garantías disponibles. Asegúrate de ejecutar add_professional_features.sql');
      }
    } catch (error: any) {
      console.error('Error loading templates:', error);
      // No mostrar alert si es un 404 (tabla puede no existir aún)
      if (!error.message?.includes('404') && !error.message?.includes('Not Found')) {
        alert(`Error al cargar las garantías: ${error.message || 'Error desconocido'}\n\nVerifica que:\n1. El backend esté corriendo\n2. Hayas ejecutado add_professional_features.sql\n3. La tabla legal_templates exista en la base de datos`);
      } else {
        console.warn('⚠️ Tabla legal_templates no encontrada. Ejecuta add_professional_features.sql');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const categories = [
    { value: '', label: 'Todas' },
    { value: 'web', label: 'Web' },
    { value: 'app', label: 'App' },
    { value: 'system', label: 'Sistema' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'combined', label: 'Combinado' },
  ];

  if (loading) {
    return <div className="text-center py-8">Cargando garantías...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plantillas de Garantías y Términos Legales</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las garantías pre-escritas para cada tipo de proyecto
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Plantillas */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-4">No hay plantillas de garantías disponibles</p>
              <p className="text-sm text-gray-500 mb-4">
                Ejecuta el script SQL: <code className="bg-gray-200 px-2 py-1 rounded">backend/database/migrations/add_professional_features.sql</code>
              </p>
              <p className="text-xs text-gray-400">
                Este script crea la tabla <code>legal_templates</code> y agrega garantías pre-escritas para diferentes tipos de proyectos.
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      {template.is_default && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Por Defecto
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.category === 'web' ? 'bg-green-100 text-green-800' :
                        template.category === 'app' ? 'bg-purple-100 text-purple-800' :
                        template.category === 'system' ? 'bg-blue-100 text-blue-800' :
                        template.category === 'marketing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Garantía:</strong> {template.warranty_days} días
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Mantenimiento:</strong> {template.maintenance_months} meses
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {template.warranty_text.substring(0, 150)}...
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 ml-4">
                    Ver Detalles →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetails && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Información General */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Categoría:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Código:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.code}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Días de Garantía:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.warranty_days}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Meses de Mantenimiento:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.maintenance_months}</span>
                    </div>
                  </div>
                </div>

                {/* Términos de Pago */}
                {selectedTemplate.payment_terms_template && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Términos de Pago</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {selectedTemplate.payment_terms_template}
                      </p>
                    </div>
                  </div>
                )}

                {/* Garantía */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Texto de Garantía</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedTemplate.warranty_text}
                    </p>
                  </div>
                </div>

                {/* Mantenimiento */}
                {selectedTemplate.maintenance_text && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Política de Mantenimiento</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {selectedTemplate.maintenance_text}
                      </p>
                    </div>
                  </div>
                )}

                {/* Exclusiones */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Exclusiones</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedTemplate.exclusions_text}
                    </p>
                    {selectedTemplate.exclusions_list && selectedTemplate.exclusions_list.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Lista de Exclusiones:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                          {(selectedTemplate.exclusions_list as string[]).map((exclusion, idx) => (
                            <li key={idx}>{exclusion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cláusula Automática */}
                {selectedTemplate.automatic_clause && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cláusula Automática</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium">
                        {selectedTemplate.automatic_clause}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botón Cerrar */}
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
