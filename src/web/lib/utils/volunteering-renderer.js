import { SectionRenderer } from '@web/lib/utils/section-renderer.js'
import { FilterUtils } from '@web/lib/utils/filter-utils.js'

/**
 * Volunteering-specific renderer
 * Handles volunteer experience with role, organization, duration, and description
 * Supports section-level priority filtering based on density
 */
export class VolunteeringRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    
    super({
      sectionLabel: 'Volunteering',
      sectionType: 'volunteering',
      groupBy: 'organization',
      filterStrategy: VolunteeringRenderer.volunteeringFilterStrategy,
      itemRenderer: VolunteeringRenderer.volunteeringItemRenderer,
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
   * Custom filter strategy for volunteering - uses centralized FilterUtils
   */
  static volunteeringFilterStrategy(data, config, bulletDensity = 100, profile = null) {
    // Get section priority from profile metadata
    const sectionPriority = profile?.resume_config?.section_priorities?.volunteering || 5
    
    // Apply density threshold filtering (may return empty array)
    let filtered = FilterUtils.filterByDensityThreshold(data, bulletDensity, sectionPriority, 'Volunteering')
    if (filtered.length === 0) {
      return filtered // Section hidden due to density
    }
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || data.preset_filters || {}
    
    // Apply timeframe filtering if specified
    if (filters.timeframeYears) {
      const dateFieldConfig = {
        field: 'duration',
        format: 'duration' // Uses parseExperienceDateRange
      }
      filtered = FilterUtils.filterByTimeframe(filtered, filters, dateFieldConfig, 'Volunteering')
    }
    
    // Apply category filtering if specified
    if (filters.category_filter) {
      filtered = FilterUtils.filterByTextMatch(filtered, 'category', filters.category_filter)
    }
    
    // Apply index-based selection (replaces max_entries)
    if (filters.selected_indices) {
      filtered = FilterUtils.filterByIndices(data, filters.selected_indices)
    }
    
    return filtered
  }
} 