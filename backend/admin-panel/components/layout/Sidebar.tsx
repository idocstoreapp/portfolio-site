'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const flujoItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/leads', label: 'Lead Scraper (Buscar negocios)', icon: '🔎' },
    { href: '/leads-list', label: 'Leads (Embudo)', icon: '👥' },
    { href: '/diagnosticos', label: 'Diagnósticos', icon: '🔍' },
    { href: '/clientes', label: 'Clientes', icon: '👤' },
    { href: '/ordenes', label: 'Órdenes de trabajo', icon: '📋' },
    { href: '/ordenes/mantenimientos', label: 'Mantenimientos', icon: '🔄' },
  ];
  const herramientasItems = [
    { href: '/plantillas-propuesta', label: 'Plantillas PDF', icon: '📄' },
    { href: '/templates-modulos', label: 'Templates y módulos', icon: '📦' },
    { href: '/precios', label: 'Precios', icon: '💰' },
    { href: '/garantias', label: 'Garantías', icon: '🛡️' },
    { href: '/proyectos', label: 'Proyectos', icon: '📁' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6">Panel Admin</h1>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Flujo principal</p>
        <nav className="space-y-2 mb-6">
          {flujoItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Herramientas</p>
        <nav className="space-y-2">
          {herramientasItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
