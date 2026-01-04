import { useState, useEffect } from 'react';
import { getDiagnostic, getDiagnosticResult, updateDiagnostic, type DiagnosticData } from '../../utils/backendClient';
import { getSupabaseClient } from '../../utils/adminSupabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import GenerateOrderPDF from './GenerateOrderPDF';

interface DiagnosticDetailProps {
  diagnosticId: string;
}

export default function DiagnosticDetail({ diagnosticId }: DiagnosticDetailProps) {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: '',
    asignadoA: '',
    notas: '',
    costoReal: 0,
    trabajoRealHoras: 0,
  });
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadDiagnostic();
    loadCurrentUser();
  }, [diagnosticId]);

  async function loadCurrentUser() {
    try {
      const supabase = await getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function loadDiagnostic() {
    try {
      setLoading(true);
      const [diagnosticResponse, resultResponse] = await Promise.all([
        getDiagnostic(diagnosticId),
        getDiagnosticResult(diagnosticId).catch(() => null),
      ]);

      if (diagnosticResponse.success) {
        const diag = diagnosticResponse.data;
        setDiagnostic(diag);
        setFormData({
          status: diag.estado,
          asignadoA: diag.asignado_a || '',
          notas: diag.notas || '',
          costoReal: diag.costo_real || 0,
          trabajoRealHoras: diag.trabajo_real_horas || 0,
        });
      } else {
        setError('No se pudo cargar el diagnóstico');
      }

      if (resultResponse?.success) {
        setDiagnosticResult(resultResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar el diagnóstico');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!currentUser) {
      alert('Error: No se pudo obtener el usuario actual');
      return;
    }

    setSaving(true);
    try {
      await updateDiagnostic(diagnosticId, {
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
      await loadDiagnostic();
    } catch (error: any) {
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando diagnóstico...</p>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'No se pudo cargar el diagnóstico'}
      </div>
    );
  }

  const canGenerateOrder = formData.status === 'proyecto' || formData.status === 'cerrado';

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
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
      {showOrderModal && diagnostic && (
        <GenerateOrderPDF
          diagnostic={diagnostic}
          diagnosticResult={diagnosticResult}
          costoReal={formData.costoReal}
          trabajoRealHoras={formData.trabajoRealHoras}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}


