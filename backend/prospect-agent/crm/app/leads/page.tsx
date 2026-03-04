'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

type Lead = {
  id: string;
  nombre: string;
  telefono: string | null;
  website: string | null;
  direccion?: string;
  ciudad: string;
  rubro: string;
  score: number;
  fechaDetectado?: string;
  estado: string;
  [key: string]: unknown;
};

function generateMessage(lead: Lead): string {
  const nombre = (lead.nombre || '').trim() || 'ahí';
  const rubro = (lead.rubro || lead.categoria || '').toString().toLowerCase();
  const lines: string[] = [];

  if (lead.website == null || lead.website === '') {
    lines.push('Noté que no tienen una página web activa.');
  }
  if (rubro.includes('tecnico') || rubro.includes('técnico')) {
    lines.push('Tengo un sistema que automatiza órdenes de trabajo, clientes y seguimiento.');
  }
  if (rubro.includes('restaurante')) {
    lines.push('Tengo un sistema específico para restaurantes que mejora pedidos y gestión.');
  }

  const body = [
    `Hola ${nombre},`,
    '',
    ...lines,
    '',
    'Desarrollé un sistema específico para negocios como el suyo.',
    '',
    '¿Le gustaría ver cómo funciona?',
  ]
    .filter(Boolean)
    .join('\n');

  return body;
}

function formatPhone(phone: string | null): string {
  if (phone == null || phone === '') return '—';
  const s = String(phone).replace(/\D/g, '');
  if (s.length < 8) return phone;
  if (s.startsWith('56') && s.length >= 11) return `+${s.slice(0, 2)} ${s.slice(2)}`;
  if (s.length === 9) return `+56 ${s}`;
  return phone;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterRubro, setFilterRubro] = useState<string>('');
  const [filterCiudad, setFilterCiudad] = useState<string>('');

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => {
        if (!res.ok) throw new Error('Error loading leads');
        return res.json();
      })
      .then((data) => {
        setLeads(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const uniqueEstados = useMemo(() => {
    const set = new Set(leads.map((l) => l.estado).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);
  const uniqueRubros = useMemo(() => {
    const set = new Set(leads.map((l) => l.rubro).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);
  const uniqueCiudades = useMemo(() => {
    const set = new Set(leads.map((l) => l.ciudad).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (filterEstado && l.estado !== filterEstado) return false;
      if (filterRubro && l.rubro !== filterRubro) return false;
      if (filterCiudad && l.ciudad !== filterCiudad) return false;
      return true;
    });
  }, [leads, filterEstado, filterRubro, filterCiudad]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Cargando leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Leads</h1>
            <p className="text-slate-500 mt-1">
              <strong className="text-slate-700">{filteredLeads.length}</strong> de {leads.length} leads
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white transition-colors"
          >
            Buscar leads
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Todos</option>
              {uniqueEstados.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Rubro</label>
            <select
              value={filterRubro}
              onChange={(e) => setFilterRubro(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[180px]"
            >
              <option value="">Todos</option>
              {uniqueRubros.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ciudad</label>
            <select
              value={filterCiudad}
              onChange={(e) => setFilterCiudad(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Todas</option>
              {uniqueCiudades.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {(filterEstado || filterRubro || filterCiudad) && (
            <button
              type="button"
              onClick={() => { setFilterEstado(''); setFilterRubro(''); setFilterCiudad(''); }}
              className="px-3 py-2 text-slate-600 text-sm hover:bg-slate-100 rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Website</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rubro</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const phone = lead.telefono ? String(lead.telefono).replace(/\D/g, '') : '';
                  const hasValidPhone = phone.length >= 9;
                  const message = generateMessage(lead);
                  const waUrl = hasValidPhone
                    ? `https://wa.me/${phone.startsWith('56') ? phone : '56' + phone}?text=${encodeURIComponent(message)}`
                    : '#';
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{lead.nombre || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{formatPhone(lead.telefono)}</td>
                      <td className="px-4 py-3 text-sm">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline truncate block max-w-[180px]">
                            {lead.website}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm max-w-[200px] truncate">{lead.rubro || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{lead.ciudad || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-emerald-50 text-emerald-700">
                          {lead.score ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {lead.estado || 'nuevo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            hasValidPhone
                              ? 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-sm'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="px-4 py-12 text-center text-slate-500">
              No hay leads para mostrar. Ajusta los filtros o busca nuevos desde la página principal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
