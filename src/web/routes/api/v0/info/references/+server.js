import { json } from '@sveltejs/kit'
import referencesData from '$lib/data/v0/references.json'

/**
 * GET endpoint for references information
 * Returns professional references data
 * @returns {Response} JSON response with references data
 */
export async function GET() {
  return json(referencesData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

