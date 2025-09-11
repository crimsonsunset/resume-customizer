import { chromium } from 'playwright'
import { error } from '@sveltejs/kit'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

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
 * Generate PDF from HTML content using Playwright
 * @param {Request} request - The request object containing HTML, preset/css, and filename
 * @returns {Response} PDF file as response
 */
export async function POST({ request }) {
  try {
    const { html, preset = 'full', css, cssMethod = 'css', filename = 'resume.pdf', themeColors, debug = false } = await request.json()
    
    if (!html) {
      throw error(400, 'HTML content is required')
    }
    
    console.log(`🎯 Generating PDF with method: ${cssMethod}, preset: ${preset}${debug ? ' (DEBUG MODE)' : ''}`)
    if (themeColors) {
      console.log(`🎨 Applying theme colors: Primary=${themeColors.primary}, Secondary=${themeColors.secondary}`)
    }
    
    // Determine CSS based on method
    let finalCss = cssMethod === 'preset' 
      ? await loadCssTemplate(preset, debug)  // Use preset-based CSS loading (new method)
      : css || await loadCssTemplate(preset, debug)  // Use direct CSS (original method for compatibility)
    
    // Apply theme colors to CSS if provided
    if (themeColors && finalCss) {
      // Replace CSS color variables with theme colors
      finalCss = finalCss.replace(/--color-primary:\s*[^;]+;/g, `--color-primary: ${themeColors.primary};`)
      finalCss = finalCss.replace(/--color-secondary:\s*[^;]+;/g, `--color-secondary: ${themeColors.secondary};`)
      console.log(`🎨 Theme colors applied to CSS`)
    }
    
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
    
    // Launch Playwright browser (same settings as CLI)
    const browser = await chromium.launch()
    const page = await browser.newPage()
    
    // Set content and wait for rendering
    await page.setContent(processedHtml, { waitUntil: 'networkidle' })
    
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