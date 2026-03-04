'use client';

import { useState, useRef, useEffect } from 'react';
import {
  generateProposalPdf,
  type GeneratePdfPayload,
} from '@/src/services/leadsService';
import { getTemplateList, type TemplateItem } from '@/src/services/proposalTemplatesService';

interface ProposalEditorModalProps {
  proposalId: string;
  businessName: string | null;
  onClose: () => void;
  onSuccess: (pdfUrl: string) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ProposalEditorModal({
  proposalId,
  businessName,
  onClose,
  onSuccess,
}: ProposalEditorModalProps) {
  const [logoCliente, setLogoCliente] = useState('');
  const [logoTu, setLogoTu] = useState('');
  const [mockup1, setMockup1] = useState('');
  const [mockup2, setMockup2] = useState('');
  const [mockup3, setMockup3] = useState('');
  const [mockup4, setMockup4] = useState('');
  const [mockup5, setMockup5] = useState('');
  const [colorPrimary, setColorPrimary] = useState('#c41e3a');
  const [colorSecondary, setColorSecondary] = useState('#2d2d2d');
  const [tipoNegocio, setTipoNegocio] = useState('generic');
  const [templateList, setTemplateList] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoClienteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTemplateList().then(setTemplateList).catch(() => setTemplateList([]));
  }, []);
  const logoTuRef = useRef<HTMLInputElement>(null);
  const mockup1Ref = useRef<HTMLInputElement>(null);
  const mockup2Ref = useRef<HTMLInputElement>(null);
  const mockup3Ref = useRef<HTMLInputElement>(null);
  const mockup4Ref = useRef<HTMLInputElement>(null);
  const mockup5Ref = useRef<HTMLInputElement>(null);

  async function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setter(dataUrl);
    } catch {
      setError('Error al cargar la imagen');
    }
  }

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    try {
      const payload: GeneratePdfPayload = {
        colorPrimary,
        colorSecondary,
        tipoNegocio,
      };
      if (logoCliente) payload.logoCliente = logoCliente;
      if (logoTu) payload.logoTu = logoTu;
      if (mockup1) payload.mockup1 = mockup1;
      if (mockup2) payload.mockup2 = mockup2;
      if (mockup3) payload.mockup3 = mockup3;
      if (mockup4) payload.mockup4 = mockup4;
      if (mockup5) payload.mockup5 = mockup5;

      const result = await generateProposalPdf(proposalId, payload);
      if (result.pdf_url) {
        onSuccess(result.pdf_url);
        onClose();
      } else {
        setError('PDF generado pero no se obtuvo la URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar PDF');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Editor de propuesta · {businessName ?? 'Cliente'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tipo de plantilla (el diseño del PDF cambia según rubro y oferta)
            </label>
            <select
              value={tipoNegocio}
              onChange={(e) => setTipoNegocio(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              {templateList.length
                ? templateList.map((t) => (
                    <option key={t.tipo} value={t.tipo}>
                      {t.name} — {t.rubro} · {t.tipoOferta}
                    </option>
                  ))
                : [
                    { tipo: 'generic', name: 'Genérica' },
                    { tipo: 'restaurante', name: 'Restaurante' },
                    { tipo: 'servicio-tecnico', name: 'Servicio técnico' },
                    { tipo: 'taller', name: 'Taller' },
                  ].map((t) => (
                    <option key={t.tipo} value={t.tipo}>{t.name}</option>
                  ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Restaurante = diseño cálido; Taller = industrial; Servicio técnico = azul; Genérica = web/app.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo del negocio (cliente)
              </label>
              <input
                ref={logoClienteRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e, setLogoCliente)}
              />
              <button
                type="button"
                onClick={() => logoClienteRef.current?.click()}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {logoCliente ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              {logoCliente && (
                <img
                  src={logoCliente}
                  alt="Logo cliente"
                  className="mt-2 max-h-16 w-auto object-contain"
                />
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Logo Maestro Digital (tu marca)
              </label>
              <input
                ref={logoTuRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e, setLogoTu)}
              />
              <button
                type="button"
                onClick={() => logoTuRef.current?.click()}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {logoTu ? 'Cambiar imagen' : 'Subir (opcional: si no subes, se usa el logo por defecto del servidor)'}
              </button>
              {logoTu && (
                <img
                  src={logoTu}
                  alt="Logo Maestro Digital"
                  className="mt-2 max-h-16 w-auto object-contain"
                />
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {tipoNegocio === 'servicio-tecnico'
                ? 'Imágenes del PDF (servicio técnico)'
                : tipoNegocio === 'taller'
                ? 'Imágenes de la propuesta (taller)'
                : tipoNegocio === 'restaurante'
                ? 'Imágenes de la propuesta (restaurante)'
                : 'Imágenes de la propuesta (web / genérica)'}
            </label>
            {tipoNegocio === 'servicio-tecnico' ? (
              <p className="mb-2 text-xs text-gray-500">
                Portada: móvil y escritorio. Página 2: muestra del PDF de la orden (vertical). Páginas 3 y 4: imágenes
                extra para dar más contenido visual. Para que se vean las imágenes de las páginas 3 y 4, elige la
                plantilla <strong>Servicio técnico</strong> arriba.
              </p>
            ) : tipoNegocio === 'taller' ? (
              <p className="mb-2 text-xs text-gray-500">
                Web móvil y escritorio, panel admin con catálogo, órdenes de trabajo y métricas, PDF de la orden e
                inventario/stock. Suba capturas que muestren cada vista para que el PDF sea claro e impresionante.
              </p>
            ) : tipoNegocio === 'restaurante' ? (
              <p className="mb-2 text-xs text-gray-500">
                Usa imágenes reales del sistema para restaurante. Portada y páginas 2–4 se enfocan en: menú digital
                en el celular del cliente, panel de gestión de mesas en escritorio y vista de métricas / boletas y
                comandas. Así el PDF explica claramente qué verá el comensal y qué verá el personal del local.
              </p>
            ) : (
              <p className="mb-2 text-xs text-gray-500">
                Portada: vista escritorio y móvil de la web. Páginas siguientes: secciones internas o detalles (por
                ejemplo, página de servicios, contacto o catálogo). Usa imágenes que muestren cómo se verá el sitio al
                cliente.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(tipoNegocio === 'servicio-tecnico'
                ? [
                    { ref: mockup1Ref, value: mockup1, set: setMockup1, label: 'Mockup móvil', hint: 'Portada · vista en celular' },
                    { ref: mockup2Ref, value: mockup2, set: setMockup2, label: 'Mockup escritorio', hint: 'Portada · vista en PC / panel' },
                    { ref: mockup3Ref, value: mockup3, set: setMockup3, label: 'Muestra PDF orden de trabajo', hint: 'Pág 2 · vertical (cómo se verá el PDF)' },
                    { ref: mockup4Ref, value: mockup4, set: setMockup4, label: 'Imagen página 3', hint: 'Ej. panel, dashboard, listado' },
                    { ref: mockup5Ref, value: mockup5, set: setMockup5, label: 'Imagen página 4', hint: 'Ej. reportes, permisos, pantalla' },
                  ]
                : tipoNegocio === 'taller'
                ? [
                    { ref: mockup1Ref, value: mockup1, set: setMockup1, label: 'Web móvil', hint: 'Portada y pág. 2 · diseño web en celular' },
                    { ref: mockup2Ref, value: mockup2, set: setMockup2, label: 'Panel admin / escritorio', hint: 'Portada y pág. 3 · catálogo e inventario' },
                    { ref: mockup3Ref, value: mockup3, set: setMockup3, label: 'PDF orden de trabajo', hint: 'Portada y pág. 5 · cómo se ve el PDF al cliente' },
                    { ref: mockup4Ref, value: mockup4, set: setMockup4, label: 'Métricas / órdenes en curso', hint: 'Pág. 4 · dashboard, lista de órdenes, ventas' },
                    { ref: mockup5Ref, value: mockup5, set: setMockup5, label: 'Control de stock', hint: 'Pág. 5 · inventario de repuestos y accesorios' },
                  ]
                : tipoNegocio === 'restaurante'
                ? [
                    {
                      ref: mockup1Ref,
                      value: mockup1,
                      set: setMockup1,
                      label: 'Menú digital en móvil',
                      hint: 'Portada y pág. 2 · menú QR como lo ve el comensal en su celular',
                    },
                    {
                      ref: mockup2Ref,
                      value: mockup2,
                      set: setMockup2,
                      label: 'Panel de mesas / pedidos (escritorio)',
                      hint: 'Portada y pág. 3 · vista de gestión de mesas, pedidos y estados',
                    },
                    {
                      ref: mockup3Ref,
                      value: mockup3,
                      set: setMockup3,
                      label: 'Métricas, boletas y comandas',
                      hint: 'Pág. 4 · dashboard de ventas o ejemplo de boleta/comanda PDF',
                    },
                  ]
                : [
                    {
                      ref: mockup2Ref,
                      value: mockup2,
                      set: setMockup2,
                      label: 'Vista escritorio (home)',
                      hint: 'Portada · diseño de la página de inicio en escritorio',
                    },
                    {
                      ref: mockup1Ref,
                      value: mockup1,
                      set: setMockup1,
                      label: 'Vista móvil (home)',
                      hint: 'Portada · cómo se ve la web en el celular',
                    },
                    {
                      ref: mockup3Ref,
                      value: mockup3,
                      set: setMockup3,
                      label: 'Sección interna / detalle',
                      hint: 'Ej. página de servicios, contacto o catálogo',
                    },
                  ]
              ).map(({ ref: r, value, set, label, hint }) => (
                <div key={label}>
                  <span className="block text-xs font-medium text-gray-700 mb-1">{label}</span>
                  <input
                    ref={r}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e, set)}
                  />
                  <button
                    type="button"
                    onClick={() => r.current?.click()}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {value ? 'Cambiar' : `Adjuntar aquí ${label.toLowerCase()}`}
                  </button>
                  {hint && <p className="mt-0.5 text-[10px] text-gray-400">{hint}</p>}
                  {value && (
                    <img
                      src={value}
                      alt={label}
                      className="mt-1 max-h-20 w-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Colores del PDF</h3>
            <p className="mb-3 text-xs text-gray-500">
              Estos dos colores se aplican al PDF que vas a generar. Si los cambias y generas de nuevo, el PDF usará los nuevos valores.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Color primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorPrimary}
                    onChange={(e) => setColorPrimary(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colorPrimary}
                    onChange={(e) => setColorPrimary(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Barra de título, acentos, iconos de tarjetas, botones y CTAs.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Color secundario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorSecondary}
                    onChange={(e) => setColorSecondary(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colorSecondary}
                    onChange={(e) => setColorSecondary(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Gradientes (junto al primario), barra lateral, bordes y refuerzos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? 'Generando PDF…' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
