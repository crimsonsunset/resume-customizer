/* eslint-disable unicorn/prefer-module */
const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')
const { readFile } = require('node:fs/promises')
const path = require('node:path')

/**
 * Load CSS template based on preset name with fallback
 * @param {string} preset - The preset name (e.g., 'one-page', 'technical')
 * @returns {Promise<string>} CSS content
 */
async function loadCssTemplate(preset) {
  try {
    console.log('🔍 Loading CSS template for preset:', preset)
    console.log('📁 Current working directory:', process.cwd())
    console.log('📁 Function directory:', __dirname)
    
    // Try preset-specific CSS first: preset-name.css
    if (preset && preset !== 'full') {
      try {
        // Try multiple possible paths for Netlify Functions
        const possiblePaths = [
          path.join(process.cwd(), 'input', 'templates', `${preset}.css`),
          path.join(__dirname, '..', '..', 'input', 'templates', `${preset}.css`),
          path.join('/opt/build/repo/input/templates', `${preset}.css`), // Netlify build path
        ]
        
        for (const cssPath of possiblePaths) {
          try {
            console.log('🔍 Trying path:', cssPath)
            const css = await readFile(cssPath, 'utf8')
            console.log(`✅ Loaded preset CSS: ${preset}.css from ${cssPath}`)
            return css
          } catch (pathError) {
            console.log(`⚠️ Failed to load from ${cssPath}:`, pathError.message)
          }
        }
        
        console.log(`⚠️ No preset CSS found for ${preset}, using default`)
      } catch (presetError) {
        console.log(`⚠️ Error loading preset CSS:`, presetError.message)
      }
    }
    
    // Fallback to default resume-styles.css
    const possibleDefaultPaths = [
      path.join(process.cwd(), 'input', 'templates', 'resume-styles.css'),
      path.join(__dirname, '..', '..', 'input', 'templates', 'resume-styles.css'),
      path.join('/opt/build/repo/input/templates', 'resume-styles.css'), // Netlify build path
    ]
    
    for (const cssPath of possibleDefaultPaths) {
      try {
        console.log('🔍 Trying default path:', cssPath)
        const css = await readFile(cssPath, 'utf8')
        console.log(`✅ Loaded default CSS: resume-styles.css from ${cssPath}`)
        return css
      } catch (pathError) {
        console.log(`⚠️ Failed to load default from ${cssPath}:`, pathError.message)
      }
    }
    
    // If no CSS files found, return minimal CSS
    console.log('⚠️ No CSS templates found, using minimal fallback')
    return `
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      h1, h2, h3 { margin-top: 0; }
      .resume-content { max-width: 800px; margin: 0 auto; }
    `
    
  } catch (error) {
    console.error('❌ Failed to load CSS template:', error.message)
    console.error('❌ Stack trace:', error.stack)
    // Return minimal CSS instead of throwing
    return `
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      h1, h2, h3 { margin-top: 0; }
      .resume-content { max-width: 800px; margin: 0 auto; }
    `
  }
}

/**
 * Get browser instance optimized for Netlify Functions
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
async function getBrowser() {
  console.log('🔄 Launching browser with @sparticuz/chromium...')
  
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })
}

/**
 * Generate PDF from HTML content using Netlify-optimized browser
 * @param {Object} event - Netlify Function event
 * @param {Object} context - Netlify Function context
 * @returns {Object} Response with PDF or error
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    }
  }

  try {
    console.log('🎯 Netlify Function: Starting PDF generation...')
    
    // Parse request body
    const { html, preset = 'full', filename = 'resume.pdf' } = JSON.parse(event.body)
    
    if (!html) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'HTML content is required' })
      }
    }
    
    console.log(`🎯 Generating PDF with preset: ${preset}, filename: ${filename}`)
    
    // Load CSS template server-side (with better error handling)
    const finalCss = await loadCssTemplate(preset)
    
    // Inject CSS into HTML (same logic as original)
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
    
    console.log('🚀 Launching browser...')
    const browser = await getBrowser()
    const page = await browser.newPage()
    
    console.log('📄 Setting content and generating PDF...')
    // Set content and wait for rendering
    await page.setContent(processedHtml, { waitUntil: 'networkidle0' })
    
    // Generate PDF with same settings as CLI/original API
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
    
    // Return PDF as base64 for Netlify Functions
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    }
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: `PDF generation failed: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
} 