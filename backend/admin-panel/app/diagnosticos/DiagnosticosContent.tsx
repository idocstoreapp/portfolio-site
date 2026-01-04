'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DiagnosticList from '@/components/diagnosticos/DiagnosticList';
import { getDiagnostics } from '@/lib/api';

export default function DiagnosticosContent() {
  const searchParams = useSearchParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [searchParams]);

  async function loadInitialData() {
    try {
      const estado = searchParams.get('estado') || undefined;
      const response = await getDiagnostics(1, 20, { estado });
      if (response.success) {
        setInitialData({
          diagnostics: response.data,
          total: response.total,
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando diagnósticos...</p>
      </div>
    );
  }

  return (
    <DiagnosticList
      initialDiagnostics={initialData?.diagnostics || []}
      initialTotal={initialData?.total || 0}
    />
  );
}


