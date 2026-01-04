import { useEffect, useState } from 'react';
import { getDiagnostics, type DiagnosticData } from '../../utils/backendClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProyectosList() {
  const [proyectos, setProyectos] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProyectos();
  }, []);

  async function loadProyectos() {
    try {
      // Cargar solo proyectos aprobados (estado = 'proyecto')
      const response = await getDiagnostics(1, 1000, { estado: 'proyecto' });
      if (response.success) {
        setProyectos(response.data);
      }
    } catch (error) {
      console.error('Error loading proyectos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando proyectos...</p>
      </div>
    );
  }

  if (proyectos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600 text-lg">No hay proyectos activos</p>
        <a
          href="/admin/diagnosticos?estado=nuevo"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-800"
        >
          Ver diagnósticos pendientes →
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto) => (
        <a
          key={proyecto.id}
          href={`/admin/diagnosticos/${proyecto.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 block"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {proyecto.empresa || proyecto.nombre || 'Sin nombre'}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(proyecto.created_at), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {proyecto.estado}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Solución:</span> {proyecto.solucion_principal}
            </p>
            {proyecto.costo_real && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Costo Real:</span> ${proyecto.costo_real.toLocaleString()}
              </p>
            )}
            {proyecto.trabajo_real_horas && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Horas:</span> {proyecto.trabajo_real_horas}h
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}


