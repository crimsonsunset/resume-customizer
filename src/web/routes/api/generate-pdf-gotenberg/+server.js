import { error } from '@sveltejs/kit'

/**
 * Test Gotenberg PDF generation endpoint
 */
export async function POST({ request }) {
  try {
    const { html = '<h1>Test</h1>' } = await request.json()
    
    console.log('🧪 Testing Gotenberg connection...')
    
    // Create simple HTML document
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test PDF</title>
</head>
<body>
  ${html}
</body>
</html>`
    
    // Create form data for Gotenberg
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const formData = new FormData()
    formData.append('files', new Blob([fullHtml], { type: 'text/html' }), 'index.html')
    
    // Send to Gotenberg
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const response = await fetch('http://localhost:5555/forms/chromium/convert/html', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Gotenberg failed: ${response.status}`)
    }
    
    const pdfBuffer = await response.arrayBuffer()
    console.log('✅ Gotenberg test successful')
    
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"'
      }
    })
    
  } catch (error_) {
    console.error('❌ Gotenberg test failed:', error_)
    throw error(500, `Gotenberg test failed: ${error_.message}`)
  }
} 