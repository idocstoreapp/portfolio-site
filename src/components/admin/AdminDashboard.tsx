import { useEffect, useState } from 'react';
import { getDiagnostics } from '../../utils/backendClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    nuevos: 0,
    enProyecto: 0,
    cerrados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Cargar todos los diagnósticos para calcular estadísticas
      const response = await getDiagnostics(1, 1000);
      if (response.success && response.data) {
        const diagnostics = response.data;
        setStats({
          total: diagnostics.length,
          nuevos: diagnostics.filter((d: any) => d.estado === 'nuevo').length,
          enProyecto: diagnostics.filter((d: any) => d.estado === 'proyecto').length,
          cerrados: diagnostics.filter((d: any) => d.estado === 'cerrado').length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Sistema de Gestión de Diagnósticos
          </h2>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Resumen general del sistema de diagnósticos
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
          </div>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Diagnósticos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nuevos</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.nuevos}</p>
                  </div>
                  <div className="text-4xl">🆕</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Proyecto</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.enProyecto}</p>
                  </div>
                  <div className="text-4xl">🚀</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cerrados</p>
                    <p className="text-3xl font-bold text-gray-600 mt-2">{stats.cerrados}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/admin/diagnosticos"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl">🔍</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ver Diagnósticos</h3>
                    <p className="text-sm text-gray-600">Gestionar todos los diagnósticos</p>
                  </div>
                </a>

                <a
                  href="/admin/diagnosticos?estado=nuevo"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl">🆕</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nuevos Diagnósticos</h3>
                    <p className="text-sm text-gray-600">Revisar diagnósticos pendientes</p>
                  </div>
                </a>

                <a
                  href="/admin/proyectos"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-3xl">📁</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Proyectos Activos</h3>
                    <p className="text-sm text-gray-600">Gestionar proyectos en curso</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}




