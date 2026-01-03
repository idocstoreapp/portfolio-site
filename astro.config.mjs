// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // ⚠️ IMPORTANTE: Actualiza este dominio con tu URL real antes de hacer deploy
  // Este dominio se usa para generar URLs absolutas en el sitemap y meta tags
  // Ejemplo: site: 'https://jonathanguarirapa.com'
  site: 'https://portfolio-site-blush-one.vercel.app', // Cambia esto por tu dominio real
  
  // Adapter para Vercel (serverless functions)
  // Permite usar export const prerender = false en páginas dinámicas
  output: 'server',
  adapter: vercel(),
  
  integrations: [
    react(),
    sitemap({
      // El sitemap se generará automáticamente en /sitemap.xml
      // Incluye todas las páginas estáticas y dinámicas
    })
  ],
  
  vite: {
    plugins: [tailwindcss()]
  }
});