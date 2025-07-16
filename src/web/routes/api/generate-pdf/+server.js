import { chromium } from 'playwright'
import { error } from '@sveltejs/kit'

/**
 * Generate PDF from HTML content using Playwright
 * @param {Request} request - The request object containing HTML and CSS
 * @returns {Response} PDF file as response
 */
export async function POST({ request }) {
  try {
    const { html, css, filename = 'resume.pdf' } = await request.json()
    
    if (!html) {
      throw error(400, 'HTML content is required')
    }
    
    // Inject CSS into HTML like the CLI does
    let processedHtml = html
    if (css) {
      // Add CSS before closing </head> tag or create head if doesn't exist
      processedHtml = processedHtml.includes('</head>') 
        ? processedHtml.replace('</head>', `<style>${css}</style></head>`)
        : processedHtml.replace('<html>', `<html><head><style>${css}</style></head>`)
    }
    
    // Ensure we have a proper HTML document structure
    if (!processedHtml.includes('<!DOCTYPE html>')) {
      processedHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${css ? `<style>${css}</style>` : ''}
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
    
    // Return PDF as download
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error_) {
    console.error('PDF generation error:', error_)
    throw error(500, `PDF generation failed: ${error_.message}`)
  }
} 