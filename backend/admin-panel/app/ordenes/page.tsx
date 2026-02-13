'use client';

import { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OrdenesContent from './OrdenesContent';
import Link from 'next/link';

export default function OrdenesPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Órdenes de Trabajo</h1>
                <p className="text-gray-600 mt-2">
                  Gestiona todas las órdenes de trabajo y contratos
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/ordenes/nueva"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Nueva Orden Manual
                </Link>
              </div>
            </div>

            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            }>
              <OrdenesContent />
            </Suspense>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
