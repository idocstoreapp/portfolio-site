'use client';

import { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Order } from '@/types/order';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getSolutionModules, type SolutionModule } from '@/lib/api';

interface GenerateContractPDFProps {
  order: Order;
  onClose: () => void;
  onSuccess?: (pdfUrl: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  in_development: 'En Desarrollo',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const projectTypeLabels: Record<string, string> = {
  web: 'Sitio Web',
  sistema: 'Sistema',
  app: 'Aplicación',
  marketing: 'Marketing',
  otro: 'Otro',
};

export default function GenerateContractPDF({
  order,
  onClose,
  onSuccess,
}: GenerateContractPDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [includedModulesData, setIncludedModulesData] = useState<SolutionModule[]>([]);
  const [excludedModulesData, setExcludedModulesData] = useState<SolutionModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Cargar nombres de módulos
  useEffect(() => {
    loadModules();
  }, [order]);

  async function loadModules() {
    setLoadingModules(true);
    try {
      const response = await getSolutionModules();
      if (response.success && response.data) {
        // Cargar módulos incluidos
        if (order.included_modules && order.included_modules.length > 0) {
          const included = response.data.filter(m => order.included_modules!.includes(m.id));
          setIncludedModulesData(included);
        }
        // Cargar módulos excluidos
        if (order.excluded_modules && order.excluded_modules.length > 0) {
          const excluded = response.data.filter(m => order.excluded_modules!.includes(m.id));
          setExcludedModulesData(excluded);
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoadingModules(false);
    }
  }

  async function generatePDF() {
    if (!pdfRef.current) {
      alert('Error: No se pudo acceder al contenido del PDF');
      return;
    }

    setGenerating(true);
    try {
      // Configuración mejorada de html2canvas para evitar errores de color
      // Primero, convertir todos los estilos problemáticos antes de renderizar
      const allElements = pdfRef.current.querySelectorAll('*');
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style) {
          try {
            const computedStyle = window.getComputedStyle(htmlEl);
            
            // Función helper para convertir colores problemáticos
            const convertColor = (colorValue: string, defaultColor: string): string => {
              if (!colorValue || colorValue === 'transparent' || colorValue === 'rgba(0, 0, 0, 0)') {
                return defaultColor;
              }
              // Si contiene funciones modernas no soportadas, usar default
              if (colorValue.includes('lab(') || colorValue.includes('lch(') || 
                  colorValue.includes('oklab(') || colorValue.includes('oklch(')) {
                return defaultColor;
              }
              // Si ya es RGB o hex, mantenerlo
              if (colorValue.startsWith('rgb') || colorValue.startsWith('#')) {
                return colorValue;
              }
              // Para otros formatos (named colors, etc), usar default
              return defaultColor;
            };
            
            // Convertir color
            const color = computedStyle.color;
            if (color) {
              const safeColor = convertColor(color, 'rgb(0, 0, 0)');
              htmlEl.style.color = safeColor;
            }
            
            // Convertir backgroundColor
            const bgColor = computedStyle.backgroundColor;
            if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
              const safeBgColor = convertColor(bgColor, 'rgb(255, 255, 255)');
              htmlEl.style.backgroundColor = safeBgColor;
            }
            
            // Convertir borderColor
            const borderColor = computedStyle.borderColor;
            if (borderColor && borderColor !== 'transparent' && borderColor !== 'rgba(0, 0, 0, 0)') {
              const safeBorderColor = convertColor(borderColor, 'rgb(229, 231, 235)');
              htmlEl.style.borderColor = safeBorderColor;
            }
            
            // Convertir borderTopColor, borderRightColor, etc.
            ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].forEach(prop => {
              const borderColorValue = computedStyle.getPropertyValue(prop);
              if (borderColorValue) {
                const safeBorderColor = convertColor(borderColorValue, 'rgb(229, 231, 235)');
                htmlEl.style.setProperty(prop, safeBorderColor);
              }
            });
          } catch (e) {
            // Si hay error, usar valores seguros por defecto
            htmlEl.style.color = 'rgb(0, 0, 0)';
            htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || 'rgb(255, 255, 255)';
          }
        }
      });
      
      // Esperar un momento para que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        removeContainer: false,
        allowTaint: true,
        // Deshabilitar funciones de color modernas completamente
        ignoreElements: (element) => {
          // No ignorar ningún elemento, solo convertir colores
          return false;
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
      const fileName = `Contrato-${order.order_number}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      // Si hay callback de éxito, llamarlo con el blob URL
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      if (onSuccess) {
        onSuccess(url);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    } finally {
      setGenerating(false);
    }
  }

  const fechaOrden = format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es });
  const fechaActual = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Vista Previa del Contrato</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Contenido del PDF */}
          <div 
            ref={pdfRef} 
            className="bg-white p-8" 
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              // Evitar funciones de color modernas
              color: 'rgb(0, 0, 0)',
              backgroundColor: 'rgb(255, 255, 255)',
            }}
          >
            {/* Header con Logo */}
            <div className="border-b-2 border-gray-900 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Logo Maestro Digital */}
                  <div className="w-20 h-20 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'rgb(79, 70, 229)' }}>
                    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="100" rx="12" fill="rgb(79, 70, 229)"/>
                      <text x="50" y="65" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="white" textAnchor="middle">MD</text>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(0, 0, 0)' }}>MAESTRO DIGITAL</h1>
                    <p className="text-sm" style={{ color: 'rgb(107, 114, 128)' }}>Sistemas y Soluciones Digitales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'rgb(0, 0, 0)' }}>{order.order_number}</p>
                  <p className="text-sm" style={{ color: 'rgb(107, 114, 128)' }}>{fechaOrden}</p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Información del Cliente</h2>
              <div className="p-4 rounded" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
                <p className="text-base font-medium mb-2" style={{ color: 'rgb(0, 0, 0)' }}>{order.client_name}</p>
                {order.client_company && (
                  <p className="text-sm mb-1" style={{ color: 'rgb(75, 85, 99)' }}>Empresa: {order.client_company}</p>
                )}
                {order.client_email && (
                  <p className="text-sm mb-1" style={{ color: 'rgb(75, 85, 99)' }}>Email: {order.client_email}</p>
                )}
                {order.client_phone && (
                  <p className="text-sm" style={{ color: 'rgb(75, 85, 99)' }}>Teléfono: {order.client_phone}</p>
                )}
              </div>
            </div>

            {/* Descripción del Proyecto */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Descripción del Proyecto</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                  <span style={{ color: 'rgb(75, 85, 99)' }}>Tipo de Proyecto:</span>
                  <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
                    {projectTypeLabels[order.project_type] || order.project_type}
                  </span>
                </div>
                {order.scope_description && (
                  <div className="py-2">
                    <p className="text-sm mb-2 font-medium" style={{ color: 'rgb(0, 0, 0)' }}>Alcance:</p>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                      {order.scope_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Módulos Incluidos */}
            {includedModulesData.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Módulos Incluidos</h2>
                <div className="p-4 rounded" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
                  <ul className="list-disc list-inside space-y-2">
                    {includedModulesData.map((module) => (
                      <li key={module.id} className="text-sm" style={{ color: 'rgb(75, 85, 99)' }}>
                        <strong style={{ color: 'rgb(0, 0, 0)' }}>{module.name}</strong>
                        {module.description && (
                          <span className="ml-2">- {module.description}</span>
                        )}
                        {module.base_price > 0 && (
                          <span className="ml-2" style={{ color: 'rgb(34, 197, 94)' }}>
                            (${module.base_price.toLocaleString('es-CL')} CLP)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {/* Mostrar IDs no encontrados si hay */}
                  {order.included_modules && order.included_modules.length > includedModulesData.length && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                      <p className="text-xs mb-1" style={{ color: 'rgb(107, 114, 128)' }}>Módulos adicionales (IDs no encontrados):</p>
                      {order.included_modules
                        .filter(id => !includedModulesData.find(m => m.id === id))
                        .map((id, index) => (
                          <code key={index} className="text-xs mr-2" style={{ color: 'rgb(75, 85, 99)' }}>{id}</code>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Módulos Excluidos */}
            {excludedModulesData.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Módulos Excluidos</h2>
                <div className="p-4 rounded" style={{ backgroundColor: 'rgb(254, 242, 242)' }}>
                  <ul className="list-disc list-inside space-y-2">
                    {excludedModulesData.map((module) => (
                      <li key={module.id} className="text-sm" style={{ color: 'rgb(75, 85, 99)' }}>
                        <strong style={{ color: 'rgb(0, 0, 0)' }}>{module.name}</strong>
                        {module.description && (
                          <span className="ml-2">- {module.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {/* Mostrar IDs no encontrados si hay */}
                  {order.excluded_modules && order.excluded_modules.length > excludedModulesData.length && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                      <p className="text-xs mb-1" style={{ color: 'rgb(107, 114, 128)' }}>Módulos adicionales (IDs no encontrados):</p>
                      {order.excluded_modules
                        .filter(id => !excludedModulesData.find(m => m.id === id))
                        .map((id, index) => (
                          <code key={index} className="text-xs mr-2" style={{ color: 'rgb(75, 85, 99)' }}>{id}</code>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Características Personalizadas */}
            {order.custom_features && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Características Personalizadas</h2>
                <div className="p-4 rounded" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                    {order.custom_features}
                  </p>
                </div>
              </div>
            )}

            {/* Aspectos Económicos */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Aspectos Económicos</h2>
              <div className="p-4 rounded border" style={{ backgroundColor: 'rgb(249, 250, 251)', borderColor: 'rgb(229, 231, 235)' }}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgb(75, 85, 99)' }}>Precio Base:</span>
                    <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
                      ${order.base_price.toLocaleString('es-CL')} {order.currency || 'CLP'}
                    </span>
                  </div>
                  {order.modules_price > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: 'rgb(75, 85, 99)' }}>Módulos Adicionales:</span>
                      <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
                        ${order.modules_price.toLocaleString('es-CL')} {order.currency || 'CLP'}
                      </span>
                    </div>
                  )}
                  {order.custom_adjustments !== 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: 'rgb(75, 85, 99)' }}>Ajustes Personalizados:</span>
                      <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
                        ${order.custom_adjustments.toLocaleString('es-CL')} {order.currency || 'CLP'}
                      </span>
                    </div>
                  )}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: 'rgb(220, 38, 38)' }}>Descuento:</span>
                      <span className="font-medium" style={{ color: 'rgb(220, 38, 38)' }}>
                        -${order.discount_amount.toLocaleString('es-CL')} {order.currency || 'CLP'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t mt-3" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                    <span className="text-lg font-semibold" style={{ color: 'rgb(0, 0, 0)' }}>Total:</span>
                    <span className="text-lg font-bold" style={{ color: 'rgb(0, 0, 0)' }}>
                      ${order.total_price.toLocaleString('es-CL')} {order.currency || 'CLP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Términos de Pago */}
            {order.payment_terms && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Términos de Pago</h2>
                <div className="p-4 rounded" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                    {order.payment_terms}
                  </p>
                </div>
              </div>
            )}

            {/* Fechas de Compromiso - OBLIGATORIAS */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Fechas de Compromiso</h2>
              <div className="p-4 rounded border-2" style={{ backgroundColor: 'rgb(254, 252, 232)', borderColor: 'rgb(234, 179, 8)' }}>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                    <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>Fecha de Inicio:</span>
                    <span className="font-bold text-lg" style={{ color: order.estimated_start_date ? 'rgb(0, 0, 0)' : 'rgb(220, 38, 38)' }}>
                      {order.estimated_start_date 
                        ? format(new Date(order.estimated_start_date), "d 'de' MMMM, yyyy", { locale: es })
                        : '⚠️ NO DEFINIDA'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                    <span className="font-medium" style={{ color: 'rgb(0, 0, 0)' }}>Fecha de Entrega:</span>
                    <span className="font-bold text-lg" style={{ color: order.estimated_completion_date ? 'rgb(0, 0, 0)' : 'rgb(220, 38, 38)' }}>
                      {order.estimated_completion_date 
                        ? format(new Date(order.estimated_completion_date), "d 'de' MMMM, yyyy", { locale: es })
                        : '⚠️ NO DEFINIDA'}
                    </span>
                  </div>
                  {order.estimated_start_date && order.estimated_completion_date && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                      <p className="text-sm" style={{ color: 'rgb(75, 85, 99)' }}>
                        <strong>Duración estimada:</strong> {
                          Math.ceil(
                            (new Date(order.estimated_completion_date).getTime() - new Date(order.estimated_start_date).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )
                        } días
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Términos Legales */}
            {(order.warranty_text || order.maintenance_policy || order.exclusions_text) && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Términos Legales</h2>
                <div className="space-y-4">
                  {order.warranty_text && (
                    <div>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'rgb(0, 0, 0)' }}>Garantía</h3>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                        {order.warranty_text}
                      </p>
                    </div>
                  )}
                  {order.maintenance_policy && (
                    <div>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'rgb(0, 0, 0)' }}>Política de Mantenimiento</h3>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                        {order.maintenance_policy}
                      </p>
                    </div>
                  )}
                  {order.exclusions_text && (
                    <div>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'rgb(0, 0, 0)' }}>Exclusiones</h3>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                        {order.exclusions_text}
                      </p>
                    </div>
                  )}
                  {/* Cláusula automática */}
                  <div className="p-3 rounded border" style={{ backgroundColor: 'rgb(254, 252, 232)', borderColor: 'rgb(234, 179, 8)' }}>
                    <p className="text-xs italic" style={{ color: 'rgb(113, 63, 18)' }}>
                      <strong>Cláusula Automática:</strong> Cualquier funcionalidad no descrita explícitamente en este documento no está incluida en el alcance del proyecto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notas para el Cliente */}
            {order.client_notes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'rgb(0, 0, 0)' }}>Notas Importantes</h2>
                <div className="p-4 rounded" style={{ backgroundColor: 'rgb(249, 250, 251)' }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgb(75, 85, 99)' }}>
                    {order.client_notes}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2" style={{ borderColor: 'rgb(17, 24, 39)' }}>
              <p className="text-xs text-center mb-2" style={{ color: 'rgb(107, 114, 128)' }}>
                Este contrato fue generado automáticamente desde el Sistema de Gestión de Órdenes
              </p>
              <p className="text-xs text-center" style={{ color: 'rgb(107, 114, 128)' }}>
                Maestro Digital - {format(new Date(), 'yyyy')} | Fecha de generación: {fechaActual}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm">
              {loadingModules && (
                <span className="text-gray-600">Cargando información de módulos...</span>
              )}
              {!loadingModules && (!order.estimated_start_date || !order.estimated_completion_date) && (
                <span className="text-red-600 font-medium">
                  ⚠️ Advertencia: Las fechas de compromiso deben estar definidas antes de generar el PDF.
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={generatePDF}
                disabled={generating || loadingModules}
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generando PDF...' : '📄 Generar y Descargar PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
