/**
 * SvelteKit server hooks
 * Handles cross-cutting concerns like CORS headers
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization'
}

/**
 * Handle hook - intercepts all requests
 * Automatically adds CORS headers to API routes
 * @param {Object} params
 * @param {Request} params.event - The request event
 * @param {Function} params.resolve - Function to resolve the request
 * @returns {Promise<Response>}
 */
export async function handle({ event, resolve }) {
  // Check if this is an API route
  const isApiRoute = event.url.pathname.startsWith('/api/')

  if (isApiRoute) {
    // Handle OPTIONS preflight requests
    if (event.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      })
    }

    // For other methods, get the response and add CORS headers
    const response = await resolve(event)

    // Add CORS headers to the response
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  // For non-API routes, pass through unchanged
  return resolve(event)
}

