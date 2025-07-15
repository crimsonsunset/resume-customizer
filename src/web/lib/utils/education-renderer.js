import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Education-specific renderer
 * Handles education entries with institution, degree, and activities
 */
export class EducationRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Education',
      sectionType: 'education',
      groupBy: null, // No grouping needed for education
      filterStrategy: EducationRenderer.educationFilterStrategy,
      itemRenderer: EducationRenderer.educationItemRenderer,
      ...options
    })
  }

  /**
   * Education-specific item renderer
   */
  static educationItemRenderer(education) {
    const institutionHeader = education.institution ? `<h3>${education.institution}</h3>` : ''
    const degreeHeader = education.degree ? `<h4>${education.degree}</h4>` : ''
    
    // Combine description and activities into bullet points
    const allBullets = EducationRenderer.parseActivities(education)
    const bulletsList = allBullets.length > 0 ? SectionRenderer.renderBullets(allBullets) : ''
    
    return [institutionHeader, degreeHeader, bulletsList].filter(Boolean).join('\n')
  }

  /**
   * Parse description and activities into bullet points
   */
  static parseActivities(education) {
    const bullets = []
    
    // Add description as a bullet point if it exists (e.g., "Minor in General Engineering")
    if (education.description && education.description.trim()) {
      bullets.push(education.description.trim())
    }
    
    // Parse activities string into individual items
    if (education.activities && education.activities.trim()) {
      const activityString = education.activities
        .replace(/^Activities and societies:\s*/i, '')
        .trim()
      
      if (activityString) {
        // Split by comma and clean up each activity
        const activityItems = activityString
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0)
        
        bullets.push(...activityItems)
      }
    }
    
    return bullets
  }

  /**
   * Education-specific filtering (basic for now)
   */
  static educationFilterStrategy(education, config) {
    // Handle case where education is not an array or is empty
    if (!Array.isArray(education) || education.length === 0) {
      return []
    }
    
    let filtered = [...education]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || education.preset_filters || {}
    
    // Apply limit if specified
    const maxEntries = filters.max_entries || filters.education_limit
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
  }
} 