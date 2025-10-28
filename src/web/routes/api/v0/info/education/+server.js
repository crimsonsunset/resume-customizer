import { json } from '@sveltejs/kit'
import educationData from '$lib/data/v0/education.json'

/**
 * GET endpoint for education information
 * Returns education background data
 * @returns {Response} JSON response with education data
 */
export async function GET() {
  return json(educationData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

