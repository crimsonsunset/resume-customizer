import { readFileSync } from 'node:fs'
import path from 'node:path'

export async function load() {
  try {
    // Read the resume HTML file
    const resumeHtmlPath = path.join(process.cwd(), 'output', 'resume-wiped.html')
    const resumeHtml = readFileSync(resumeHtmlPath, 'utf8')
    
    // Extract just the body content (excluding <html>, <head>, etc.)
    const bodyMatch = resumeHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const resumeContent = bodyMatch ? bodyMatch[1] : resumeHtml
    
    return {
      resumeContent: resumeContent.trim()
    }
  } catch (error) {
    console.error('Error loading resume HTML:', error)
    return {
      resumeContent: '<p>Error loading resume content</p>'
    }
  }
} 