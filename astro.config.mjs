import { defineConfig } from 'astro/config';

export default defineConfig({
  // The live address; share previews need full links. Update if a custom domain is added.
  site: 'https://harrison-portfolio-seven.vercel.app',
  output: 'static',
  server: { host: true },
  devToolbar: { enabled: false },
});
