import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Shared alias configuration
const aliases = {
  '@': resolve(__dirname, 'src'),
  '@cli': resolve(__dirname, 'src/cli'),
  '@web': resolve(__dirname, 'src/web'),
  '@shared': resolve(__dirname, 'src/shared'),
  '@functions': resolve(__dirname, 'src/functions')
}

export default defineConfig(({ command, mode }) => {
  const isCLI = process.env.BUILD_CLI === 'true'
  
  if (isCLI) {
    // CLI build configuration
    return {
      root: '.',
      build: {
        outDir: 'dist/cli',
        emptyOutDir: true,
        sourcemap: true,
        lib: {
          entry: resolve(__dirname, 'src/cli/convert.js'),
          name: 'convert',
          fileName: 'convert',
          formats: ['es']
        },
        rollupOptions: {
          external: ['commander', 'chalk', 'playwright', 'node:fs', 'node:path', 'node:child_process', 'node:util']
        }
      },
      resolve: {
        alias: aliases
      }
    }
  }
  
  // SvelteKit web app configuration
  return {
    plugins: [sveltekit()],
    
    // Path aliases (matches tsconfig.json)
    resolve: {
      alias: aliases
    },
    
    // Development server settings
    server: {
      port: 3000,
      open: true,
      // Proxy API calls to Netlify Functions during development
      proxy: {
        '/.netlify/functions': {
          target: 'http://localhost:9999',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/.netlify\/functions/, '')
        }
      }
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
    }
  }
}) 
