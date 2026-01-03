import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../utils/adminSupabase';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: any;
    let timeoutId: any;

    // Timeout de seguridad: si después de 5 segundos no se ha resuelto, redirigir
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[AdminGuard] Timeout: redirecting to login after 5 seconds');
        setLoading(false);
        window.location.replace('/admin/login');
      }
    }, 5000);

    async function checkAdminStatus(supabase: any, userId: string): Promise<boolean> {
      try {
        const { data: adminUser, error: adminError } = await supabase
          .from('usuarios_admin')
          .select('*')
          .eq('id', userId)
          .eq('activo', true)
          .single();

        if (adminError) {
          console.error('[AdminGuard] Error checking admin status:', adminError);
          return false;
        }

        return !!adminUser;
      } catch (error) {
        console.error('[AdminGuard] Error in checkAdminStatus:', error);
        return false;
      }
    }

    async function setupAuth() {
      try {
        console.log('[AdminGuard] Setting up auth...');
        const supabase = await getSupabaseClient();
        
        // Verificar sesión inicial PRIMERO (más rápido)
        console.log('[AdminGuard] Checking initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AdminGuard] Error getting session:', sessionError);
          clearTimeout(timeoutId);
          if (mounted) {
            setLoading(false);
            window.location.replace('/admin/login');
          }
          return;
        }
        
        if (session?.user) {
          console.log('[AdminGuard] Session found, checking admin status...');
          const isAdmin = await checkAdminStatus(supabase, session.user.id);
          clearTimeout(timeoutId);
          if (isAdmin && mounted) {
            console.log('[AdminGuard] User is admin, setting authenticated');
            setAuthenticated(true);
            setLoading(false);
            return; // Salir temprano si ya está autenticado
          } else if (mounted) {
            console.log('[AdminGuard] User is not admin, redirecting to login');
            setLoading(false);
            window.location.replace('/admin/login');
            return;
          }
        } else {
          clearTimeout(timeoutId);
          if (mounted) {
            console.log('[AdminGuard] No session found, redirecting to login');
            setLoading(false);
            window.location.replace('/admin/login');
            return;
          }
        }
        
        // Configurar listener de cambios de autenticación (solo si no hay sesión inicial)
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            console.log('[AdminGuard] Auth state changed:', event);

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
              if (newSession?.user) {
                clearTimeout(timeoutId);
                const isAdmin = await checkAdminStatus(supabase, newSession.user.id);
                if (isAdmin && mounted) {
                  console.log('[AdminGuard] User is admin, setting authenticated');
                  setAuthenticated(true);
                  setLoading(false);
                } else if (mounted) {
                  console.log('[AdminGuard] User is not admin, redirecting to login');
                  setLoading(false);
                  window.location.replace('/admin/login');
                }
              } else if (mounted) {
                clearTimeout(timeoutId);
                console.log('[AdminGuard] No session, redirecting to login');
                setLoading(false);
                window.location.replace('/admin/login');
              }
            } else if (event === 'SIGNED_OUT' && mounted) {
              clearTimeout(timeoutId);
              console.log('[AdminGuard] User signed out, redirecting to login');
              setAuthenticated(false);
              setLoading(false);
              window.location.replace('/admin/login');
            }
          }
        );
        subscription = sub;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[AdminGuard] Error setting up auth:', error);
        if (mounted) {
          setLoading(false);
          window.location.replace('/admin/login');
        }
      }
    }

    setupAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

