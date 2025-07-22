/* eslint-disable n/no-unsupported-features/node-builtins */
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Load CSS template based on preset name with fallback
 * @param {string} preset - The preset name (e.g., 'one-page', 'technical')
 * @returns {Promise<string>} CSS content
 */
async function loadCssTemplate(preset) {
  try {
    console.log('🔍 Loading CSS template for preset:', preset)
    console.log('📁 Current working directory:', process.cwd())
    
    // Get current directory for ES modules
    const currentFile = fileURLToPath(import.meta.url)
    const currentDir = path.dirname(currentFile)
    
    // Determine input directory based on environment
    let inputDir
    if (process.env.NETLIFY_DEV || process.env.NETLIFY) {
      // In Netlify function environment, look for input at the function root
      inputDir = path.resolve(process.cwd(), 'input')
      if (!existsSync(inputDir)) {
        // Fallback for bundled functions - input might be at different location
        inputDir = path.resolve(currentDir, 'input')
      }
    } else {
      // Local development - use relative path
      inputDir = path.resolve(currentDir, '../../input')
    }
    
    console.log('📁 Input directory:', inputDir)
    
    // Try preset-specific CSS first: preset-name.css
    if (preset && preset !== 'full') {
      try {
        // Try multiple possible paths for Netlify Functions
        const possiblePaths = [
          path.join(inputDir, 'templates', `${preset}.css`),
          path.join(process.cwd(), 'input', 'templates', `${preset}.css`),
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
      path.join(inputDir, 'templates', 'resume-styles.css'),
      path.join(process.cwd(), 'input', 'templates', 'resume-styles.css'),
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
  
  // Use environment variable for local development, chromium.executablePath() for production
  const executablePath = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath()
  
  console.log('☁️ Chromium executable path:', executablePath.slice(0, 50) + '...')
  
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  })
  
  console.log('✅ Browser launched successfully')
  return browser
}

/**
 * Modern Netlify Functions handler for PDF generation
 * @param {Request} request - The incoming request
 * @param {import('@netlify/functions').Context} context - The function context
 * @returns {Promise<Response>} PDF response
 */
export default async function generatePDF(request, context) {
  console.log('🎯 Modern Netlify Function: Starting PDF generation...')
  
  // Log environment info for debugging
  console.log('🌍 Environment check:', {
    NETLIFY_DEV: process.env.NETLIFY_DEV,
    NODE_ENV: process.env.NODE_ENV,
    CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH ? 'Set' : 'Not set'
  })
  
  let browser = null
  
  try {
    // Parse request data
    const data = await request.json()
    const { html, preset = 'one-page', filename = 'resume.pdf' } = data
    
    console.log(`🎯 Generating PDF with preset: ${preset}, filename: ${filename}`)
    
    if (!html) {
      return new Response(JSON.stringify({ error: 'HTML content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Load CSS template
    const cssContent = await loadCssTemplate(preset)
    
    // Launch browser
    browser = await getBrowser()
    
    // Create new page and set content
    const page = await browser.newPage()
    
    // Inject CSS and HTML content
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${cssContent}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `
    
    await page.setContent(fullHtml, { 
      waitUntil: 'networkidle0',
      timeout: 15_000
    })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    })
    
    console.log('✅ PDF generated successfully')
    
    // Return PDF response
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdf.length.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ PDF generation error:', error)
    
    return new Response(JSON.stringify({ 
      error: `PDF generation failed: ${error.message}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } finally {
    // Always clean up the browser
    if (browser) {
      try {
        await browser.close()
        console.log('🧹 Browser closed successfully')
      } catch (closeError) {
        console.warn('⚠️ Error closing browser:', closeError.message)
      }
    }
  }
} 