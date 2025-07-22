# PDF Generation System Documentation

## Overview

The resume customizer implements a dual-mode PDF generation system designed to work both in local development and production (Netlify Functions). The system converts HTML resume content to PDF using headless Chrome via Puppeteer.

## System Architecture

### Dual Implementation Approach

1. **SvelteKit API Route** (`src/web/routes/api/generate-pdf/+server.js`)
   - Used for local development
   - Accessible at `http://localhost:5173/api/generate-pdf` during `npm run dev`
   - Uses system Chrome when available
   - Full debugging capabilities

2. **Netlify Function** (`netlify/functions/generate-pdf.js`)
   - Used for production deployment
   - Accessible at `/.netlify/functions/generate-pdf`
   - Uses @sparticuz/chromium for serverless environment
   - Modern Netlify Functions API with ES modules

### Key Components

- **@sparticuz/chromium**: Provides Chromium binary for serverless environments
- **puppeteer-core**: Lightweight Puppeteer for controlling headless browser
- **CSS Template System**: Preset-specific styling (one-page.css, etc.)
- **Path Resolution**: Dynamic input directory detection across environments

## Current Status

### ✅ What's Working

1. **Modern Netlify Functions API Implementation**
   - Fixed ES module compatibility issues
   - Proper Request/Response object handling
   - Correct import syntax and file structure

2. **CSS Template Loading**
   - Successfully loads preset-specific CSS (e.g., `one-page.css`)
   - Robust path resolution for different environments
   - Fallback to default `resume-styles.css`

3. **Environment Detection**
   - Correctly identifies local dev vs. Netlify environments
   - Dynamic input directory resolution
   - Environment-specific configuration

4. **SvelteKit Route (Local Development)**
   - Fully functional for local testing
   - Proper error handling and logging

5. **Data Processing**
   - HTML content processing
   - Preset parameter handling
   - CSS injection and styling

### ❌ What's Broken

1. **@sparticuz/chromium Browser Launch**
   - **Error**: `spawn Unknown system error -8`
   - **Location**: `puppeteer.launch()` call in Netlify Function
   - **Impact**: PDF generation fails in production environment
   - **Cause**: Chromium executable spawn failure (potentially macOS/architecture specific)

## File Structure

```
├── netlify/functions/
│   └── generate-pdf.js              # Production Netlify Function
├── src/web/routes/api/generate-pdf/
│   └── +server.js                   # Local development SvelteKit route
├── input/
│   ├── templates/
│   │   ├── one-page.css            # Preset-specific styles
│   │   ├── resume-styles.css       # Default styles
│   │   └── *.css                   # Other preset styles
│   └── profiles/                   # Resume data
├── package.json                    # Contains PDF-related scripts
└── docs/
    └── pdf-generation-system.md   # This documentation
```

## How to Run

### Local Development Testing

```bash
# Start development server with PDF support
npm run dev:pdf
```

This command:
1. Starts the SvelteKit development server
2. Makes PDF generation available at `http://localhost:5173/api/generate-pdf`
3. Uses system Chrome for PDF generation
4. Provides full debugging output

**Test PDF generation locally:**
```bash
curl -X POST http://localhost:5173/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>","preset":"one-page","filename":"test.pdf"}' \
  -o test.pdf
```

### Production Environment Testing

```bash
# Build and test production environment locally
npm run test:prod
```

This command:
1. Stops any running processes
2. Cleans build artifacts
3. Builds both CLI and web components
4. Starts Netlify dev server on port 8080
5. Makes functions available at `http://localhost:8080/.netlify/functions/generate-pdf`

**Test Netlify Function:**
```bash
curl -X POST http://localhost:8080/.netlify/functions/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Test</h1>","preset":"one-page","filename":"test.pdf"}' \
  -o test.pdf
```

### Frontend Integration

The frontend can call PDF generation using:

