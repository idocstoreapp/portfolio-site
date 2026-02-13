'use client';

import { useState, useEffect } from 'react';
import { updateDiagnostic, type Diagnostic } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import GenerateOrderPDF from './GenerateOrderPDF';
import CreateOrderFromDiagnostic from '@/components/ordenes/CreateOrderFromDiagnostic';

interface DiagnosticFormProps {
  diagnostic: Diagnostic;
  diagnosticResult?: any;
  onUpdate: () => void;
}

export default function DiagnosticForm({ 
  diagnostic, 
  diagnosticResult,
  onUpdate 
}: DiagnosticFormProps) {
  const [formData, setFormData] = useState({
    status: diagnostic.estado,
    asignadoA: diagnostic.asignado_a || '',
    notas: diagnostic.notas || '',
    costoReal: diagnostic.costo_real || 0,
    trabajoRealHoras: diagnostic.trabajo_real_horas || 0,
  });
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }

  async function handleSave() {
    if (!currentUser) {
      alert('Error: No se pudo obtener el usuario actual');
      return;
    }

    setSaving(true);
    try {
      await updateDiagnostic(diagnostic.id, {
        status: formData.status,
        asignadoA: formData.asignadoA || undefined,
        notas: formData.notas || undefined,
        costoReal: formData.costoReal > 0 ? formData.costoReal : undefined,
        trabajoRealHoras: formData.trabajoRealHoras > 0 ? formData.trabajoRealHoras : undefined,
        aprobadoPor: (formData.status === 'proyecto' || formData.status === 'cerrado') 
          ? currentUser.id 
          : undefined,
      });

      alert('Diagnóstico actualizado correctamente');
      onUpdate();
    } catch (error: any) {
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  const canGenerateOrder = formData.status === 'proyecto' || formData.status === 'cerrado';
  const canCreateOrder = formData.status === 'cotizando' || formData.status === 'proyecto' || formData.status === 'cerrado';

  return (
    <div className="space-y-6">
      {/* Información del diagnóstico */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Diagnóstico</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
            <p className="text-lg font-semibold text-gray-900">
              {diagnostic.empresa || diagnostic.nombre || 'Sin nombre'}
            </p>
            {diagnostic.nombre && diagnostic.empresa && (
              <p className="text-sm text-gray-600 mt-1">{diagnostic.nombre}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contacto</h3>
            {diagnostic.email && (
              <p className="text-sm text-gray-900">📧 {diagnostic.email}</p>
            )}
            {diagnostic.telefono && (
              <p className="text-sm text-gray-900">📱 {diagnostic.telefono}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tipo de Empresa</h3>
            <p className="text-sm text-gray-900">{diagnostic.tipo_empresa}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha de Creación</h3>
            <p className="text-sm text-gray-900">
              {format(new Date(diagnostic.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>

          {diagnosticResult && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Solución Principal</h3>
                <p className="text-sm font-semibold text-gray-900">
                  {diagnosticResult.primarySolution?.title || diagnostic.solucion_principal}
                </p>
                {diagnosticResult.primarySolution?.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {diagnosticResult.primarySolution.description}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Urgencia</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  diagnostic.urgencia === 'high' ? 'bg-red-100 text-red-800' :
                  diagnostic.urgencia === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {diagnostic.urgencia === 'high' ? '⚡ Alta' :
                   diagnostic.urgencia === 'medium' ? '📈 Media' : '✨ Baja'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulario de gestión */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestionar Diagnóstico</h2>

        <div className="space-y-6">
          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="cotizando">Cotizando</option>
              <option value="proyecto">Proyecto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          {/* Costo Real */}
          <div>
            <label htmlFor="costoReal" className="block text-sm font-medium text-gray-700 mb-2">
              Costo Real del Proyecto ($)
            </label>
            <input
              id="costoReal"
              type="number"
              min="0"
              step="0.01"
              value={formData.costoReal}
              onChange={(e) => setFormData({ ...formData, costoReal: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Costo total real del proyecto incluyendo materiales, servicios y gastos
            </p>
          </div>

          {/* Trabajo Real */}
          <div>
            <label htmlFor="trabajoRealHoras" className="block text-sm font-medium text-gray-700 mb-2">
              Horas de Trabajo Realizadas
            </label>
            <input
              id="trabajoRealHoras"
              type="number"
              min="0"
              step="0.5"
              value={formData.trabajoRealHoras}
              onChange={(e) => setFormData({ ...formData, trabajoRealHoras: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total de horas trabajadas en el proyecto
            </p>
          </div>

          {/* Asignado a */}
          <div>
            <label htmlFor="asignadoA" className="block text-sm font-medium text-gray-700 mb-2">
              Asignado a (ID de usuario)
            </label>
            <input
              id="asignadoA"
              type="text"
              value={formData.asignadoA}
              onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="UUID del usuario"
            />
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              id="notas"
              rows={4}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Notas adicionales sobre el diagnóstico o proyecto..."
            />
          </div>

          {/* Botones */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            {/* Botón para crear orden - disponible desde cotizando */}
            {canCreateOrder && (
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                📋 Crear Orden desde Diagnóstico
              </button>
            )}

            {/* Botón para generar PDF - solo para proyectos completados */}
            {canGenerateOrder && (
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                📄 Generar Orden PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para generar orden PDF */}
      {showOrderModal && (
        <GenerateOrderPDF
          diagnostic={diagnostic}
          diagnosticResult={diagnosticResult}
          costoReal={formData.costoReal}
          trabajoRealHoras={formData.trabajoRealHoras}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      {/* Modal para crear orden desde diagnóstico */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Crear Orden desde Diagnóstico</h2>
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <CreateOrderFromDiagnostic
                diagnostic={diagnostic}
                onSuccess={() => {
                  setShowCreateOrderModal(false);
                  onUpdate();
                }}
                onCancel={() => setShowCreateOrderModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




