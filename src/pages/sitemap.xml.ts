import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  try {
    if (!site) {
      throw new Error('site is not defined in astro.config.mjs');
    }

    // Asegurar que el site no termine con /
    const baseUrl = site.toString().replace(/\/$/, '');

    // Obtener todos los proyectos dinámicamente
    let projects = [];
    try {
      projects = await getCollection('projects');
    } catch (error) {
      console.error('Error getting projects:', error);
      // Continuar sin proyectos si hay error
    }
    
    // Páginas estáticas principales
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: '/servicios', priority: '0.9', changefreq: 'monthly' },
      { path: '/proyectos', priority: '0.9', changefreq: 'weekly' },
      { path: '/projects', priority: '0.9', changefreq: 'weekly' },
      { path: '/contacto', priority: '0.8', changefreq: 'monthly' },
      { path: '/sobre-nosotros', priority: '0.7', changefreq: 'monthly' },
      { path: '/demos/landing-basica', priority: '0.6', changefreq: 'monthly' },
      { path: '/demos/restaurante', priority: '0.6', changefreq: 'monthly' },
      { path: '/demos/forms', priority: '0.6', changefreq: 'monthly' },
    ];

    // Generar URLs de proyectos
    const projectUrls = projects.map(project => ({
      path: `/projects/${project.slug}`,
      priority: project.data.featured ? '0.8' : '0.7',
      changefreq: 'monthly',
      lastmod: project.data.publishedAt ? new Date(project.data.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    // También incluir rutas en español si existen
    const projectUrlsEs = projects.map(project => ({
      path: `/proyectos/${project.slug}`,
      priority: project.data.featured ? '0.8' : '0.7',
      changefreq: 'monthly',
      lastmod: project.data.publishedAt ? new Date(project.data.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    // Combinar todas las URLs
    const allUrls = [
      ...staticPages.map(p => ({ ...p, lastmod: new Date().toISOString().split('T')[0] })),
      ...projectUrls,
      ...projectUrlsEs
    ];

    // Generar XML del sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((url) => {
  const fullUrl = `${baseUrl}${url.path}`;
  return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`Error generating sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
};
