'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('usuarios_admin')
          .select('nombre, email')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUser(data);
          });
      }
    });
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Sistema de Gestión de Diagnósticos
          </h2>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                {user.nombre?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


