'use client';

import { useState, useEffect } from 'react';
import type { Diagnostic } from '@/lib/api';

interface CostosRealesProps {
  diagnostic: Diagnostic;
  onUpdate: () => void;
}

type TabType = 'resumen' | 'gastos' | 'mano-obra' | 'materiales';

export default function CostosReales({ diagnostic, onUpdate }: CostosRealesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resumen');
  const [gastos, setGastos] = useState<any[]>([]);
  const [manoObra, setManoObra] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: Implementar carga de gastos, mano de obra y materiales desde el backend
  // Por ahora, estos datos se guardan en el diagnóstico directamente

  const tabs = [
    { id: 'resumen' as TabType, label: '📊 Resumen', icon: '📊' },
    { id: 'gastos' as TabType, label: '💰 Gastos', icon: '💰' },
    { id: 'mano-obra' as TabType, label: '👷 Mano de Obra', icon: '👷' },
    { id: 'materiales' as TabType, label: '🧱 Materiales', icon: '🧱' },
  ];

  const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
  const totalManoObra = manoObra.reduce((sum, m) => sum + (m.costo || 0), 0);
  const totalMateriales = materiales.reduce((sum, m) => sum + (m.costo || 0), 0);
  const costoTotal = totalGastos + totalManoObra + totalMateriales;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Control de Costos Reales</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Costo Real Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(diagnostic.costo_real || 0).toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Horas Trabajadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {diagnostic.trabajo_real_horas || 0}h
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Costo por Hora</p>
                <p className="text-2xl font-bold text-gray-900">
                  {diagnostic.costo_real && diagnostic.trabajo_real_horas
                    ? `$${Math.round(diagnostic.costo_real / diagnostic.trabajo_real_horas).toLocaleString()}`
                    : '$0'}
                </p>
              </div>
            </div>

            {diagnostic.fecha_aprobacion && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">Aprobado el:</span>{' '}
                  {new Date(diagnostic.fecha_aprobacion).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gastos' && (
          <div>
            <p className="text-gray-600">Funcionalidad de gastos detallados próximamente</p>
            <p className="text-sm text-gray-500 mt-2">
              Por ahora, el costo real se registra directamente en el diagnóstico.
            </p>
          </div>
        )}

        {activeTab === 'mano-obra' && (
          <div>
            <p className="text-gray-600">Funcionalidad de mano de obra detallada próximamente</p>
            <p className="text-sm text-gray-500 mt-2">
              Por ahora, las horas trabajadas se registran directamente en el diagnóstico.
            </p>
          </div>
        )}

        {activeTab === 'materiales' && (
          <div>
            <p className="text-gray-600">Funcionalidad de materiales próximamente</p>
            <p className="text-sm text-gray-500 mt-2">
              Por ahora, el costo de materiales está incluido en el costo real total.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

