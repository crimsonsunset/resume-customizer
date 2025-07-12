import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Volunteering-specific renderer
 * Handles volunteer experience with role, organization, duration, and description
 */
export class VolunteeringRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Volunteering',
      groupBy: 'organization',
      filterStrategy: VolunteeringRenderer.volunteeringFilterStrategy,
      itemRenderer: VolunteeringRenderer.volunteeringItemRenderer,
      ...options
    })
  }

  /**
   * Volunteering-specific item renderer
   */
  static volunteeringItemRenderer(volunteering) {
    const description = volunteering.description ? `<p class="description">${volunteering.description}</p>` : ''
    const link = volunteering.link ? `<p class="link"><a href="${volunteering.link}" target="_blank">${volunteering.link_title || 'Learn more'}</a></p>` : ''
    
    return `<div class="job-title-header">
  <h4>${volunteering.role}</h4>
  <p class="date-range">${volunteering.duration}</p>
</div>
${description}
${link}`
  }

  /**
   * Volunteering-specific filtering
   */
  static volunteeringFilterStrategy(volunteering, config) {
    let filtered = [...volunteering]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || volunteering.preset_filters || {}
    
    // Apply category filtering if specified
    if (filters.category_filter) {
      filtered = filtered.filter(vol => 
        vol.category && vol.category.toLowerCase().includes(filters.category_filter.toLowerCase())
      )
    }
    
    // Apply volunteer limit (check both config paths)
    const maxEntries = filters.volunteering_limit || filters.max_entries
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
  }
} 