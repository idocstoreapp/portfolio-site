'use client';

interface DiagnosticFiltersProps {
  filters: {
    estado?: string;
    tipoEmpresa?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export default function DiagnosticFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: DiagnosticFiltersProps) {
  const estados = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'cotizando', label: 'Cotizando' },
    { value: 'proyecto', label: 'Proyecto' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  const tiposEmpresa = [
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'servicio-tecnico', label: 'Servicio Técnico' },
    { value: 'fabrica', label: 'Fábrica' },
    { value: 'comercio', label: 'Comercio' },
    { value: 'otro', label: 'Otro' },
  ];

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
            placeholder="Nombre, email, empresa..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="estado"
            value={filters.estado || ''}
            onChange={(e) => onFiltersChange({ ...filters, estado: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Todos</option>
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Empresa */}
        <div>
          <label htmlFor="tipoEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Empresa
          </label>
          <select
            id="tipoEmpresa"
            value={filters.tipoEmpresa || ''}
            onChange={(e) => onFiltersChange({ ...filters, tipoEmpresa: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Todos</option>
            {tiposEmpresa.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

