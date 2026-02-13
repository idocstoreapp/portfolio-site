'use client';

import { useState, useEffect } from 'react';
import { getSolutionModules, type SolutionModule } from '@/lib/api';

interface ModulesDisplayProps {
  moduleIds: string[];
  title: string;
  variant?: 'included' | 'excluded';
}

export default function ModulesDisplay({ moduleIds, title, variant = 'included' }: ModulesDisplayProps) {
  const [modules, setModules] = useState<SolutionModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, [moduleIds]);

  async function loadModules() {
    if (!moduleIds || moduleIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Cargar todos los módulos y filtrar por IDs
      const response = await getSolutionModules();
      if (response.success) {
        const filtered = response.data.filter(m => moduleIds.includes(m.id));
        setModules(filtered);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-500">Cargando módulos...</p>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${variant === 'excluded' ? 'opacity-75' : ''}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="space-y-2">
          {moduleIds.map((id, index) => (
            <div key={index} className="text-sm text-gray-500">
              <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
              <span className="ml-2 text-xs text-gray-400">(ID no encontrado)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${variant === 'excluded' ? 'opacity-75' : ''}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {modules.map((module) => (
          <div key={module.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{module.name}</h3>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    module.category === 'core' ? 'bg-blue-100 text-blue-800' :
                    module.category === 'advanced' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {module.category || 'general'}
                  </span>
                  {module.is_required && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Requerido
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    ${module.base_price.toLocaleString()} CLP
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Mostrar IDs no encontrados */}
        {moduleIds.length > modules.length && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Módulos no encontrados (IDs):</p>
            {moduleIds.filter(id => !modules.find(m => m.id === id)).map((id, index) => (
              <code key={index} className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">{id}</code>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
