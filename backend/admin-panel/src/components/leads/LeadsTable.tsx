'use client';

import type { Lead, LeadStatus } from '@/src/types/lead';

const STATUS_OPTIONS: { value: LeadStatus | string; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'replied', label: 'Respondió' },
  { value: 'diagnostic_completed', label: 'Diagnóstico listo' },
  { value: 'proposal_sent', label: 'Propuesta enviada' },
  { value: 'negotiating', label: 'En negociación' },
  { value: 'won', label: 'Ganado' },
  { value: 'lost', label: 'Perdido' },
  { value: 'converted', label: 'Convertido' },
];

export type NextActionType = 'diagnostic' | 'proposal' | 'order' | null;

export function getNextAction(lead: Lead): NextActionType {
  if (!lead.diagnostic_id) return 'diagnostic';
  if (!lead.pdf_url && lead.status !== 'proposal_sent') return 'proposal';
  if ((lead.status === 'won' || lead.status === 'proposal_sent') && lead.pdf_url) return 'order';
  return null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange: (id: string, status: string) => void;
  statusUpdatingId: string | null;
  onCreateDiagnostic: (leadId: string) => void;
  onCreateProposal: (lead: Lead) => void;
  onCreateOrderFromLead?: (lead: Lead) => void;
  onOpenFlowWizard?: (lead: Lead) => void;
  actionLoading: { diagnostic?: string; proposal?: string };
}

const NEXT_ACTION_LABELS: Record<NonNullable<NextActionType>, string> = {
  diagnostic: 'Siguiente paso: hacer diagnóstico',
  proposal: 'Siguiente paso: generar propuesta',
  order: 'Siguiente paso: crear orden de trabajo',
};

export default function LeadsTable({
  leads,
  onStatusChange,
  statusUpdatingId,
  onCreateDiagnostic,
  onCreateProposal,
  onCreateOrderFromLead,
  onOpenFlowWizard,
  actionLoading,
}: LeadsTableProps) {
  const diagnosticLoading = actionLoading.diagnostic ?? null;
  const proposalLoading = actionLoading.proposal ?? null;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Web
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Ciudad
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                {onOpenFlowWizard ? (
                  <button
                    type="button"
                    onClick={() => onOpenFlowWizard(lead)}
                    className="text-gray-900 font-medium underline hover:text-gray-700"
                  >
                    {lead.name ?? '—'}
                  </button>
                ) : (
                  <span className="text-gray-900">{lead.name ?? '—'}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {lead.phone ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">
                {lead.website ? (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 underline hover:text-gray-700"
                  >
                    {lead.website}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {lead.city ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate" title={lead.category ?? undefined}>
                {lead.category ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {lead.rating != null ? String(lead.rating) : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <select
                  value={lead.status ?? 'new'}
                  onChange={(e) => onStatusChange(lead.id, e.target.value)}
                  disabled={statusUpdatingId === lead.id}
                  className="block w-full min-w-[140px] px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-60"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formatDate(lead.created_at)}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex flex-col items-end gap-1">
                  {(() => {
                    const next = getNextAction(lead);
                    const handleNext = () => {
                      if (next === 'diagnostic') onCreateDiagnostic(lead.id);
                      else if (next === 'proposal') onCreateProposal(lead);
                      else if (next === 'order' && onCreateOrderFromLead) onCreateOrderFromLead(lead);
                    };
                    return next && (next !== 'order' || onCreateOrderFromLead) ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          (next === 'diagnostic' && !!diagnosticLoading) ||
                          (next === 'proposal' && !!proposalLoading)
                        }
                        className="inline-flex px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {NEXT_ACTION_LABELS[next]}
                      </button>
                    ) : null;
                  })()}
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    <a
                      href={lead.website?.startsWith('http') ? lead.website : lead.website ? `https://${lead.website}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-50"
                      style={{ pointerEvents: lead.website ? 'auto' : 'none' }}
                    >
                      Ver web
                    </a>
                    <a
                      href={lead.google_maps_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-50"
                      style={{ pointerEvents: lead.google_maps_url ? 'auto' : 'none' }}
                    >
                      Ver en Google Maps
                    </a>
                    <button
                      type="button"
                      onClick={() => onCreateDiagnostic(lead.id)}
                      disabled={!!diagnosticLoading}
                      className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {diagnosticLoading === lead.id ? 'Creando…' : 'Crear diagnóstico'}
                    </button>
                    {lead.pdf_url ? (
                      <a
                        href={lead.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800"
                      >
                        Ver PDF
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onCreateProposal(lead)}
                      disabled={!!proposalLoading}
                      className="inline-flex px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {proposalLoading === lead.id ? 'Creando…' : 'Generar propuesta PDF'}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
