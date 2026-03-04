'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getLeads,
  updateLeadStatus,
  createDiagnosticFromLead,
  createProposalFromDiagnostic,
  type GetLeadsFilters,
} from '@/src/services/leadsService';
import LeadsFilters from '@/src/components/leads/LeadsFilters';
import LeadsTable from '@/src/components/leads/LeadsTable';
import ProposalEditorModal from '@/src/components/leads/ProposalEditorModal';
import LeadFlowWizard from '@/src/components/leads/LeadFlowWizard';
import type { Lead } from '@/src/types/lead';

export default function LeadsListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ diagnostic?: string; proposal?: string }>({});
  const [filters, setFilters] = useState<GetLeadsFilters>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [proposalPdfUrl, setProposalPdfUrl] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<{
    id: string;
    business_name: string | null;
  } | null>(null);
  const [flowWizardLead, setFlowWizardLead] = useState<Lead | null>(null);

  const loadLeads = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getLeads(filters);
      setLeads(data);
    } catch (err) {
      console.error('Error loading leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  function handleRefresh() {
    setRefreshing(true);
    loadLeads(true);
  }

  async function handleStatusChange(id: string, status: string) {
    setStatusUpdatingId(id);
    setActionError(null);
    try {
      await updateLeadStatus(id, status);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } catch (err) {
      console.error('Error updating lead status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleCreateDiagnostic(leadId: string) {
    setActionLoading((prev) => ({ ...prev, diagnostic: leadId }));
    setActionError(null);
    try {
      await createDiagnosticFromLead(leadId);
      await loadLeads(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear diagnóstico';
      setActionError(msg);
      console.error('Error creating diagnostic from lead:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, diagnostic: undefined }));
    }
  }

  async function handleCreateProposal(lead: Lead) {
    setActionLoading((prev) => ({ ...prev, proposal: lead.id }));
    setActionError(null);
    setProposalPdfUrl(null);
    setEditingProposal(null);
    try {
      let diagnosticId = lead.diagnostic_id ?? null;
      if (!diagnosticId) {
        const diagnostic = await createDiagnosticFromLead(lead.id);
        diagnosticId = (diagnostic as { id?: string })?.id ?? null;
        await loadLeads(true);
      }
      if (!diagnosticId) {
        throw new Error('Crea primero el diagnóstico para este lead');
      }
      const proposal = await createProposalFromDiagnostic(diagnosticId);
      setEditingProposal({
        id: proposal.id,
        business_name: proposal.business_name ?? lead.name,
      });
      await loadLeads(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear propuesta';
      setActionError(msg);
      console.error('Error creating proposal:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, proposal: undefined }));
    }
  }

  const counts = {
    nuevo: leads.filter((l) => !l.status || l.status === 'new').length,
    diagnosticado: leads.filter((l) => l.diagnostic_id && (l.status === 'diagnostic_completed' || l.status === 'contacted' || l.status === 'replied')).length,
    propuestaEnviada: leads.filter((l) => l.pdf_url || l.status === 'proposal_sent').length,
    ganado: leads.filter((l) => l.status === 'won' || l.status === 'converted').length,
    perdido: leads.filter((l) => l.status === 'lost').length,
  };

  function handleCreateOrderFromLead(lead: Lead) {
    window.location.href = `/ordenes/nueva?leadId=${encodeURIComponent(lead.id)}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Embudo de leads</h1>
        <p className="mt-1 text-gray-600">
          Sigue cada lead desde el primer contacto hasta la orden de trabajo: diagnóstico → propuesta → orden.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{counts.nuevo}</p>
          <p className="text-xs text-gray-500">Nuevos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.diagnosticado}</p>
          <p className="text-xs text-gray-500">Diagnosticados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">{counts.propuestaEnviada}</p>
          <p className="text-xs text-gray-500">Propuesta enviada</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{counts.ganado}</p>
          <p className="text-xs text-gray-500">Ganados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-500">{counts.perdido}</p>
          <p className="text-xs text-gray-500">Perdidos</p>
        </div>
      </div>

      <LeadsFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm">{actionError}</p>
        </div>
      )}

      {proposalPdfUrl && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <p className="font-medium">Propuesta creada</p>
          <a
            href={proposalPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            Abrir PDF
          </a>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          <p className="mt-4 text-gray-600">Cargando leads…</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 rounded-lg">
          <p className="text-gray-600">No hay leads todavía.</p>
          <p className="text-sm text-gray-500 mt-1">Importa leads desde el Lead Scraper o agrégalos manualmente.</p>
        </div>
      ) : (
        <LeadsTable
          leads={leads}
          onStatusChange={handleStatusChange}
          statusUpdatingId={statusUpdatingId}
          onCreateDiagnostic={handleCreateDiagnostic}
          onCreateProposal={handleCreateProposal}
          onCreateOrderFromLead={handleCreateOrderFromLead}
          onOpenFlowWizard={setFlowWizardLead}
          actionLoading={actionLoading}
        />
      )}

      {editingProposal && (
        <ProposalEditorModal
          proposalId={editingProposal.id}
          businessName={editingProposal.business_name}
          onClose={() => {
            setEditingProposal(null);
            loadLeads(true);
          }}
          onSuccess={(pdfUrl) => {
            setProposalPdfUrl(pdfUrl);
            loadLeads(true);
          }}
        />
      )}

      {flowWizardLead && (
        <LeadFlowWizard
          lead={flowWizardLead}
          onClose={() => setFlowWizardLead(null)}
          onRefresh={() => loadLeads(true)}
          onCreateDiagnostic={handleCreateDiagnostic}
          onOpenProposalEditor={(lead) => {
            setFlowWizardLead(null);
            handleCreateProposal(lead);
          }}
        />
      )}
    </div>
  );
}
