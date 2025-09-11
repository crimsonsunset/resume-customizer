import { error } from '@sveltejs/kit'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { GOTENBERG_URL } from '$env/static/private'

/**
 * Load CSS template based on preset name with fallback
 * @param {string} preset - The preset name (e.g., 'one-page', 'technical')
 * @param {boolean} debug - Whether to load debug version with visual boundaries
 * @returns {Promise<string>} CSS content
 */
async function loadCssTemplate(preset, debug = false) {
  try {
    const debugSuffix = debug ? '-debug' : ''
    
    // Try preset-specific CSS first: preset-name.css or preset-name-debug.css
    if (preset && preset !== 'full') {
      try {
        const presetCssPath = path.join(process.cwd(), 'input', 'templates', `${preset}${debugSuffix}.css`)
        const css = await readFile(presetCssPath, 'utf8')
        console.log(`✅ Loaded preset CSS: ${preset}${debugSuffix}.css`)
        return css
      } catch {
        console.log(`⚠️ No preset CSS found for ${preset}${debugSuffix}, using default`)
      }
    }
    
    // Fallback to default resume-styles.css or resume-styles-debug.css
    const defaultCssPath = path.join(process.cwd(), 'input', 'templates', `resume-styles${debugSuffix}.css`)
    const css = await readFile(defaultCssPath, 'utf8')
    console.log(`✅ Loaded default CSS: resume-styles${debugSuffix}.css`)
    return css
  } catch (error_) {
    console.error('❌ Failed to load CSS template:', error_.message)
    throw new Error(`Could not load CSS template: ${error_.message}`)
  }
}

/**
 * Gotenberg PDF generation endpoint - mirrors the Playwright version
 */
export async function POST({ request }) {
  try {
    // Check if Gotenberg URL is configured
    if (!GOTENBERG_URL) {
      throw new Error('GOTENBERG_URL environment variable is not set')
    }
    
    const { html, preset = 'full', css, cssMethod = 'css', filename = 'resume-gotenberg.pdf', themeColors, debug = false } = await request.json()
    
    if (!html) {
      // If no HTML provided, run simple test
      const testHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test PDF</title>
</head>
<body>
  <h1>🧪 Gotenberg Test</h1><p>This PDF was generated using Gotenberg!</p>
</body>
</html>`
      
       const formData = new FormData()
       formData.append('files', new Blob([testHtml], { type: 'text/html' }), 'index.html')
       
       const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Gotenberg failed: ${response.status}`)
      }
      
             const pdfBuffer = await response.arrayBuffer()
       return new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="gotenberg-test.pdf"'
        }
      })
    }
    
    console.log(`🧪 Generating PDF with Gotenberg - method: ${cssMethod}, preset: ${preset}${debug ? ' (DEBUG MODE)' : ''}`)
    if (themeColors) {
      console.log(`🎨 Applying theme colors: Primary=${themeColors.primary}, Secondary=${themeColors.secondary}`)
    }
    
    // Determine CSS based on method (same logic as Playwright version)
    let finalCss = cssMethod === 'preset' 
      ? await loadCssTemplate(preset, debug)  // Use preset-based CSS loading
      : css || await loadCssTemplate(preset, debug)  // Use direct CSS for compatibility
    
    // Apply theme colors to CSS if provided
    if (themeColors && finalCss) {
      // Replace CSS color variables with theme colors
      finalCss = finalCss.replace(/--color-primary:\s*[^;]+;/g, `--color-primary: ${themeColors.primary};`)
      finalCss = finalCss.replace(/--color-secondary:\s*[^;]+;/g, `--color-secondary: ${themeColors.secondary};`)
      console.log(`🎨 Theme colors applied to CSS`)
    }
    
    // Process HTML the same way as Playwright version
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
    
    // Create form data for Gotenberg
    const formData = new FormData()
    formData.append('files', new Blob([processedHtml], { type: 'text/html' }), 'index.html')
    
    // Send to Gotenberg with minimal compression to fit one page
    console.log(`📡 Sending resume to Gotenberg...`)
    
    // Add minimal scaling to compress content slightly
    formData.append('scale', '0.97')  // 2% smaller to fit better
    formData.append('marginTop', '0.1')
    formData.append('marginBottom', '0.1')
    formData.append('marginLeft', '0.1')
    formData.append('marginRight', '0.1')
    
    const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Gotenberg failed: ${response.status}`)
    }
    
    const pdfBuffer = await response.arrayBuffer()
    console.log('✅ Gotenberg PDF generation successful')
    
    // Return PDF as download
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error_) {
    console.error('❌ Gotenberg PDF generation failed:', error_)
    throw error(500, `Gotenberg PDF generation failed: ${error_.message}`)
  }
} 
