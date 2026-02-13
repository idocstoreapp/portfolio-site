'use client';

import type { OrderStatus, ProjectType } from '@/types/order';

interface OrderFiltersProps {
  filters: {
    status?: OrderStatus | string;
    projectType?: ProjectType | string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'accepted', label: 'Aceptada' },
  { value: 'in_development', label: 'En Desarrollo' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const projectTypeOptions = [
  { value: 'web', label: 'Sitio Web' },
  { value: 'sistema', label: 'Sistema' },
  { value: 'app', label: 'Aplicación' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'otro', label: 'Otro' },
];

export default function OrderFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: OrderFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            id="search"
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            placeholder="Número de orden, cliente, empresa..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="status"
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Todos</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Proyecto */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Proyecto
          </label>
          <select
            id="projectType"
            value={filters.projectType || ''}
            onChange={(e) => onFiltersChange({ ...filters, projectType: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Todos</option>
            {projectTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
