'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DiagnosticForm from '@/components/diagnosticos/DiagnosticForm';
import { getDiagnostic, getDiagnosticResult } from '@/lib/api';
import type { Diagnostic } from '@/lib/api';
import Link from 'next/link';

export default function DiagnosticDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadDiagnostic();
    }
  }, [id]);

  async function loadDiagnostic() {
    try {
      setLoading(true);
      const [diagnosticResponse, resultResponse] = await Promise.all([
        getDiagnostic(id),
        getDiagnosticResult(id).catch(() => null),
      ]);

      if (diagnosticResponse.success) {
        setDiagnostic(diagnosticResponse.data);
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

  async function handleUpdate() {
    await loadDiagnostic();
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <Link
                href="/diagnosticos"
                className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
              >
                ← Volver a diagnósticos
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Detalle del Diagnóstico</h1>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando diagnóstico...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : diagnostic ? (
              <div className="space-y-6">
                <DiagnosticForm
                  diagnostic={diagnostic}
                  diagnosticResult={diagnosticResult}
                  onUpdate={handleUpdate}
                />
                
                {/* Control de Costos Reales (solo para proyectos) */}
                {(diagnostic.estado === 'proyecto' || diagnostic.estado === 'cerrado') && (
                  <CostosReales
                    diagnostic={diagnostic}
                    onUpdate={handleUpdate}
                  />
                )}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

