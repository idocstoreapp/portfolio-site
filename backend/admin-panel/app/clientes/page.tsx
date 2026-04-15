'use client';

import { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ClientesContent from './ClientesContent';

export default function ClientesPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600 mt-2">
                Gestiona tu cartera de clientes y su historial
              </p>
            </div>

            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            }>
              <ClientesContent />
            </Suspense>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
