'use client';

import { useState } from 'react';
import Link from 'next/link';

const RUBROS = [
  'servicio tecnico celulares',
  'taller mecanico',
  'restaurante',
  'dentista',
  'peluqueria',
];

export default function HomePage() {
  const [rubros, setRubros] = useState<string[]>([]);
  const [ciudad, setCiudad] = useState('Santiago');
  const [limite, setLimite] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ totalFound: number; newLeads: number; duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleRubro = (r: string) => {
    setRubros((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const handleSearch = async () => {
    if (rubros.length === 0) {
      setError('Selecciona al menos un rubro.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubros, ciudad: ciudad.trim() || 'Santiago', limite }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || res.statusText);
      }
      const data = await res.json();
      setResult({ totalFound: data.totalFound, newLeads: data.newLeads, duplicates: data.duplicates });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Búsqueda de leads</h1>
        <p className="text-slate-500 mb-8">Selecciona rubros, ciudad y límite. Los nuevos se guardan en la base de datos.</p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rubros</label>
            <ul className="space-y-2">
              {RUBROS.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`rubro-${r}`}
                    checked={rubros.includes(r)}
                    onChange={() => toggleRubro(r)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`rubro-${r}`} className="text-slate-700 capitalize">
                    {r}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-slate-700 mb-1">
              Ciudad
            </label>
            <input
              id="ciudad"
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Santiago"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="limite" className="block text-sm font-medium text-slate-700 mb-1">
              Límite por rubro
            </label>
            <input
              id="limite"
              type="number"
              min={5}
              max={50}
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value) || 20)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Buscando…' : 'Buscar Leads'}
            </button>
            <Link
              href="/leads"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Ver lista de leads
            </Link>
          </div>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-3">Resultados</h2>
            <ul className="space-y-1 text-slate-600">
              <li><strong>Encontrados:</strong> {result.totalFound}</li>
              <li><strong>Nuevos añadidos:</strong> {result.newLeads}</li>
              <li><strong>Duplicados omitidos:</strong> {result.duplicates}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
