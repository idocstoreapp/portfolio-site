const BACKEND_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')
    : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export interface TemplateItem {
  tipo: string;
  name: string;
  rubro: string;
  tipoOferta: string;
  descripcion: string;
}

export async function getTemplateList(): Promise<TemplateItem[]> {
  const res = await fetch(`${BACKEND_URL}/api/proposal/templates`);
  if (!res.ok) throw new Error('Error al cargar plantillas');
  const json = await res.json();
  return json.data ?? [];
}

export async function getTemplateBlocks(
  tipo: string
): Promise<Record<string, string>> {
  const res = await fetch(
    `${BACKEND_URL}/api/proposal/templates/${encodeURIComponent(tipo)}`
  );
  if (!res.ok) throw new Error('Error al cargar bloques');
  const json = await res.json();
  return json.data ?? {};
}

export async function setTemplateBlocks(
  tipo: string,
  blocks: Record<string, string>
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/api/proposal/templates/${encodeURIComponent(tipo)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    }
  );
  if (!res.ok) throw new Error('Error al guardar');
}

export async function getPreviewHtml(
  tipo: string,
  blocks: Record<string, string>
): Promise<string> {
  const res = await fetch(
    `${BACKEND_URL}/api/proposal/templates/${encodeURIComponent(tipo)}/preview-html`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    }
  );
  if (!res.ok) throw new Error('Error al generar vista previa');
  const json = await res.json();
  return json.html ?? '';
}
