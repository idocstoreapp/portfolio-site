import { useState, useEffect } from 'react';
import { getDiagnostics, type DiagnosticData } from '../../utils/backendClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DiagnosticosList() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    estado: undefined as string | undefined,
    tipoEmpresa: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  const limit = 20;

  useEffect(() => {
    // Leer filtros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const estadoParam = urlParams.get('estado');
    if (estadoParam) {
      setFilters(prev => ({ ...prev, estado: estadoParam }));
    }
  }, []);

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

  const statusColors: Record<string, string> = {
    nuevo: 'bg-blue-100 text-blue-800',
    contactado: 'bg-yellow-100 text-yellow-800',
    cotizando: 'bg-purple-100 text-purple-800',
    proyecto: 'bg-green-100 text-green-800',
    cerrado: 'bg-gray-100 text-gray-800',
  };

  const urgencyColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={() => {
              setFilters({ estado: undefined, tipoEmpresa: undefined, search: undefined });
              setPage(1);
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              id="search"
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              placeholder="Nombre, email, empresa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="estado"
              value={filters.estado || ''}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="nuevo">Nuevo</option>
              <option value="contactado">Contactado</option>
              <option value="cotizando">Cotizando</option>
              <option value="proyecto">Proyecto</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipoEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Empresa
            </label>
            <select
              id="tipoEmpresa"
              value={filters.tipoEmpresa || ''}
              onChange={(e) => setFilters({ ...filters, tipoEmpresa: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="restaurante">Restaurante</option>
              <option value="servicio-tecnico">Servicio Técnico</option>
              <option value="fabrica">Fábrica</option>
              <option value="comercio">Comercio</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

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
              <a
                key={diagnostic.id}
                href={`/admin/diagnosticos/${diagnostic.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {diagnostic.empresa || diagnostic.nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(diagnostic.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[diagnostic.estado] || statusColors.nuevo}`}>
                    {diagnostic.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {diagnostic.nombre && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Cliente:</span> {diagnostic.nombre}
                    </p>
                  )}
                  {diagnostic.email && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {diagnostic.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo:</span> {diagnostic.tipo_empresa}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Solución:</span> {diagnostic.solucion_principal}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[diagnostic.urgencia] || urgencyColors.medium}`}>
                    {diagnostic.urgencia === 'high' ? '⚡ Alta' : 
                     diagnostic.urgencia === 'medium' ? '📈 Media' : '✨ Baja'}
                  </span>
                  {diagnostic.costo_real && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      💰 ${diagnostic.costo_real.toLocaleString()}
                    </span>
                  )}
                  {diagnostic.trabajo_real_horas && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                      ⏱️ {diagnostic.trabajo_real_horas}h
                    </span>
                  )}
                </div>
              </a>
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




