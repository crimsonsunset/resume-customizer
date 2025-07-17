import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Experience-specific renderer
 */
export class ExperienceRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    const config = options.config || {}
    
    super({
      sectionLabel: 'Experience',
      sectionType: 'experience',
      groupBy: 'company',
      filterStrategy: ExperienceRenderer.experienceFilterStrategy,
      itemRenderer: (experience) => ExperienceRenderer.experienceItemRenderer(experience, bulletDensity, config),
      ...options
    })
  }

  /**
   * Experience-specific item renderer (static method with bulletDensity and config parameters)
   */
  static experienceItemRenderer(experience, bulletDensity = 100, config = {}) {
    const bullets = SectionRenderer.filterBulletsWithConfig(
      experience.bulletPoints, 
      experience.bullet_priorities, 
      bulletDensity, 
      config
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
    
    // Apply index-based selection (replaces max_entries)
    if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
      filtered = filters.selected_indices
        .filter(index => index >= 0 && index < experiences.length)
        .map(index => experiences[index])
    }
    
    return filtered
  }
} 