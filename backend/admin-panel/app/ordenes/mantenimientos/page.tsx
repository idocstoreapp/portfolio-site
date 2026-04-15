import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MantenimientosList from '@/components/ordenes/MantenimientosList';

export default function MantenimientosPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <MantenimientosList />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
