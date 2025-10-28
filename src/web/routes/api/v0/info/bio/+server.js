import { json } from '@sveltejs/kit'
import bioData from '$lib/data/v0/bio.json'

/**
 * GET endpoint for bio information
 * Returns biographical timeline data
 * @returns {Response} JSON response with bio data
 */
export async function GET() {
  return json(bioData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

