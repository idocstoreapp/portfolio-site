'use client';

import { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ClientDetailContent from './ClientDetailContent';

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
              </div>
            }>
              <ClientDetailContent clientId={params.id} />
            </Suspense>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
