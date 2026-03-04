'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTemplateList,
  getTemplateBlocks,
  setTemplateBlocks,
  getPreviewHtml,
  type TemplateItem,
} from '@/src/services/proposalTemplatesService';

const PAGES = [
  {
    num: 1,
    title: 'Portada',
    desc: 'Logos, título, carta de presentación, mockup y QR.',
    keys: ['cover_letter_text', 'page1_after_mockup'] as const,
    labels: {
      cover_letter_text: 'Carta de presentación',
      page1_after_mockup: 'Texto adicional después del mockup (opcional)',
    },
    noEditableNote: null,
  },
  {
    num: 2,
    title: 'Experiencia digital',
    desc: 'Características y mockups.',
    keys: [],
    noEditableNote:
      'En esta página el contenido (títulos, tarjetas e imágenes) es común a todas las propuestas de este tipo. No hay textos que editar aquí.',
  },
  {
    num: 3,
    title: 'Sistema administrativo',
    desc: 'Iconos y descripciones del panel.',
    keys: [],
    noEditableNote:
      'En esta página el contenido es común a todas las propuestas. No hay textos editables aquí.',
  },
  {
    num: 4,
    title: 'Funcionalidades avanzadas',
    desc: 'Roles, permisos y alertas.',
    keys: [],
    noEditableNote:
      'En esta página el contenido es común a todas las propuestas. No hay textos editables aquí.',
  },
  {
    num: 5,
    title: 'Propuesta final',
    desc: 'Intro, precios, cierre y logos.',
    keys: ['body_text', 'closing_message'] as const,
    labels: {
      body_text: 'Texto intro antes de los precios',
      closing_message: 'Mensaje de cierre',
    },
    noEditableNote: null,
  },
] as const;

