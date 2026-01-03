import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../utils/adminSupabase';

interface AdminSidebarProps {
  currentPath: string;
}

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const supabase = await getSupabaseClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: adminUser } = await supabase
          .from('usuarios_admin')
          .select('nombre, email')
          .eq('id', authUser.id)
          .single();
        
        if (adminUser) {
          setUser(adminUser);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async function handleLogout() {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/diagnosticos', label: 'Diagnósticos', icon: '🔍' },
    { href: '/admin/proyectos', label: 'Proyectos', icon: '📁' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-8">Panel Admin</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
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
              </a>
            );
          })}
        </nav>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {user && (
          <div className="mb-4 pb-4 border-b border-gray-700">
            <p className="text-sm font-medium text-white">{user.nombre}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        )}
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

