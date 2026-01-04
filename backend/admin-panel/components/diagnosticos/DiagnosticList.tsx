'use client';

import { useState, useEffect } from 'react';
import { getDiagnostics, type Diagnostic } from '@/lib/api';
import DiagnosticCard from './DiagnosticCard';
import DiagnosticFilters from './DiagnosticFilters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DiagnosticListProps {
  initialDiagnostics?: Diagnostic[];
  initialTotal?: number;
}

export default function DiagnosticList({ 
  initialDiagnostics = [],
  initialTotal = 0 
}: DiagnosticListProps) {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>(initialDiagnostics);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState({
    estado: undefined as string | undefined,
    tipoEmpresa: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  const limit = 20;

  useEffect(() => {
    loadDiagnostics();
  }, [page, filters]);

  async function loadDiagnostics() {
    setLoading(true);
    try {
      const response = await getDiagnostics(page, limit, filters);
      if (response.success) {
        setDiagnostics(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <DiagnosticFilters 
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => {
          setFilters({ estado: undefined, tipoEmpresa: undefined, search: undefined });
          setPage(1);
        }}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando diagnósticos...</p>
        </div>
      ) : diagnostics.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No se encontraron diagnósticos</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {diagnostics.map((diagnostic) => (
              <DiagnosticCard 
                key={diagnostic.id} 
                diagnostic={diagnostic}
                onUpdate={loadDiagnostics}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} diagnósticos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


