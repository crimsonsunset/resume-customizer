import { dev } from '$app/environment'
import { error } from '@sveltejs/kit'

// Import the original logic for development
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Load CSS template based on preset name with fallback (development only)
 */
async function loadCssTemplate(preset) {
  try {
    if (preset && preset !== 'full') {
      try {
        const presetCssPath = path.join(process.cwd(), 'input', 'templates', `${preset}.css`)
        const css = await readFile(presetCssPath, 'utf8')
        console.log(`✅ Loaded preset CSS: ${preset}.css`)
        return css
      } catch {
        console.log(`⚠️ No preset CSS found for ${preset}, using default`)
      }
    }
    
    const defaultCssPath = path.join(process.cwd(), 'input', 'templates', 'resume-styles.css')
    const css = await readFile(defaultCssPath, 'utf8')
    console.log('✅ Loaded default CSS: resume-styles.css')
    return css
  } catch (error_) {
    console.error('❌ Failed to load CSS template:', error_.message)
    throw new Error(`Could not load CSS template: ${error_.message}`)
  }
}

/**
 * Get browser instance for development
 */
async function getBrowserDev() {
  // In development, try system Chrome first, fall back to chromium
  if (process.env.NODE_ENV === 'development') {
    try {
      return puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // macOS
      })
    } catch {
      console.log('⚠️ System Chrome not found, using chromium')
    }
  }
  
  // Fallback to chromium
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
}

/**
 * Development PDF generation (supports both CSS approaches)
 */
async function generatePdfDev(html, preset, css, cssMethod, _filename) {
  console.log('🔧 Development mode: generating PDF locally')
  console.log(`🎨 CSS method: ${cssMethod}, preset: ${preset}`)
  
  // Determine final CSS based on method
  const finalCss = cssMethod === 'preset' 
    ? await loadCssTemplate(preset)  // Server-side CSS template
    : css || await loadCssTemplate(preset)  // Frontend CSS or fallback to template
  
  let processedHtml = html
  if (finalCss) {
    processedHtml = processedHtml.includes('</head>') 
      ? processedHtml.replace('</head>', `<style>${finalCss}</style></head>`)
      : processedHtml.replace('<html>', `<html><head><style>${finalCss}</style></head>`)
  }
  
  if (!processedHtml.includes('<!DOCTYPE html>')) {
    processedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${finalCss ? `<style>${finalCss}</style>` : ''}
</head>
<body>
  ${html}
</body>
</html>`
  }
  
  const browser = await getBrowserDev()
  const page = await browser.newPage()
  
  await page.setContent(processedHtml, { waitUntil: 'networkidle0' })
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.1in',
      right: '0.1in', 
      bottom: '0.1in',
      left: '0.1in'
    },
    preferCSSPageSize: true
  })
  
  await browser.close()
  
  return pdf
}

/**
 * Proxy to Netlify Function in production
 */
async function proxyToNetlifyFunction(request) {
  console.log('🌐 Production mode: proxying to Netlify Function')
  
  // Get the request body
  const requestBody = await request.text()
  
  // Determine the function URL based on environment
  const functionUrl = `${request.url.split('/api/generate-pdf')[0]}/.netlify/functions/generate-pdf`
  
  console.log('📡 Proxying to:', functionUrl)
  
  // Forward the request to the Netlify Function
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: requestBody
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ Netlify Function error:', response.status, errorText)
    throw new Error(`Netlify Function failed: ${response.status} ${errorText}`)
  }
  
  return response
}

/**
 * Main POST handler - routes based on environment
 */
export async function POST({ request }) {
  try {
    console.log(`🎯 PDF Generation API called in ${dev ? 'development' : 'production'} mode`)
    
    if (dev) {
      // Development: Use local PDF generation with both CSS methods
      const { html, preset = 'full', css, cssMethod = 'css', filename = 'resume.pdf' } = await request.json()
      
      if (!html) {
        throw error(400, 'HTML content is required')
      }
      
      const pdf = await generatePdfDev(html, preset, css, cssMethod, filename)
      
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      return new Response(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }
    
    // Production: Proxy to Netlify Function (fail outright if it fails)
    const response = await proxyToNetlifyFunction(request)
    
    // Return the response from the Netlify Function as-is
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    })
      
  } catch (error_) {
    console.error('❌ PDF generation error:', error_)
    throw error(500, `PDF generation failed: ${error_.message}`)
  }
} 