```javascript
// Development
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: resumeHtml,
    preset: 'one-page',
    filename: 'resume.pdf'
  })
});

// Production (automatically routed by SvelteKit adapter)
// Same code works in production via Netlify Functions
```

## Technical Details

### CSS Template System

The system loads CSS templates based on the `preset` parameter:

1. **Preset-specific CSS**: `input/templates/{preset}.css`
2. **Fallback CSS**: `input/templates/resume-styles.css`
3. **Minimal fallback**: Inline CSS if no templates found

**Path Resolution Logic:**
```javascript
// Multiple paths tried in order:
const possiblePaths = [
  path.join(inputDir, 'templates', `${preset}.css`),
  path.join(process.cwd(), 'input', 'templates', `${preset}.css`),
  path.join('/opt/build/repo/input/templates', `${preset}.css`), // Netlify build path
];
```

### Environment Detection

```javascript
// Determine runtime environment
if (process.env.NETLIFY_DEV || process.env.NETLIFY) {
  // Netlify environment (dev or production)
  inputDir = path.resolve(process.cwd(), 'input');
} else {
  // Local development
  inputDir = path.resolve(__dirname, '../../input');
}
```

### Modern Netlify Functions API

The Netlify Function uses the modern API format:

```javascript
// Modern format (current implementation)
export default async function generatePDF(request, context) {
  const data = await request.json();
  // ... processing
  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
```

## Debugging

### Enable Detailed Logging

The system includes comprehensive logging. Look for these log markers:

- `🎯 Modern Netlify Function: Starting PDF generation...`
- `🔍 Loading CSS template for preset:`
- `🚀 Launching browser...`
- `❌ PDF generation error:`

### Common Issues

1. **Path Resolution Issues**
   - Check `📁 Input directory:` log output
   - Verify CSS file exists at reported path

2. **Browser Launch Issues**
   - Look for `❌ Browser launch failed:` errors
   - Check @sparticuz/chromium installation
   - Verify Node.js version compatibility

3. **ES Module Issues**
   - Ensure `package.json` has `"type": "module"`
   - Check import/export syntax
   - Verify file extensions (.js vs .mjs)

## Known Limitations

1. **@sparticuz/chromium Compatibility**: Current spawn error prevents production PDF generation
2. **Architecture Dependencies**: May have macOS/ARM64 specific issues
3. **Memory Constraints**: Large HTML content may hit Netlify Function limits
4. **Timeout Limits**: Complex PDF generation may exceed function timeout

## Next Steps

1. **Fix @sparticuz/chromium Issue**
   - Investigate alternative chromium packages
   - Test different @sparticuz/chromium versions
   - Consider using puppeteer with bundled chromium

2. **Add Error Recovery**
   - Implement retry logic for failed launches
   - Add graceful degradation options
   - Improve error reporting to frontend

3. **Performance Optimization**
   - Cache chromium instances
   - Optimize CSS loading
   - Reduce function cold start time

## References

- [@sparticuz/chromium Documentation](https://github.com/Sparticuz/chromium)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Puppeteer Documentation](https://pptr.dev/)
- [SvelteKit API Routes](https://kit.svelte.dev/docs/routing#server)

## Troubleshooting Commands

```bash
# Check if chromium can be accessed directly
node -e "import chromium from '@sparticuz/chromium'; console.log(await chromium.executablePath());" --input-type=module

# Test local SvelteKit route
npm run dev:pdf
curl -X POST http://localhost:5173/api/generate-pdf -H "Content-Type: application/json" -d '{"html":"<h1>Test</h1>","preset":"one-page"}'

# Test Netlify Function locally
npm run test:prod
curl -X POST http://localhost:8080/.netlify/functions/generate-pdf -H "Content-Type: application/json" -d '{"html":"<h1>Test</h1>","preset":"one-page"}'

# Check build output
npm run build
ls -la .svelte-kit/output/

# Check Netlify function bundling
netlify build
ls -la .netlify/functions-serve/
``` 