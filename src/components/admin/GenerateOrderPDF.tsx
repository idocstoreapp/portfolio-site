import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { DiagnosticData } from '../../utils/backendClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GenerateOrderPDFProps {
  diagnostic: DiagnosticData;
  diagnosticResult?: any;
  costoReal: number;
  trabajoRealHoras: number;
  onClose: () => void;
}

export default function GenerateOrderPDF({
  diagnostic,
  diagnosticResult,
  costoReal,
  trabajoRealHoras,
  onClose,
}: GenerateOrderPDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  async function generatePDF() {
    if (!pdfRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generar nombre de archivo
      const fileName = `Orden-${diagnostic.empresa || diagnostic.nombre || 'Diagnostico'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  }

  const clienteNombre = diagnostic.empresa || diagnostic.nombre || 'Cliente';
  const clienteEmail = diagnostic.email || '';
  const clienteTelefono = diagnostic.telefono || '';
  const fechaOrden = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });
  const numeroOrden = `ORD-${diagnostic.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Vista Previa de Orden</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Contenido del PDF */}
          <div ref={pdfRef} className="bg-white p-8" style={{ width: '210mm', minHeight: '297mm', background: 'white', padding: '2rem' }}>
            {/* Header */}
            <div className="border-b-2 border-gray-900 pb-4 mb-6" style={{ borderBottom: '2px solid #111', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>MAESTRO DIGITAL</h1>
                  <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4B5563' }}>Sistemas y Soluciones Digitales</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>{numeroOrden}</p>
                  <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4B5563' }}>{fechaOrden}</p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>Información del Cliente</h2>
              <div className="bg-gray-50 p-4 rounded" style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem' }}>
                <p className="text-base font-medium text-gray-900 mb-2" style={{ fontSize: '1rem', fontWeight: 500, color: '#111', marginBottom: '0.5rem' }}>{clienteNombre}</p>
                {clienteEmail && <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4B5563' }}>📧 {clienteEmail}</p>}
                {clienteTelefono && <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4B5563' }}>📱 {clienteTelefono}</p>}
              </div>
            </div>

            {/* Detalles del Proyecto */}
            <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>Detalles del Proyecto</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span className="text-gray-700" style={{ color: '#374151' }}>Tipo de Empresa:</span>
                  <span className="font-medium text-gray-900" style={{ fontWeight: 500, color: '#111' }}>{diagnostic.tipo_empresa}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #E5E7EB' }}>
                  <span className="text-gray-700" style={{ color: '#374151' }}>Solución Principal:</span>
                  <span className="font-medium text-gray-900" style={{ fontWeight: 500, color: '#111' }}>
                    {diagnosticResult?.primarySolution?.title || diagnostic.solucion_principal}
                  </span>
                </div>
                {diagnosticResult?.primarySolution?.description && (
                  <div className="py-2" style={{ padding: '0.5rem 0' }}>
                    <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                      {diagnosticResult.primarySolution.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Costos y Trabajo */}
            {(costoReal > 0 || trabajoRealHoras > 0) && (
              <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>Costos y Trabajo Real</h2>
                <div className="bg-gray-50 p-4 rounded space-y-2" style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem' }}>
                  {costoReal > 0 && (
                    <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-gray-700" style={{ color: '#374151' }}>Costo Real del Proyecto:</span>
                      <span className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111' }}>
                        ${costoReal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {trabajoRealHoras > 0 && (
                    <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-gray-700" style={{ color: '#374151' }}>Horas de Trabajo:</span>
                      <span className="font-semibold text-gray-900" style={{ fontWeight: 600, color: '#111' }}>
                        {trabajoRealHoras.toFixed(1)} horas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Objetivos */}
            {diagnostic.objetivos && diagnostic.objetivos.length > 0 && (
              <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>Objetivos Identificados</h2>
                <ul className="list-disc list-inside space-y-1" style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                  {diagnostic.objetivos.map((objetivo, index) => (
                    <li key={index} className="text-gray-700" style={{ color: '#374151' }}>{objetivo}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notas */}
            {diagnostic.notas && (
              <div className="mb-6" style={{ marginBottom: '1.5rem' }}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3" style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>Notas</h2>
                <div className="bg-gray-50 p-4 rounded" style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap" style={{ fontSize: '0.875rem', color: '#374151', whiteSpace: 'pre-wrap' }}>{diagnostic.notas}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-gray-900" style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #111' }}>
              <p className="text-xs text-gray-600 text-center" style={{ fontSize: '0.75rem', color: '#4B5563', textAlign: 'center' }}>
                Esta orden fue generada automáticamente desde el Sistema de Gestión de Diagnósticos
              </p>
              <p className="text-xs text-gray-600 text-center mt-2" style={{ fontSize: '0.75rem', color: '#4B5563', textAlign: 'center', marginTop: '0.5rem' }}>
                Maestro Digital - {format(new Date(), 'yyyy')}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={generatePDF}
              disabled={generating}
              className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generando PDF...' : '📄 Generar y Descargar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

