'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Order, OrderStatus, ProjectType } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onUpdate?: () => void;
}

const statusColors: Record<OrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-yellow-100 text-yellow-800',
  in_development: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  in_development: 'En Desarrollo',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const projectTypeLabels: Record<ProjectType, string> = {
  web: 'Sitio Web',
  sistema: 'Sistema',
  app: 'Aplicación',
  marketing: 'Marketing',
  otro: 'Otro',
};

export default function OrderCard({ order }: OrderCardProps) {
  const statusColor = statusColors[order.status] || statusColors.draft;
  const statusLabel = statusLabels[order.status] || order.status;

  return (
    <Link href={`/ordenes/${order.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {order.order_number}
            </h3>
            <p className="text-sm text-gray-500">
              {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Información del cliente */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cliente:</span> {order.client_name}
          </p>
          {order.client_company && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Empresa:</span> {order.client_company}
            </p>
          )}
          {order.client_email && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {order.client_email}
            </p>
          )}
          {order.client_phone && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Teléfono:</span> {order.client_phone}
            </p>
          )}
        </div>

        {/* Información del proyecto */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tipo:</span> {projectTypeLabels[order.project_type] || order.project_type}
          </p>
          {order.scope_description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              <span className="font-medium">Alcance:</span> {order.scope_description}
            </p>
          )}
          {order.diagnostico_id && (
            <p className="text-xs text-gray-500">
              📋 Vinculado a diagnóstico
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
            💰 ${order.total_price.toLocaleString()} {order.currency || 'CLP'}
          </span>
          {order.included_modules && order.included_modules.length > 0 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
              📦 {order.included_modules.length} módulos
            </span>
          )}
          {order.contract_pdf_url && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              📄 Contrato
            </span>
          )}
          {order.manual_pdf_url && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              📖 Manual
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
