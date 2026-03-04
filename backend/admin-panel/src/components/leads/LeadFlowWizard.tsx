'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lead } from '@/src/types/lead';
import { getNextAction } from './LeadsTable';

interface LeadFlowWizardProps {
  lead: Lead;
  onClose: () => void;
  onRefresh: () => void;
  onCreateDiagnostic: (leadId: string) => Promise<void>;
  onOpenProposalEditor: (lead: Lead) => void;
}

const STEPS = [
  { key: 'datos', label: 'Datos del lead' },
  { key: 'diagnostico', label: 'Diagnóstico' },
  { key: 'propuesta', label: 'Propuesta PDF' },
  { key: 'orden', label: 'Orden de trabajo' },
] as const;

export default function LeadFlowWizard({
  lead,
  onClose,
  onRefresh,
  onCreateDiagnostic,
  onOpenProposalEditor,
}: LeadFlowWizardProps) {
  const [step, setStep] = useState(0);
  const [creatingDiagnostic, setCreatingDiagnostic] = useState(false);
  const hasDiagnostic = !!lead.diagnostic_id;
  const hasProposal = !!lead.pdf_url;
  const nextAction = getNextAction(lead);

  const completed = {
    datos: true,
    diagnostico: hasDiagnostic,
    propuesta: hasProposal,
    orden: lead.status === 'won' || lead.status === 'converted',
  };

  async function handleCreateDiagnostic() {
    setCreatingDiagnostic(true);
    try {
      await onCreateDiagnostic(lead.id);
      onRefresh();
    } finally {
      setCreatingDiagnostic(false);
    }
  }

  function handleOpenProposal() {
    onOpenProposalEditor(lead);
    onClose();
  }

  function handleCreateOrder() {
    window.location.href = `/ordenes/nueva?leadId=${encodeURIComponent(lead.id)}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Flujo del lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
          <p className="font-medium text-gray-900">{lead.name ?? 'Sin nombre'}</p>
          <p className="text-sm text-gray-500">
            {lead.city ?? ''} {lead.category ? ` · ${lead.category}` : ''}
          </p>
        </div>

        <div className="flex gap-1 border-b border-gray-200 px-6 py-3">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 rounded py-2 text-xs font-medium transition-colors ${
                step === i
                  ? 'bg-gray-900 text-white'
                  : completed[s.key as keyof typeof completed]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {completed[s.key as keyof typeof completed] ? '✓ ' : ''}{s.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Revisa los datos del lead. El flujo es: diagnóstico → propuesta PDF → orden de trabajo.
              </p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-500">Nombre</dt>
                <dd className="font-medium">{lead.name ?? '—'}</dd>
                <dt className="text-gray-500">Teléfono</dt>
                <dd>{lead.phone ?? '—'}</dd>
                <dt className="text-gray-500">Web</dt>
                <dd className="truncate">{lead.website ?? '—'}</dd>
                <dt className="text-gray-500">Ciudad</dt>
                <dd>{lead.city ?? '—'}</dd>
                <dt className="text-gray-500">Categoría</dt>
                <dd>{lead.category ?? '—'}</dd>
              </dl>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Siguiente: Diagnóstico
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {hasDiagnostic
                  ? 'Ya tienes un diagnóstico. Ábrelo para completar las preguntas o continúa a la propuesta.'
                  : 'Crea un diagnóstico para este lead. Luego podrás completar las preguntas y generar la propuesta.'}
              </p>
              {hasDiagnostic ? (
                <>
                  <Link
                    href={`/diagnosticos/${lead.diagnostic_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full justify-center rounded-lg border-2 border-gray-900 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Abrir diagnóstico
                  </Link>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Continuar a la propuesta
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCreateDiagnostic}
                    disabled={creatingDiagnostic}
                    className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                  >
                    {creatingDiagnostic ? 'Creando…' : 'Crear diagnóstico'}
                  </button>
                  <p className="text-xs text-gray-500">
                    Después de crear, abre el diagnóstico para completar las preguntas y vuelve aquí.
                  </p>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {hasProposal
                  ? 'Ya tienes una propuesta PDF. Puedes editarla o abrirla desde la tabla de leads.'
                  : 'Genera la propuesta PDF con la plantilla que prefieras. Se abrirá el editor para personalizar y descargar.'}
              </p>
              {!hasDiagnostic && (
                <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">
                  Primero crea el diagnóstico en el paso anterior.
                </p>
              )}
              <button
                type="button"
                onClick={handleOpenProposal}
                disabled={!hasDiagnostic}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {hasProposal ? 'Editar / regenerar propuesta PDF' : 'Crear y editar propuesta PDF'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Cuando el cliente acepte, crea la orden de trabajo desde aquí. Se abrirá el formulario de nueva orden con el lead vinculado.
              </p>
              <button
                type="button"
                onClick={handleCreateOrder}
                className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Crear orden de trabajo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
