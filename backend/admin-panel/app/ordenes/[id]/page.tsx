'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getOrder } from '@/lib/api';
import type { Order } from '@/types/order';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import OrderForm from '@/components/ordenes/OrderForm';
import EditOrderForm from '@/components/ordenes/EditOrderForm';
import GenerateContractPDF from '@/components/ordenes/GenerateContractPDF';
import ChangeOrderForm from '@/components/ordenes/ChangeOrderForm';
import ChangeOrdersList from '@/components/ordenes/ChangeOrdersList';
import ModulesDisplay from '@/components/ordenes/ModulesDisplay';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showChangeOrderForm, setShowChangeOrderForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      const response = await getOrder(id);

      if (response.success) {
        setOrder(response.data);
      } else {
        setError('No se pudo cargar la orden');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    in_development: 'En Desarrollo',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  const projectTypeLabels: Record<string, string> = {
    web: 'Sitio Web',
    sistema: 'Sistema',
    app: 'Aplicación',
    marketing: 'Marketing',
    otro: 'Otro',
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="mb-6">
              <Link
                href="/ordenes"
                className="text-gray-600 hover:text-gray-900 mb-4 inline-block"
              >
                ← Volver a órdenes
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Detalle de la Orden</h1>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando orden...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : order ? (
              <div className="space-y-6">
                {/* Edición Completa de la Orden */}
                <EditOrderForm
                  order={order}
                  onUpdate={loadOrder}
                />

                {/* Órdenes de Cambio */}
                <ChangeOrdersList
                  orderId={order.id}
                  onUpdate={loadOrder}
                />

                {/* Botón para crear Change Order */}
                {order.status !== 'draft' && !(order as any).scope_frozen && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <button
                      onClick={() => setShowChangeOrderForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      + Crear Orden de Cambio
                    </button>
                  </div>
                )}

                {showChangeOrderForm && (
                  <ChangeOrderForm
                    order={order}
                    onClose={() => setShowChangeOrderForm(false)}
                    onSuccess={loadOrder}
                  />
                )}

                {/* Información General */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Información General</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Número de Orden</h3>
                      <p className="text-lg font-semibold text-gray-900">{order.order_number}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Estado</h3>
                      <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Tipo de Proyecto</h3>
                      <p className="text-gray-900">{projectTypeLabels[order.project_type] || order.project_type}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Fecha de Creación</h3>
                      <p className="text-gray-900">
                        {format(new Date(order.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cliente</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Nombre</h3>
                      <p className="text-gray-900">{order.client_name}</p>
                    </div>

                    {order.client_company && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Empresa</h3>
                        <p className="text-gray-900">{order.client_company}</p>
                      </div>
                    )}

                    {order.client_email && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
                        <p className="text-gray-900">{order.client_email}</p>
                      </div>
                    )}

                    {order.client_phone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Teléfono</h3>
                        <p className="text-gray-900">{order.client_phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alcance del Proyecto */}
                {order.scope_description && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Alcance del Proyecto</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{order.scope_description}</p>
                  </div>
                )}

                {/* Módulos */}
                {order.included_modules && order.included_modules.length > 0 && (
                  <ModulesDisplay 
                    moduleIds={order.included_modules} 
                    title="Módulos Incluidos"
                    variant="included"
                  />
                )}

                {/* Módulos Excluidos */}
                {order.excluded_modules && order.excluded_modules.length > 0 && (
                  <ModulesDisplay 
                    moduleIds={order.excluded_modules} 
                    title="Módulos Excluidos"
                    variant="excluded"
                  />
                )}

                {/* Aspectos Económicos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Aspectos Económicos</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio Base:</span>
                      <span className="font-medium">${order.base_price.toLocaleString()} {order.currency || 'CLP'}</span>
                    </div>
                    {order.modules_price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Módulos Adicionales:</span>
                        <span className="font-medium">${order.modules_price.toLocaleString()} {order.currency || 'CLP'}</span>
                      </div>
                    )}
                    {order.custom_adjustments !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ajustes Personalizados:</span>
                        <span className="font-medium">${order.custom_adjustments.toLocaleString()} {order.currency || 'CLP'}</span>
                      </div>
                    )}
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Descuento:</span>
                        <span>-${order.discount_amount.toLocaleString()} {order.currency || 'CLP'}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-gray-900">${order.total_price.toLocaleString()} {order.currency || 'CLP'}</span>
                    </div>
                  </div>
                </div>

                {/* Generar Contrato PDF */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Documentos</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowPDFModal(true)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      📄 Generar Contrato PDF
                    </button>
                    {order.contract_pdf_url && (
                      <a
                        href={order.contract_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 ml-4"
                      >
                        📄 Ver Contrato PDF Generado
                      </a>
                    )}
                    {order.manual_pdf_url && (
                      <a
                        href={order.manual_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 ml-4"
                      >
                        📖 Manual de Usuario PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Notas */}
                {(order.internal_notes || order.client_notes) && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notas</h2>
                    {order.internal_notes && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Notas Internas</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{order.internal_notes}</p>
                      </div>
                    )}
                    {order.client_notes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Notas para el Cliente</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{order.client_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* Modal para generar PDF */}
            {showPDFModal && order && (
              <GenerateContractPDF
                order={order}
                onClose={() => setShowPDFModal(false)}
                onSuccess={() => {
                  // Recargar la orden para ver si se guardó la URL del PDF
                  loadOrder();
                }}
              />
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
