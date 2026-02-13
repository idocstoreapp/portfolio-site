'use client';

import { Suspense } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import GarantiasContent from './GarantiasContent';

export default function GarantiasPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
            <GarantiasContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
