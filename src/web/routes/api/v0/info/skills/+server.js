import { json } from '@sveltejs/kit'
import skillsData from '$lib/data/v0/skills.json'

/**
 * GET endpoint for skills information
 * Returns skills data
 * @returns {Response} JSON response with skills data
 */
export async function GET() {
  return json(skillsData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

