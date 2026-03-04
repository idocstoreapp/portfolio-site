'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getDiagnostics } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
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
      if (response.success) {
        const diagnostics = response.data;
        setStats({
          total: diagnostics.length,
          nuevos: diagnostics.filter(d => d.estado === 'nuevo').length,
          enProyecto: diagnostics.filter(d => d.estado === 'proyecto').length,
          cerrados: diagnostics.filter(d => d.estado === 'cerrado').length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Resumen del flujo: leads → diagnóstico → propuesta → orden de trabajo
              </p>
            </div>

            <div className="mb-8 rounded-xl border-2 border-gray-900 bg-gray-900 p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Siguiente paso</h2>
              <p className="text-gray-300 mb-4">
                1. Buscar leads · 2. Diagnosticar · 3. Enviar propuesta · 4. Crear orden de trabajo
              </p>
              <Link
                href="/leads-list"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
              >
                Ir al embudo de leads
              </Link>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/leads-list"
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-3xl">👥</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Embudo de leads</h3>
                        <p className="text-sm text-gray-600">Diagnóstico, propuesta y orden por lead</p>
                      </div>
                    </Link>

                    <Link
                      href="/diagnosticos"
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-3xl">🔍</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Diagnósticos</h3>
                        <p className="text-sm text-gray-600">Ver y gestionar diagnósticos</p>
                      </div>
                    </Link>

                    <Link
                      href="/ordenes"
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-3xl">📋</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Órdenes de trabajo</h3>
                        <p className="text-sm text-gray-600">Ver y gestionar órdenes</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
