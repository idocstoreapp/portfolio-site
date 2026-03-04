'use client';

import { useState } from 'react';
import { scrapeLeads, type ScrapeLeadsResponse } from '@/src/services/leadsService';

export default function LeadsScraperPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Santiago');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeLeadsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await scrapeLeads(query.trim() || 'servicio tecnico', city, limit);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al buscar leads');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Lead Scraper</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="query" className="mb-1 block text-sm font-medium text-gray-700">
            Rubro
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ej: servicio tecnico celulares"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <div>
          <label htmlFor="limit" className="mb-1 block text-sm font-medium text-gray-700">
            Límite
          </label>
          <input
            id="limit"
            type="number"
            min={5}
            max={50}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 20)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar Leads'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Resultado</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{result.created}</p>
              <p className="text-sm text-gray-600">Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{result.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
