'use client';

import { useEffect, useState } from 'react';
import { getClients } from '@/lib/api';
import type { Client } from '@/types/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default function ClientesList() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadClientes();
  }, [page, estado]);

  async function loadClientes() {
    try {
      setLoading(true);
      const res = await getClients(page, 20, {
        search: search || undefined,
        estado: estado || undefined,
      });
      if (res.success) {
        setClientes(res.data);
        setTotal(res.total);
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadClientes();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu cartera de clientes, leads y su historial</p>
        </div>
        <Link 
          href="/ordenes/nueva" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
        >
          <span>+</span> Nuevo Cliente
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="lead">Leads (Prospectos)</option>
            <option value="activo">Clientes Activos</option>
            <option value="inactivo">Clientes Inactivos</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-300"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron clientes</h3>
            <p className="text-gray-500">Ajusta tus filtros de búsqueda o crea un nuevo cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Empresa</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Métricas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                          {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{cliente.nombre || 'Sin nombre'}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <span>🏢</span> {cliente.empresa || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <span>✉️</span> {cliente.email || 'Sin email'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span>📱</span> {cliente.telefono || 'Sin teléfono'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        cliente.estado === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 
                        cliente.estado === 'lead' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {cliente.estado === 'activo' ? '● Activo' : 
                         cliente.estado === 'lead' ? '○ Lead' : 
                         '○ Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        📋 {cliente.total_orders || 0} proyectos
                      </div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        💰 ${(cliente.total_spent || 0).toLocaleString()} USD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(cliente.created_at), "d MMM, yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/clientes/${cliente.id}`} 
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100 transition"
                      >
                        Ver detalle <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && total > 20 && (
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium text-gray-900">{(page - 1) * 20 + 1}</span> a <span className="font-medium text-gray-900">{Math.min(page * 20, total)}</span> de <span className="font-medium text-gray-900">{total}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
