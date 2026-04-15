import { useEffect, useState } from 'react';
import { 
  getClient, 
  getClientMetrics, 
  getClientOrders, 
  getClientNotes,
  updateClient,
  type ClientData,
} from '../../utils/backendClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  clienteId: string;
}

export default function ClienteDetail({ clienteId }: Props) {
  const [cliente, setCliente] = useState<ClientData | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [savingDesc, setSavingDesc] = useState(false);

  useEffect(() => {
    loadData();
  }, [clienteId]);

  async function loadData() {
    try {
      setLoading(true);
      const [cliRes, metRes, ordRes, notRes] = await Promise.all([
        getClient(clienteId).catch(() => ({ success: false, data: null })),
        getClientMetrics(clienteId).catch(() => ({ success: false, data: null })),
        getClientOrders(clienteId).catch(() => ({ success: false, data: [] })),
        getClientNotes(clienteId).catch(() => ({ success: false, data: [] }))
      ]);

      if (cliRes.success && cliRes.data) {
        setCliente(cliRes.data);
        setEditForm({
          nombre: cliRes.data.nombre,
          empresa: cliRes.data.empresa,
          email: cliRes.data.email,
          telefono: cliRes.data.telefono,
          estado: cliRes.data.estado,
        });
      }
      if (metRes.success) setMetrics(metRes.data);
      if (ordRes.success) setOrders(ordRes.data || []);
      if (notRes.success) setNotes(notRes.data || []);

    } catch (error) {
      console.error('Error loading client details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSavingDesc(true);
      const res = await updateClient(clienteId, editForm);
      if (res.success) {
        setCliente(res.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating client', error);
      alert('Error updating client');
    } finally {
      setSavingDesc(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-gray-800">Cliente no encontrado</h2>
        <a href="/admin/clientes" className="mt-4 inline-block text-indigo-600 hover:underline">Volver a la lista</a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/admin/clientes" className="text-gray-500 hover:text-gray-900 transition">
            ← Volver
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Perfil del Cliente</h1>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 transition"
            >
              Editar Info
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-medium text-gray-700 transition"
            >
              Cancelar
            </button>
          )}
          <a
            href={`/admin/ordenes/nueva?cliente=${cliente.id}`}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 font-medium text-white transition flex items-center gap-2"
          >
            <span>+</span> Nueva Orden
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-2xl text-indigo-700 font-bold border border-indigo-200 shadow-sm">
                  {cliente.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{cliente.nombre}</h2>
                  <p className="text-gray-500">{cliente.empresa || 'Sin empresa'}</p>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={editForm.nombre || ''}
                      onChange={e => setEditForm({...editForm, nombre: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input 
                      type="text" 
                      value={editForm.empresa || ''}
                      onChange={e => setEditForm({...editForm, empresa: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editForm.email || ''}
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={editForm.telefono || ''}
                      onChange={e => setEditForm({...editForm, telefono: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                      value={editForm.estado || 'lead'}
                      onChange={e => setEditForm({...editForm, estado: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="lead">Lead</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={savingDesc}
                    className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 disabled:opacity-70"
                  >
                    {savingDesc ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">Estado</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                      cliente.estado === 'lead' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.estado.toUpperCase()}
                    </span>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm block mb-1">Email</span>
                    <span className="text-gray-900">{cliente.email || '-'}</span>
                  </div>
                  <div className="py-2 border-b border-gray-100">
                    <span className="text-gray-500 text-sm block mb-1">Teléfono</span>
                    <span className="text-gray-900">{cliente.telefono || '-'}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-gray-500 text-sm block mb-1">Registrado el</span>
                    <span className="text-gray-900">{format(new Date(cliente.created_at), "d MMMM yyyy", { locale: es })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card: Metrics Summary */}
          {metrics && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Resumen Financiero</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Total Invertido</span>
                  <span className="text-2xl font-bold text-green-600">${(metrics.total_invertido || 0).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-gray-500 text-xs block uppercase tracking-wider mb-1">Proyectos</span>
                  <span className="text-2xl font-bold text-indigo-600">{metrics.proyectos_totales || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Timeline & Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Historial de Órdenes y Proyectos</h3>
              <span className="bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-xs font-semibold">{orders.length} órdenes</span>
            </div>
            
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  El cliente no tiene órdenes aún.
                  <div className="mt-4">
                    <a href={`/admin/ordenes/nueva?cliente=${cliente.id}`} className="text-indigo-600 font-medium hover:underline">Crear su primera orden</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg hover:border-indigo-100 hover:shadow-sm transition">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm ${
                          order.order_type === 'maintenance' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {order.order_type === 'maintenance' ? '🔄' : '🚀'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <a href={order.order_type === 'maintenance' ? `/admin/ordenes/mantenimientos` : `/admin/diagnosticos/${order.id}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600">
                            {order.project_name || `Orden #${order.id.slice(0,8)}`}
                          </a>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status || 'draft'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{order.project_description || 'Sin descripción'}</p>
                        <div className="flex gap-4 text-xs font-medium text-gray-500">
                          <span>📅 {format(new Date(order.created_at), "d MMM yyyy")}</span>
                          {order.total_price && <span className="text-green-600">💰 ${parseFloat(order.total_price).toLocaleString()}</span>}
                          {order.order_type === 'maintenance' && <span>🔄 Mantenimiento</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