export default function PlantillasPropuestaPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [examplePreview, setExamplePreview] = useState<{ tipo: string; html: string } | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await getTemplateList();
      setTemplates(data);
      if (data.length && !selectedTipo) setSelectedTipo(data[0].tipo);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar plantillas');
      setTemplates([]);
    } finally {
      setLoadingList(false);
    }
  }, [selectedTipo]);

  useEffect(() => {
    loadList();
  }, []);

  const loadBlocks = useCallback(async (tipo: string) => {
    setLoadingBlocks(true);
    setError(null);
    try {
      const data = await getTemplateBlocks(tipo);
      setBlocks(data);
      setDirty(false);
      setPreviewHtml('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar bloques');
      setBlocks({});
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTipo) loadBlocks(selectedTipo);
  }, [selectedTipo, loadBlocks]);

  function handleBlockChange(key: string, value: string) {
    setBlocks((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    if (!selectedTipo) return;
    setSaving(true);
    setError(null);
    try {
      await setTemplateBlocks(selectedTipo, blocks);
      setDirty(false);
      if (previewHtml) await refreshPreview();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function refreshPreview() {
    if (!selectedTipo) return;
    setLoadingPreview(true);
    setError(null);
    try {
      const html = await getPreviewHtml(selectedTipo, blocks);
      setPreviewHtml(html);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar vista previa');
    } finally {
      setLoadingPreview(false);
    }
  }

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleBlockChange('qr_image', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearQr() {
    handleBlockChange('qr_image', '');
  }

  async function handleVerEjemplo(tipo: string) {
    setLoadingExample(true);
    setExamplePreview(null);
    try {
      const html = await getPreviewHtml(tipo, {});
      setExamplePreview({ tipo, html });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar ejemplo');
    } finally {
      setLoadingExample(false);
    }
  }

  if (loadingList) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Cargando plantillas…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Plantillas de propuesta PDF
      </h1>
      <p className="text-gray-600 mb-6">
        Cada <strong>rubro y tipo de oferta</strong> tiene un <strong>diseño distinto</strong>. Elige una plantilla recomendada al generar una propuesta; solo entra aquí si quieres personalizar textos, colores o el QR.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Modo rápido: plantillas recomendadas */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Plantillas recomendadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t) => (
            <div
              key={t.tipo}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 transition-colors"
            >
              <span className="inline-block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {t.rubro} · {t.tipoOferta}
              </span>
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.descripcion}</p>
              <button
                type="button"
                onClick={() => handleVerEjemplo(t.tipo)}
                disabled={loadingExample}
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loadingExample ? 'Cargando…' : 'Ver ejemplo'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modo avanzado */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>No necesitas tocar esto para usar el sistema.</strong> Solo entra aquí si quieres ajustar textos, colores o el QR de WhatsApp de las propuestas.
        </p>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rubro · Tipo de oferta</p>
          <ul className="space-y-2 border border-gray-200 rounded-lg p-2 bg-white">
            {templates.map((t) => (
              <li key={t.tipo}>
                <button
                  type="button"
                  onClick={() => setSelectedTipo(t.tipo)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedTipo === t.tipo
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-semibold block">{t.name}</span>
                  <span className={`block mt-0.5 text-xs ${selectedTipo === t.tipo ? 'text-gray-300' : 'text-gray-500'}`}>
                    {t.rubro} · {t.tipoOferta}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-6">
          {selectedTipo && (
            <>
              <div className="lg:w-1/2 space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {templates.find((t) => t.tipo === selectedTipo)?.name ?? selectedTipo}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {templates.find((t) => t.tipo === selectedTipo)?.descripcion}
                    </p>
                  </div>

                  {loadingBlocks ? (
                    <p className="text-gray-500">Cargando…</p>
                  ) : (
                    <>
                      {/* QR WhatsApp - PRIMERO Y MUY VISIBLE */}
                      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                          📱 Adjuntar QR de WhatsApp
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Este QR sale en la portada y en la última página del PDF. Sube aquí la imagen de tu código QR.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700">
                            <span>Elegir imagen…</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQrFile}
                              className="sr-only"
                            />
                          </label>
                          {(blocks.qr_image || '').trim() ? (
                            <>
                              <img
                                src={blocks.qr_image}
                                alt="QR WhatsApp"
                                className="w-20 h-20 object-contain border border-gray-200 rounded-lg bg-white p-1"
                              />
                              <button
                                type="button"
                                onClick={clearQr}
                                className="text-sm text-red-600 hover:underline"
                              >
                                Quitar QR
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Aún no has subido ningún QR</span>
                          )}
                        </div>
                      </div>

                      {/* Colores */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                          Colores de la plantilla
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Color principal</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={blocks.color_primary || '#c41e3a'}
                                onChange={(e) => handleBlockChange('color_primary', e.target.value)}
                                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={blocks.color_primary || '#c41e3a'}
                                onChange={(e) => handleBlockChange('color_primary', e.target.value)}
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Color secundario</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={blocks.color_secondary || '#2d2d2d'}
                                onChange={(e) => handleBlockChange('color_secondary', e.target.value)}
                                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={blocks.color_secondary || '#2d2d2d'}
                                onChange={(e) => handleBlockChange('color_secondary', e.target.value)}
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenido por página */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Contenido por página
                        </h3>
                        {PAGES.map((page) => (
                          <div
                            key={page.num}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-gray-500">
                                Página {page.num} de 5
                              </span>
                              <span className="text-sm font-semibold text-gray-800">
                                {page.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">{page.desc}</p>
                            {page.keys.length === 0 ? (
                              <p className="text-xs text-gray-600">{page.noEditableNote}</p>
                            ) : (
                              page.keys.map((key) => (
                                <div key={key} className="mb-3">
                                  <label
                                    htmlFor={`${page.num}-${key}`}
                                    className="block text-xs font-medium text-gray-700 mb-1"
                                  >
                                    {page.labels?.[key]}
                                  </label>
                                  <textarea
                                    id={`${page.num}-${key}`}
                                    value={blocks[key] ?? ''}
                                    onChange={(e) => handleBlockChange(key, e.target.value)}
                                    rows={key === 'cover_letter_text' || key === 'body_text' ? 5 : 2}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving || !dirty}
                          className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                        {dirty && (
                          <span className="text-sm text-amber-600">Hay cambios sin guardar</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Vista previa */}
              <div className="lg:w-1/2">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm sticky top-6">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-800">Vista previa del PDF</h3>
                    <button
                      type="button"
                      onClick={refreshPreview}
                      disabled={loadingPreview}
                      className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                    >
                      {loadingPreview ? 'Cargando…' : 'Actualizar vista previa'}
                    </button>
                  </div>
                  <div className="p-2 bg-gray-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                      {previewHtml ? (
                        <iframe
                          ref={previewFrameRef}
                          title="Vista previa"
                          srcDoc={previewHtml}
                          className="w-full border-0"
                          style={{ height: '297mm', minHeight: '1200px' }}
                          sandbox="allow-same-origin"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                          Haz clic en &quot;Actualizar vista previa&quot; para ver el documento.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal ejemplo de plantilla */}
      {examplePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExamplePreview(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Ejemplo: {templates.find((t) => t.tipo === examplePreview.tipo)?.name ?? examplePreview.tipo}</h3>
              <button
                type="button"
                onClick={() => setExamplePreview(null)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                <iframe
                  title="Ejemplo de plantilla"
                  srcDoc={examplePreview.html}
                  className="w-full border-0"
                  style={{ height: '297mm', minHeight: '800px' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
