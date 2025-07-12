import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Experience-specific renderer
 */
export class ExperienceRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    
    super({
      sectionLabel: 'Experience',
      groupBy: 'company',
      filterStrategy: ExperienceRenderer.experienceFilterStrategy,
      itemRenderer: (experience) => ExperienceRenderer.experienceItemRenderer(experience, bulletDensity),
      ...options
    })
  }

  /**
   * Experience-specific item renderer (static method with bulletDensity parameter)
   */
  static experienceItemRenderer(experience, bulletDensity = 100) {
    const bullets = SectionRenderer.filterBullets(
      experience.bulletPoints,
      experience.bullet_priorities,
      bulletDensity
    )
    
    return `<div class="job-title-header">
  <h4>${experience.title}</h4>
  <p class="date-range">${experience.duration}</p>
</div>
${SectionRenderer.renderBullets(bullets)}`
  }

  /**
   * Experience-specific filtering
   */
  static experienceFilterStrategy(experiences, config) {
    let filtered = [...experiences]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || experiences.preset_filters || {}
    
    // Apply management role filtering
    if (filters.experience_filter === 'management_roles_only') {
      filtered = filtered.filter(exp => {
        const title = exp.title.toLowerCase()
        return title.includes('manager') || 
               title.includes('director') ||
               title.includes('lead') ||
               title.includes('principal')
      })
    }
    
    // Apply experience limit (check both config paths)
    const maxEntries = filters.experience_limit || filters.max_entries
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
  }
} 