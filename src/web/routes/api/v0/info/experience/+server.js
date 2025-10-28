import { json } from '@sveltejs/kit'
import experienceData from '$lib/data/v0/experience.json'

/**
 * GET endpoint for experience information
 * Returns professional experience data
 * @returns {Response} JSON response with experience data
 */
export async function GET() {
  return json(experienceData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

