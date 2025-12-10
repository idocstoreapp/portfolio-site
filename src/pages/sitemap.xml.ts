import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('site is not defined in astro.config.mjs');
  }

  // Obtener todos los proyectos dinámicamente
  const projects = await getCollection('projects');
  
  // Páginas estáticas principales
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'weekly' },
    { path: '/servicios', priority: '0.9', changefreq: 'monthly' },
    { path: '/proyectos', priority: '0.9', changefreq: 'weekly' },
    { path: '/projects', priority: '0.9', changefreq: 'weekly' },
    { path: '/contacto', priority: '0.8', changefreq: 'monthly' },
    { path: '/sobre-mi', priority: '0.7', changefreq: 'monthly' },
    { path: '/demos/landing-basica', priority: '0.6', changefreq: 'monthly' },
    { path: '/demos/restaurante', priority: '0.6', changefreq: 'monthly' },
    { path: '/demos/forms', priority: '0.6', changefreq: 'monthly' },
  ];

  // Generar URLs de proyectos
  const projectUrls = projects.map(project => ({
    path: `/projects/${project.slug}`,
    priority: project.data.featured ? '0.8' : '0.7',
    changefreq: 'monthly',
    lastmod: project.data.publishedAt ? new Date(project.data.publishedAt).toISOString() : new Date().toISOString()
  }));

  // También incluir rutas en español si existen
  const projectUrlsEs = projects.map(project => ({
    path: `/proyectos/${project.slug}`,
    priority: project.data.featured ? '0.8' : '0.7',
    changefreq: 'monthly',
    lastmod: project.data.publishedAt ? new Date(project.data.publishedAt).toISOString() : new Date().toISOString()
  }));

  // Combinar todas las URLs
  const allUrls = [
    ...staticPages.map(p => ({ ...p, lastmod: new Date().toISOString() })),
    ...projectUrls,
    ...projectUrlsEs
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${allUrls.map((url) => `
  <url>
    <loc>${site}${url.path}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
