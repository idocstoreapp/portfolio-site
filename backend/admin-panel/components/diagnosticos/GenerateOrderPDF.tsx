'use client';

import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Diagnostic } from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GenerateOrderPDFProps {
  diagnostic: Diagnostic;
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
    if (!pdfRef.current) {
      alert('Error: No se pudo acceder al contenido del PDF');
      return;
    }

    setGenerating(true);
    try {
      // Configuración mejorada de html2canvas para evitar errores de color
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: false,
        allowTaint: true,
        // Evitar funciones de color modernas que causan problemas
        onclone: (clonedDoc) => {
          // Convertir todos los estilos a RGB para evitar problemas con lab()
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style) {
              // Forzar colores RGB
              const computedStyle = window.getComputedStyle(htmlEl);
              if (computedStyle.color && computedStyle.color.includes('lab')) {
                htmlEl.style.color = '#000000';
              }
              if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('lab')) {
                htmlEl.style.backgroundColor = '#ffffff';
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Si el contenido es más alto que una página, dividirlo en múltiples páginas
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Generar nombre de archivo
      const fileName = `Orden-${diagnostic.empresa || diagnostic.nombre || 'Diagnostico'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      onClose();
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
          <div ref={pdfRef} className="bg-white p-8" style={{ width: '210mm', minHeight: '297mm' }}>
            {/* Header */}
            <div className="border-b-2 border-gray-900 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">MAESTRO DIGITAL</h1>
                  <p className="text-sm text-gray-600">Sistemas y Soluciones Digitales</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{numeroOrden}</p>
                  <p className="text-sm text-gray-600">{fechaOrden}</p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-base font-medium text-gray-900 mb-2">{clienteNombre}</p>
                {clienteEmail && <p className="text-sm text-gray-600">📧 {clienteEmail}</p>}
                {clienteTelefono && <p className="text-sm text-gray-600">📱 {clienteTelefono}</p>}
              </div>
            </div>

            {/* Detalles del Proyecto */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Detalles del Proyecto</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Tipo de Empresa:</span>
                  <span className="font-medium text-gray-900">{diagnostic.tipo_empresa}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-700">Solución Principal:</span>
                  <span className="font-medium text-gray-900">
                    {diagnosticResult?.primarySolution?.title || diagnostic.solucion_principal}
                  </span>
                </div>
                {diagnosticResult?.primarySolution?.description && (
                  <div className="py-2">
                    <p className="text-sm text-gray-600">
                      {diagnosticResult.primarySolution.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Costos y Trabajo */}
            {(costoReal > 0 || trabajoRealHoras > 0) && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Costos y Trabajo Real</h2>
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  {costoReal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Costo Real del Proyecto:</span>
                      <span className="font-semibold text-gray-900">
                        ${costoReal.toLocaleString('es-CL', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {trabajoRealHoras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Horas de Trabajo:</span>
                      <span className="font-semibold text-gray-900">
                        {trabajoRealHoras.toFixed(1)} horas
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Objetivos */}
            {diagnostic.objetivos && diagnostic.objetivos.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Objetivos Identificados</h2>
                <ul className="list-disc list-inside space-y-1">
                  {diagnostic.objetivos.map((objetivo, index) => (
                    <li key={index} className="text-gray-700">{objetivo}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notas */}
            {diagnostic.notas && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Notas</h2>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{diagnostic.notas}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-gray-900">
              <p className="text-xs text-gray-600 text-center">
                Esta orden fue generada automáticamente desde el Sistema de Gestión de Diagnósticos
              </p>
              <p className="text-xs text-gray-600 text-center mt-2">
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

