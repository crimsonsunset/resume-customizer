import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { error } from '@sveltejs/kit'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Load CSS template based on preset name with fallback
 * @param {string} preset - The preset name (e.g., 'one-page', 'technical')
 * @returns {Promise<string>} CSS content
 */
async function loadCssTemplate(preset) {
  try {
    // Try preset-specific CSS first: preset-name.css
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
    
    // Fallback to default resume-styles.css
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
 * Get browser instance optimized for serverless environment
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
async function getBrowser() {
  // Use full puppeteer locally, @sparticuz/chromium in production
  if (process.env.NODE_ENV === 'development') {
    // Local development - try system Chrome first
    try {
      return puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // macOS
      })
    } catch (error_) {
      console.log('⚠️ System Chrome not found, falling back to serverless mode:', error_.message)
      // Fallback to serverless mode even in development
    }
  }
  
  // Production or fallback - use @sparticuz/chromium for serverless
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
}

/**
 * Generate PDF from HTML content using serverless-optimized browser
 * @param {Request} request - The request object containing HTML, preset/css, and filename
 * @returns {Response} PDF file as response
 */
export async function POST({ request }) {
  try {
    const { html, preset = 'full', css, cssMethod = 'css', filename = 'resume.pdf' } = await request.json()
    
    if (!html) {
      throw error(400, 'HTML content is required')
    }
    
    console.log(`🎯 Generating PDF with method: ${cssMethod}, preset: ${preset}`)
    
    // Determine CSS based on method
    const finalCss = cssMethod === 'preset' 
      ? await loadCssTemplate(preset)  // Use preset-based CSS loading (new method)
      : css || await loadCssTemplate(preset)  // Use direct CSS (original method for compatibility)
    
    // Inject CSS into HTML like the CLI does
    let processedHtml = html
    if (finalCss) {
      // Add CSS before closing </head> tag or create head if doesn't exist
      processedHtml = processedHtml.includes('</head>') 
        ? processedHtml.replace('</head>', `<style>${finalCss}</style></head>`)
        : processedHtml.replace('<html>', `<html><head><style>${finalCss}</style></head>`)
    }
    
    // Ensure we have a proper HTML document structure
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
    
    // Launch serverless-optimized browser
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    // Set content and wait for rendering
    await page.setContent(processedHtml, { waitUntil: 'networkidle0' })
    
    // Generate PDF with same settings as CLI
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
    
    console.log(`✅ PDF generated successfully: ${filename}`)
    
    // Return PDF as download
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error_) {
    console.error('❌ PDF generation error:', error_)
    throw error(500, `PDF generation failed: ${error_.message}`)
  }
} 