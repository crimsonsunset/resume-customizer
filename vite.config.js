// eslint-disable-next-line n/no-unpublished-import
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, unlinkSync } from 'node:fs'
import { visualizer } from 'rollup-plugin-visualizer'
import dateUpdaterPlugin from './src/shared/vite-plugin-date-updater.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Shared alias configuration
const aliases = {
  '@': resolve(__dirname, 'src'),
  '@cli': resolve(__dirname, 'src/cli'),
  '@web': resolve(__dirname, 'src/web'),
  '@shared': resolve(__dirname, 'src/shared'),
  '@functions': resolve(__dirname, 'src/functions')
}

export default defineConfig(({ _command, _mode }) => {
  const isCLI = process.env.BUILD_CLI === 'true'
  
  if (isCLI) {
    // CLI build configuration
    return {
      root: '.',
      publicDir: false, // Don't copy public files for CLI build
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
    plugins: [
      sveltekit(),
      dateUpdaterPlugin(),
      // Bundle analyzer - generates bundle-analysis.html
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false, // Don't auto-open browser
        gzipSize: true,
        brotliSize: true,
        template: 'treemap' // Shows bundle composition as treemap
      }),
      // Custom plugin to exclude Netlify config files from being copied to build
      {
        name: 'exclude-netlify-configs',
        apply: 'build',
        writeBundle() {
          // Remove _redirects and _headers from build output if they exist
          const buildDir = 'public'
          const filesToRemove = ['_redirects', '_headers']
          
          for (const file of filesToRemove) {
            const filePath = resolve(buildDir, file)
            try {
              if (existsSync(filePath)) {
                unlinkSync(filePath)
                console.log(`✓ Removed ${file} from build output (should be in project root)`)
              }
            } catch {
              // Ignore errors, files might not exist
            }
          }
        }
      }
    ],
    
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
