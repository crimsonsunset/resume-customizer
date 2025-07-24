# PDF Generation System

## Overview

The Resume Customizer uses **Gotenberg** for PDF generation, providing reliable, production-ready PDF exports hosted on Google Cloud Run.

## Architecture

### Production Setup
- **Gotenberg Service**: Deployed on Google Cloud Run (URL via environment variable)
- **API Endpoint**: `/api/generate-pdf-gotenberg`
- **Environment**: **Required** - Must set `GOTENBERG_URL` environment variable

### Development Setup
- **Local Gotenberg**: Can run via Docker at `http://localhost:5555`
- **Environment**: Set `GOTENBERG_URL=http://localhost:5555` for local development

## Components

### 1. API Endpoint (`/api/generate-pdf-gotenberg/+server.js`)
- Handles PDF generation requests
- Loads CSS templates based on preset
- **Theme Color Processing** - Applies DaisyUI theme colors to CSS variables (`--color-primary`, `--color-secondary`)
- Processes HTML with CSS injection
- Uses SvelteKit's `$env/static/private` for environment variables
- Sends requests to Gotenberg service
- Returns PDF download response

### 2. Frontend Integration (`+page.svelte`)
- Main "Download PDF" button uses Gotenberg
- Extracts resume HTML and CSS from page
- **Theme Color Extraction** - Captures current DaisyUI theme colors from `.resume-viewer` element
- Sends data to Gotenberg API endpoint with theme colors
- Handles file download

### 3. CSS Template System
- **Preset-based**: Loads CSS templates from `input/templates/`
- **One-page preset**: Uses `one-page.css` with optimized margins
- **Fallback**: Uses `resume-styles.css` as default

## Gotenberg Configuration

### Parameters Used
- **Scale**: `0.97` (3% compression for better fit)
- **Margins**: `0.1` inches on all sides (minimal margins)
- **Format**: Chromium HTML to PDF conversion

### Environment Variables

**SvelteKit reads environment variables from `.env` files automatically.**

**`.env` file (for development):**
```bash
# Development (local Docker)
GOTENBERG_URL=http://localhost:5555
```

**Netlify Environment Variables (for production):**
```bash
# Production (your deployed instance)
GOTENBERG_URL=https://your-gotenberg-service.run.app
```

**Note:** SvelteKit uses `$env/static/private` for server-side environment variables.

## Google Cloud Run Deployment

### Service Configuration
- **Project**: `resume-pdf-dl`
- **Region**: `us-central1`
- **Image**: `gotenberg/gotenberg:8`
- **Memory**: `1Gi`
- **Timeout**: `300 seconds`
- **Authentication**: Public (unauthenticated)

### Health Check
```bash
curl -f $GOTENBERG_URL/health
```

### Deployment Command
```bash
gcloud run deploy gotenberg \
  --image=gotenberg/gotenberg:8 \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=3000 \
  --memory=1Gi \
  --timeout=300
```

**Note**: After deployment, copy the Service URL from the output and use it for your `GOTENBERG_URL` environment variable.

## Cost & Scaling

### Google Cloud Run Pricing
- **Free Tier**: 2M requests/month + 400K GB-seconds compute
- **Auto-scaling**: Scales to zero when not in use
- **Expected Cost**: $0/month for personal resume generation usage

### Performance
- **Cold Start**: ~2-3 seconds for first request
- **Warm Requests**: ~200-500ms PDF generation
- **Concurrent Requests**: Automatically scales based on demand

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Gotenberg service allows all origins
   - Check network connectivity to Cloud Run service

2. **PDF Generation Failures**
   - Verify HTML structure is valid
   - Check CSS injection is working properly
   - Ensure margins and scaling parameters are appropriate

3. **Environment Configuration**
   - **Development**: Set `GOTENBERG_URL` in `.env` file (SvelteKit reads automatically)
   - **Production**: Set `GOTENBERG_URL` in Netlify environment variables 
   - Verify service is healthy via direct URL health endpoint

### Monitoring
- Check Google Cloud Run logs for service issues
- Monitor cold start times and request latency
- Verify PDF output quality across different presets

## Migration from Playwright

### Benefits
- ✅ **Netlify Compatible**: Works in serverless functions
- ✅ **Cost Effective**: Google Cloud Run free tier
- ✅ **Reliable**: Dedicated PDF service vs browser automation
- ✅ **Scalable**: Auto-scaling based on demand
- ✅ **Maintainable**: External service vs complex browser setup

### Changes Made
1. **API Endpoint**: Created new `/api/generate-pdf-gotenberg`
2. **Frontend**: Updated main PDF button to use Gotenberg
3. **Configuration**: Environment-based URL configuration
4. **Deployment**: Gotenberg service on Google Cloud Run
5. **Documentation**: This comprehensive guide

## Future Improvements

### Potential Enhancements
- **CDN Integration**: Cache static assets for faster PDF generation
- **Custom Fonts**: Add web font loading for better typography
- **Batch Processing**: Support multiple resume formats in single request
- **Analytics**: Track PDF generation usage and performance metrics
- **A/B Testing**: Compare different PDF optimization parameters

### Monitoring & Alerts
- Set up Google Cloud monitoring for service health
- Create alerts for high error rates or latency spikes
- Monitor monthly usage to stay within free tier limits 