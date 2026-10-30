import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://plumario.trek-peru.com',
  devToolbar: { enabled: false },
  // El CSS va dentro del HTML: en móvil evita un viaje de red antes del primer pintado.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/gracias/') })],
  vite: { plugins: [tailwindcss()] },
});
