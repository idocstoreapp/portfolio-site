'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Diagnostic } from '@/lib/api';

interface DiagnosticCardProps {
  diagnostic: Diagnostic;
  onUpdate?: () => void;
}

const statusColors = {
  nuevo: 'bg-blue-100 text-blue-800',
  contactado: 'bg-yellow-100 text-yellow-800',
  cotizando: 'bg-purple-100 text-purple-800',
  proyecto: 'bg-green-100 text-green-800',
  cerrado: 'bg-gray-100 text-gray-800',
};

const urgencyColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800',
};

export default function DiagnosticCard({ diagnostic }: DiagnosticCardProps) {
  const statusColor = statusColors[diagnostic.estado] || statusColors.nuevo;
  const urgencyColor = urgencyColors[diagnostic.urgencia] || urgencyColors.medium;

  return (
    <Link href={`/diagnosticos/${diagnostic.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {diagnostic.empresa || diagnostic.nombre || 'Sin nombre'}
            </h3>
            <p className="text-sm text-gray-500">
              {format(new Date(diagnostic.created_at), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {diagnostic.estado}
          </span>
        </div>

        {/* Información del cliente */}
        <div className="space-y-2 mb-4">
          {diagnostic.nombre && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Cliente:</span> {diagnostic.nombre}
            </p>
          )}
          {diagnostic.email && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {diagnostic.email}
            </p>
          )}
          {diagnostic.telefono && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Teléfono:</span> {diagnostic.telefono}
            </p>
          )}
        </div>

        {/* Información del diagnóstico */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tipo:</span> {diagnostic.tipo_empresa}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Solución:</span> {diagnostic.solucion_principal}
          </p>
          {diagnostic.match_score && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Coincidencia:</span> {diagnostic.match_score}%
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColor}`}>
            {diagnostic.urgencia === 'high' ? '⚡ Alta' : 
             diagnostic.urgencia === 'medium' ? '📈 Media' : '✨ Baja'}
          </span>
          {diagnostic.costo_real && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
              💰 ${diagnostic.costo_real.toLocaleString()}
            </span>
          )}
          {diagnostic.trabajo_real_horas && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
              ⏱️ {diagnostic.trabajo_real_horas}h
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}




