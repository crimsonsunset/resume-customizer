import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Honors & Awards-specific renderer
 * Handles awards and honors with title, issuer, date, and description
 */
export class HonorsAwardsRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Honors & Awards',
      groupBy: 'issuer',
      filterStrategy: HonorsAwardsRenderer.honorsAwardsFilterStrategy,
      itemRenderer: HonorsAwardsRenderer.honorsAwardsItemRenderer,
      ...options
    })
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
   * Honors & Awards-specific filtering
   */
  static honorsAwardsFilterStrategy(awards, config) {
    let filtered = [...awards]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || awards.preset_filters || {}
    
    // Apply company filtering if specified
    if (filters.company_filter) {
      filtered = filtered.filter(award => 
        award.associated_company && award.associated_company.toLowerCase().includes(filters.company_filter.toLowerCase())
      )
    }
    
    // Apply awards limit (check both config paths)
    const maxEntries = filters.honors_awards_limit || filters.max_entries
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
  }
} 