import { useState, useEffect } from 'react';
import { getClients, type ClientData } from '../../utils/backendClient';

interface Props {
  onSuccess?: (data: any) => void;
  clienteIdInicial?: string;
}

export default function CreateMaintenanceOrder({ onSuccess, clienteIdInicial }: Props) {
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [clienteId, setClienteId] = useState(clienteIdInicial || '');
  const [relatedOrderId, setRelatedOrderId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('monthly');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMonths, setDurationMonths] = useState('6');
  const [hourlyBankTotal, setHourlyBankTotal] = useState('10');

  useEffect(() => {
    getClients(1, 100, { estado: 'activo' }).then(res => {
      if (res.success) setClientes(res.data);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate End Date manually
    let endDateStr = '';
    if (maintenanceType === 'monthly' && durationMonths) {
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + parseInt(durationMonths, 10));
      endDateStr = start.toISOString().split('T')[0];
    } else if (maintenanceType === 'hourly_bank') {
      const start = new Date(startDate);
      start.setFullYear(start.getFullYear() + 1); // Typical 1 year validity
      endDateStr = start.toISOString().split('T')[0];
    } else {
      endDateStr = startDate; // One time
    }

    const clienteSeleccionado = clientes.find(c => c.id === clienteId);

    const formData = {
      order_type: 'maintenance',
      cliente_id: clienteId,
      client_name: clienteSeleccionado?.nombre || 'Cliente',
      client_email: clienteSeleccionado?.email,
      client_company: clienteSeleccionado?.empresa,
      client_phone: clienteSeleccionado?.telefono,
      maintenance_type: maintenanceType,
      related_order_id: relatedOrderId || undefined,
      scope_description: description,
      base_price: parseFloat(price),
      total_price: parseFloat(price),
      maintenance_start_date: startDate,
      maintenance_end_date: endDateStr,
      hourly_bank_total: maintenanceType === 'hourly_bank' ? parseInt(hourlyBankTotal, 10) : undefined,
      project_type: 'combinado', // Default project type requirement
      status: 'draft',
    };

    if (onSuccess) {
      onSuccess(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Nueva Orden de Mantenimiento</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} {c.empresa ? `- ${c.empresa}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Mantenimiento</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer transition ${maintenanceType === 'monthly' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>
              <input type="radio" value="monthly" checked={maintenanceType === 'monthly'} onChange={() => setMaintenanceType('monthly')} className="sr-only" />
              <div className="text-center">
                <div className="font-medium">Mensual</div>
                <div className="text-xs mt-1">Pago recurrente</div>
              </div>
            </label>
            <label className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer transition ${maintenanceType === 'hourly_bank' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>
              <input type="radio" value="hourly_bank" checked={maintenanceType === 'hourly_bank'} onChange={() => setMaintenanceType('hourly_bank')} className="sr-only" />
              <div className="text-center">
                <div className="font-medium">Bolsa de Horas</div>
                <div className="text-xs mt-1">Por consumo</div>
              </div>
            </label>
            <label className={`border rounded-lg p-3 flex items-center justify-center cursor-pointer transition ${maintenanceType === 'one_time' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white hover:bg-gray-50'}`}>
              <input type="radio" value="one_time" checked={maintenanceType === 'one_time'} onChange={() => setMaintenanceType('one_time')} className="sr-only" />
              <div className="text-center">
                <div className="font-medium">Puntual</div>
                <div className="text-xs mt-1">Una sola vez</div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Trabajo *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Ej: Actualizaciones de seguridad, backups, soporte técnico..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Costo ({maintenanceType === 'monthly' ? 'Por Mes' : 'Total'}) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {maintenanceType === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Meses) *</label>
            <input
              type="number"
              required
              min="1"
              value={durationMonths}
              onChange={e => setDurationMonths(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {maintenanceType === 'hourly_bank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Horas Contratadas *</label>
            <input
              type="number"
              required
              min="1"
              value={hourlyBankTotal}
              onChange={e => setHourlyBankTotal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}
