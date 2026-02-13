'use client';

import { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CreateOrderForm from '@/components/ordenes/CreateOrderForm';
import Link from 'next/link';

export default function NuevaOrdenPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <Link
                href="/ordenes"
                className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
              >
                ← Volver a órdenes
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Trabajo</h1>
              <p className="text-gray-600 mt-2">
                Crea una nueva orden de trabajo manualmente
              </p>
            </div>

            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando formulario...</p>
              </div>
            }>
              <CreateOrderForm />
            </Suspense>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
