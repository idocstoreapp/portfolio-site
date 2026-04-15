import { useState, useEffect } from 'react';
import { 
  getClients, 
  getTemplates, 
  getTemplateWithModules,
  createOrder,
  createClient,
  type ClientData 
} from '../../utils/backendClient';

export default function CreateOrderWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Data
  const [clientes, setClientes] = useState<ClientData[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Step 1: Client & Type
  const [clienteType, setClienteType] = useState('existing'); // 'existing' | 'new'
  const [clienteId, setClienteId] = useState('');
  const [newClient, setNewClient] = useState({ nombre: '', email: '', telefono: '', empresa: '' });
  
  const [orderType, setOrderType] = useState('project'); // 'project' | 'maintenance' | 'support'
  const [projectTemplateId, setProjectTemplateId] = useState('custom'); // 'custom' | id

  // Step 2: Scope & Price (Project context)
  const [scopeDescription, setScopeDescription] = useState('');
  const [basePrice, setBasePrice] = useState('0');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [templateDetails, setTemplateDetails] = useState<any>(null);

  // Step 2: Scope & Price (Maintenance context)
  const [maintenanceType, setMaintenanceType] = useState('monthly');
  const [durationMonths, setDurationMonths] = useState('6');
  const [hourlyBankTotal, setHourlyBankTotal] = useState('10');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Initial fetch
    Promise.all([
      getClients(1, 200, { estado: 'activo' }),
      getTemplates()
    ]).then(([clientsRes, templatesRes]) => {
      if (clientsRes.success) setClientes(clientsRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
    });

    // Check if cliente param is in URL
    const params = new URLSearchParams(window.location.search);
    const urlClienteId = params.get('cliente');
    if (urlClienteId) {
      setClienteId(urlClienteId);
      setClienteType('existing');
    }
  }, []);

  // Fetch template modules when changed
  useEffect(() => {
    if (orderType === 'project' && projectTemplateId && projectTemplateId !== 'custom') {
      getTemplateWithModules(projectTemplateId).then(res => {
        if (res.success) {
          setTemplateDetails(res.data);
          setModules(res.data.modules || []);
          // Auto select required modules
          const required = res.data.modules?.filter((m: any) => m.is_required).map((m: any) => m.id) || [];
          setSelectedModules(required);
          // Set base price from template
          setBasePrice(res.data.base_price?.toString() || '0');
        }
      });
    } else {
      setTemplateDetails(null);
      setModules([]);
      setSelectedModules([]);
    }
  }, [projectTemplateId, orderType]);

  const handleNextPaso1 = async () => {
    if (clienteType === 'new') {
      if (!newClient.nombre) return alert('El nombre del cliente es requerido');
      setLoading(true);
      try {
        const res = await createClient({...newClient, estado: 'lead'});
        if (res.success) {
          setClientes([res.data, ...clientes]);
          setClienteId(res.data.id);
        }
      } catch (err) {
        alert('Error creando cliente nuevo');
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      if (!clienteId) return alert('Selecciona un cliente o crea uno nuevo');
    }
    
    // Auto-fill scope description from template
    if (orderType === 'project' && templateDetails) {
      if (!scopeDescription) {
        setScopeDescription(`Implementación de ${templateDetails.name}`);
      }
    }
    
    setStep(2);
  };

  const calculateTotalPrice = () => {
    let total = parseFloat(basePrice) || 0;
    if (orderType === 'project') {
      const selectedMods = modules.filter(m => selectedModules.includes(m.id));
      const modsPrice = selectedMods.reduce((sum, m) => sum + parseFloat(m.base_price || '0'), 0);
      total += modsPrice;
    }
    return total;
  };

  const handleNextPaso2 = () => {
    if (!scopeDescription) return alert('Describe el alcance de la orden');
    if (!basePrice || isNaN(parseFloat(basePrice))) return alert('Introduce un precio válido');
    setStep(3);
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    let endDateStr = '';
    
    if (orderType === 'maintenance') {
      if (maintenanceType === 'monthly' && durationMonths) {
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + parseInt(durationMonths, 10));
        endDateStr = start.toISOString().split('T')[0];
      } else if (maintenanceType === 'hourly_bank') {
        const start = new Date(startDate);
        start.setFullYear(start.getFullYear() + 1);
        endDateStr = start.toISOString().split('T')[0];
      } else {
        endDateStr = startDate;
      }
    }

    const clienteSeleccionado = clientes.find(c => c.id === clienteId);
    
    const formData = {
      cliente_id: clienteId,
      client_name: clienteSeleccionado?.nombre,
      client_email: clienteSeleccionado?.email,
      client_phone: clienteSeleccionado?.telefono,
      client_company: clienteSeleccionado?.empresa,
      
      order_type: orderType,
      status: 'draft',
      project_type: orderType === 'project' ? 'combinado' : 'sistema', // Default types
      
      scope_description: scopeDescription,
      base_price: parseFloat(basePrice),
      total_price: calculateTotalPrice(),
      currency: 'USD',
      payment_terms: paymentTerms,
      
      // Project fields
      solution_template_id: orderType === 'project' && projectTemplateId !== 'custom' ? projectTemplateId : undefined,
      included_modules: orderType === 'project' ? selectedModules : [],
      
      // Maintenance fields
      maintenance_type: orderType === 'maintenance' ? maintenanceType : undefined,
      maintenance_start_date: orderType === 'maintenance' ? startDate : undefined,
      maintenance_end_date: orderType === 'maintenance' ? endDateStr : undefined,
      hourly_bank_total: orderType === 'maintenance' && maintenanceType === 'hourly_bank' ? parseInt(hourlyBankTotal, 10) : undefined,
    };

    try {
      const res = await createOrder(formData);
      if (res.success) {
        window.location.href = `/admin/ordenes/${orderType === 'maintenance' ? 'mantenimientos' : 'proyectos'}`;
      } else {
        alert('Error del servidor al crear orden');
      }
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al crear la orden. Revisa los logs.');
    } finally {
      setLoading(false);
    }
  };

  const clienteGuardado = clientes.find(c => c.id === clienteId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Orden</h1>
        <p className="text-gray-600 mt-2">Completa los pasos para generar la estructura del proyecto o servicio.</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mt-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 z-0 rounded-full transition-all duration-300" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[1, 2, 3].map(i => (
            <div key={i} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 ${
              step >= i ? 'bg-indigo-600 border-indigo-100 text-white' : 'bg-gray-100 border-white text-gray-400'
            }`}>
              {i}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm font-medium text-gray-500 px-2">
          <span>Cliente y Tipo</span>
          <span className="ml-4">Alcance y Monto</span>
          <span>Revisión</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Cliente */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">1. Identidad del Cliente</h2>
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setClienteType('existing')}
                  className={`flex-1 py-2 rounded-md font-medium border transition ${clienteType === 'existing' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >Cliente Existente</button>
                <button 
                  onClick={() => setClienteType('new')}
                  className={`flex-1 py-2 rounded-md font-medium border transition ${clienteType === 'new' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >Nuevo Cliente</button>
              </div>

              {clienteType === 'existing' ? (
                <div>
                  <select
                    value={clienteId}
                    onChange={e => setClienteId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} {c.empresa ? `- ${c.empresa}` : ''}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input type="text" value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input type="text" value={newClient.empresa} onChange={e => setNewClient({...newClient, empresa: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="text" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Tipo de Orden */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">2. Naturaleza del Trabajo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`border rounded-lg p-4 cursor-pointer transition ${orderType === 'project' ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="project" checked={orderType === 'project'} onChange={() => setOrderType('project')} className="sr-only" />
                  <div className="text-xl mb-2">🚀</div>
                  <div className="font-bold text-gray-900">Proyecto Nuevo</div>
                  <div className="text-sm text-gray-500 mt-1">Desarrollo de sistema, web o app móvil.</div>
                </label>
                <label className={`border rounded-lg p-4 cursor-pointer transition ${orderType === 'maintenance' ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="maintenance" checked={orderType === 'maintenance'} onChange={() => setOrderType('maintenance')} className="sr-only" />
                  <div className="text-xl mb-2">🔄</div>
                  <div className="font-bold text-gray-900">Mantenimiento</div>
                  <div className="text-sm text-gray-500 mt-1">Polizas recurrentes, horas o servicios continuos.</div>
                </label>
                <label className={`border rounded-lg p-4 cursor-pointer transition ${orderType === 'support' ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white hover:bg-gray-50'}`}>
                  <input type="radio" value="support" checked={orderType === 'support'} onChange={() => setOrderType('support')} className="sr-only" />
                  <div className="text-xl mb-2">🛠️</div>
                  <div className="font-bold text-gray-900">Soporte Express</div>
                  <div className="text-sm text-gray-500 mt-1">Reparaciones, ajustes o cambios menores.</div>
                </label>
              </div>

              {orderType === 'project' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-900 mb-2">¿Usar una plantilla base?</label>
                  <select 
                    value={projectTemplateId} 
                    onChange={e => setProjectTemplateId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="custom">No, Proyecto a medida (Custom)</option>
                    <optgroup label="Plantillas Recomendadas">
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Base: ${t.base_price})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button onClick={handleNextPaso1} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                {loading ? 'Procesando...' : 'Siguiente Paso →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Definición de Alcance y Comercial</h2>
            
            {orderType === 'maintenance' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad de Mantenimiento</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['monthly', 'hourly_bank', 'one_time'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setMaintenanceType(type)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition ${maintenanceType === type ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {type === 'monthly' ? 'Mensual Fijo' : type === 'hourly_bank' ? 'Bolsa de Horas' : 'Puntual'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio Estimada</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  
                  {maintenanceType === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duración del Contrato (Meses)</label>
                      <input type="number" value={durationMonths} onChange={e => setDurationMonths(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  )}
                  {maintenanceType === 'hourly_bank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total de Horas</label>
                      <input type="number" value={hourlyBankTotal} onChange={e => setHourlyBankTotal(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {modules.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Módulos Opcionales del Template</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modules.map(mod => (
                        <label key={mod.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 text-indigo-600 rounded" 
                            disabled={mod.is_required}
                            checked={selectedModules.includes(mod.id)}
                            onChange={(e) => {
                              if(e.target.checked) setSelectedModules([...selectedModules, mod.id]);
                              else setSelectedModules(selectedModules.filter(id => id !== mod.id));
                            }}
                          />
                          <div>
                            <span className="block text-sm font-medium text-gray-900">{mod.name} {mod.is_required && '<span className="text-red-500 text-xs">(Req)</span>'}</span>
                            <span className="block text-xs text-gray-500 mt-1">${mod.base_price}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Servicio / Alcance *</label>
              <textarea 
                value={scopeDescription} 
                onChange={e => setScopeDescription(e.target.value)} 
                rows={4} 
                className="w-full px-4 py-2 border rounded-lg resize-y bg-white"
                placeholder="Detalla lo que incluye este trabajo..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Base {orderType === 'maintenance' && maintenanceType === 'monthly' ? '(Mensualidad)' : '(Subtotal sin opcionales)'} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">$</span>
                  <input type="number" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="w-full pl-8 px-4 py-3 text-lg font-bold border border-gray-300 rounded-lg text-green-700" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Términos de Pago Cortos (opcional)</label>
                <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Ej: 50% anticipo, 50% contra-entrega" className="w-full px-4 py-3 border rounded-lg" />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">
                ← Regresar
              </button>
              <button onClick={handleNextPaso2} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2">
                Ir a Revisión →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mx-auto max-w-md">Revisión de la Orden</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="text-sm text-gray-500 block">Cliente</span>
                  <p className="font-bold text-gray-900 text-lg">{clienteGuardado?.nombre || newClient.nombre}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block">Naturaleza</span>
                  <p className="font-bold text-indigo-700 uppercase">{orderType}</p>
                </div>
                
                <div className="col-span-2 mt-2 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500 block mb-1">Alcance Definido</span>
                  <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed bg-white p-4 rounded border">
                    {scopeDescription || '-'}
                  </p>
                </div>

                <div className="col-span-2 pt-4 flex justify-between items-end border-t border-gray-200 mt-2">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Términos Comerciales</span>
                    <p className="font-medium text-gray-800">{paymentTerms || 'Por defecto'}</p>
                  </div>
                  <div className="text-right text-green-700 bg-green-50 p-4 rounded-lg border border-green-200">
                    <span className="text-sm font-medium block">Total Calculado</span>
                    <span className="text-3xl font-black">${calculateTotalPrice().toLocaleString()} {orderType === 'maintenance' && maintenanceType === 'monthly' && '/ mes'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 mt-8">
              <button 
                onClick={() => setStep(2)} 
                disabled={loading}
                className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                ← Cambiar Detalles
              </button>
              <button 
                onClick={handleCreateOrder} 
                disabled={loading}
                className={`text-white px-8 py-3 rounded-lg font-bold text-lg transition flex items-center gap-2 ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'}`}
              >
                {loading ? 'Generando Orden...' : '✔ Crear y Guardar Orden'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
