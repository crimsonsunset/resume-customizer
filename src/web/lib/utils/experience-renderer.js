import { SectionRenderer } from '@web/lib/utils/section-renderer.js'
import { parseExperienceDateRange } from '@shared/date-utils.js'

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
    
    this.bulletDensity = bulletDensity
    this.config = config
  }

  /**
   * Main render method with empty detection
   */
  render(experiences, config = {}) {
    const filteredExperiences = this.filterStrategy(experiences, config)
    
    // Check if any experience has bullets after filtering
    const experiencesWithContent = filteredExperiences.filter(experience => {
      const filteredBullets = SectionRenderer.filterBulletsWithConfig(
        experience.bulletPoints,
        experience.bullet_priorities,
        this.bulletDensity,
        config
      )
      return filteredBullets.length > 0
    })

    // If no experiences have content, return empty
    if (experiencesWithContent.length === 0) {
      return ''
    }
    
    const groupedExperiences = this.groupData(experiencesWithContent)
    const content = groupedExperiences.map(group => this.renderGroup(group)).join('\n')
    
    return this.renderSectionWrapper(this.sectionLabel, content, this.sectionType)
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
    
    // Apply timeframe filtering first (if specified)
    if (filters.timeframeYears && filters.timeframeYears > 0) {
      const cutoffDate = new Date()
      cutoffDate.setFullYear(cutoffDate.getFullYear() - filters.timeframeYears)
      
      filtered = filtered.filter(exp => {
        const dateRange = parseExperienceDateRange(exp.duration)
        if (!dateRange?.endDate) {
          return true // Keep entries we can't parse
        }
        
        // Keep if end date is after cutoff (recent enough)
        return dateRange.endDate >= cutoffDate
      })
      
      console.log(`💼 Experience timeframe filter: showing last ${filters.timeframeYears} years (${filtered.length}/${experiences.length} entries)`)
    }
    
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