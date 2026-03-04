'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LeadsListPage from '@/src/views/leads/LeadsListPage';

export default function LeadsListRoute() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <LeadsListPage />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
