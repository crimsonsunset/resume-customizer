import { json } from '@sveltejs/kit'
import projectsData from '$lib/data/v0/projects.json'

/**
 * GET endpoint for projects information
 * Returns project data
 * @returns {Response} JSON response with projects data
 */
export async function GET() {
  return json(projectsData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}

