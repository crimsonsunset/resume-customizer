import adapter from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    
    // Configure the app directory to be in src/web
    appDir: 'src/web',
    
    // Files configuration
    files: {
      assets: 'static',
      hooks: {
        client: 'src/web/hooks.client.js',
        server: 'src/web/hooks.server.js'
      },
      lib: 'src/web/lib',
      params: 'src/web/params',
      routes: 'src/web/routes',
      serviceWorker: 'src/web/service-worker.js',
      appTemplate: 'src/web/app.html'
    },
    
    // Alias configuration (matches vite.config.js)
    alias: {
      '@': 'src',
      '@cli': 'src/cli',
      '@web': 'src/web',
      '@shared': 'src/shared',
      '@functions': 'src/functions'
    }
  }
}

export default config 