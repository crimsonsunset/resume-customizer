import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Honors & Awards-specific renderer
 * Handles awards and honors with title, issuer, date, and description
 * Supports section-level priority filtering based on density
 */
export class HonorsAwardsRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    
    super({
      sectionLabel: 'Honors & Awards',
      sectionType: 'honors-awards',
      groupBy: 'issuer',
      filterStrategy: HonorsAwardsRenderer.honorsAwardsFilterStrategy,
      itemRenderer: HonorsAwardsRenderer.honorsAwardsItemRenderer,
      bulletDensity,
      ...options
    })
    
    this.bulletDensity = bulletDensity
    this.profile = options.profile || null
  }

  /**
   * Override render method to pass profile data to filter strategy
   */
  render(data, config = {}) {
    const filteredData = this.filterStrategy(data, config, this.bulletDensity, this.profile)
    const groupedData = this.groupBy ? this.groupData(filteredData) : [{ items: filteredData }]
    
    // If no data after filtering, return empty
    if (groupedData.every(group => group.items.length === 0)) {
      return ''
    }
    
    return this.renderSectionWrapper(
      this.sectionLabel,
      groupedData.map(group => this.renderGroup(group)).join('\n'),
      this.sectionType
    )
  }

  /**
   * Honors & Awards-specific item renderer
   */
  static honorsAwardsItemRenderer(award) {
    const description = award.description ? `<p class="description">${award.description}</p>` : ''
    const link = award.link ? `<p class="link"><a href="${award.link}" target="_blank">${award.link_title || 'Learn more'}</a></p>` : ''
    
    return `<div class="job-title-header">
  <h4>${award.title}</h4>
  <p class="date-range">${award.date}</p>
</div>
${description}
${link}`
  }

  /**
   * Custom filter strategy for honors & awards - checks section-level priority
   */
  static honorsAwardsFilterStrategy(data, config, bulletDensity = 100, profile = null) {
    // Get section priority from profile metadata
    const sectionPriority = profile?.resume_config?.section_priorities?.['honors-awards'] || 5
    const requiredDensity = sectionPriority * 10
    
    console.log(`🏆 Honors & Awards Debug: Density ${bulletDensity}% < required ${requiredDensity}% - ${bulletDensity < requiredDensity ? 'hiding section' : 'showing section'}`)
    
    // If density is below section priority threshold, hide entire section
    if (bulletDensity < requiredDensity) {
      return []
    }
    
    // Otherwise apply normal filtering
    let filtered = [...data]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || data.preset_filters || {}
    
    // Apply company filtering if specified
    if (filters.company_filter) {
      filtered = filtered.filter(award => 
        award.associated_company && award.associated_company.toLowerCase().includes(filters.company_filter.toLowerCase())
      )
    }
    
    // Apply index-based selection (replaces max_entries)
    if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
      filtered = filters.selected_indices
        .filter(index => index >= 0 && index < data.length)
        .map(index => data[index])
    }
    
    return filtered
  }
} 