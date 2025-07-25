import { FilterUtils } from '@web/lib/utils/filter-utils.js'

/**
 * Recommendations-specific renderer
 * Handles received recommendations with quote block formatting
 */
export class RecommendationsRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Recommendations'
    this.bulletDensity = options.bulletDensity || 100
  }

  /**
   * Main render method - renders received recommendations only
   */
  render(recommendationsData, config = {}) {
    // Get received recommendations only
    const receivedRecs = recommendationsData.received || []
    
    // Apply filtering
    const filteredRecs = this.filterRecommendations(receivedRecs, config)
    
    if (filteredRecs.length === 0) {
      return ''
    }

    return this.renderSectionWrapper(
      this.sectionLabel,
      this.renderRecommendations(filteredRecs)
    )
  }

  /**
   * Filters recommendations based on config and density
   */
  filterRecommendations(recommendations, config) {
    let filtered = [...recommendations]
    
    console.log('💬 RecommendationsRenderer Debug:')
    console.log(`  📊 Input: ${recommendations.length} recommendations`)
    console.log(`  🎯 Density: ${this.bulletDensity}%`)
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || recommendations.preset_filters || {}
    
    // Apply timeframe filtering if specified
    if (filters.timeframeYears) {
      const dateFieldConfig = {
        field: 'date',
        format: 'single' // Uses parseResumeDate for "October 18, 2023, ..." format
      }
      filtered = FilterUtils.filterByTimeframe(filtered, filters, dateFieldConfig, 'Recommendations')
    }
    
    // Apply index-based selection (replaces max_entries)
    if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
      filtered = filters.selected_indices
        .filter(index => index >= 0 && index < recommendations.length)
        .map(index => recommendations[index])
      console.log(`  📝 After index selection: ${filtered.length} recommendations`)
    }
    
    // Apply priority-based density filtering
    if (this.bulletDensity < 100) {
      // Below 30% density: hide entire section
      if (this.bulletDensity < 30) {
        console.log('  🚫 Density < 30% - hiding entire section')
        return []
      }
      
      const priorityThreshold = this.getPriorityThreshold(this.bulletDensity)
      console.log(`  🎯 Priority threshold: ${priorityThreshold}`)
      const beforeCount = filtered.length
      filtered = filtered.filter(rec => (rec.priority || 5) >= priorityThreshold)
      console.log(`  📝 After priority filtering: ${filtered.length} recommendations (was ${beforeCount})`)
    }
    
    if (filtered.length === 0) {
      console.log('  🚫 Section is EMPTY - returning blank')
    }
    
    return filtered
  }

  /**
   * Get priority threshold based on density
   */
  getPriorityThreshold(density) {
    if (density >= 90) return 6
    if (density >= 70) return 8  
    if (density >= 50) return 9
    return 9 // <50%: exceptional only
  }

  /**
   * Renders all recommendations
   */
  renderRecommendations(recommendations) {
    return recommendations.map(rec => this.renderRecommendation(rec)).join('\n')
  }

  /**
   * Renders a single recommendation with quote block
   */
  renderRecommendation(recommendation) {
    const name = recommendation.recommender_name || 'Unknown'
    const title = recommendation.recommender_title_company || ''
    const date = this.extractDate(recommendation.date || '')
    const relationship = this.extractRelationship(recommendation.date || '')
    const quote = recommendation.text || ''

    const titleLine = title ? `${title}${date ? ' • ' + date : ''}` : date
    const relationshipLine = relationship ? `<p class="relationship">${relationship}</p>` : ''

    return `<div class="recommendation-item">
  <h4>${name}</h4>
  ${titleLine ? `<p class="title-date">${titleLine}</p>` : ''}
  ${relationshipLine}
  <blockquote class="recommendation-quote">
    "${quote}"
  </blockquote>
</div>`
  }

  /**
   * Extracts date from the date field (e.g., "September 9, 2024, Matthew reported directly to Joe")
   */
  extractDate(dateString) {
    const parts = dateString.split(',')
    if (parts.length >= 2) {
      // Extract first two parts: "September 9" + "2024"
      return `${parts[0].trim()}, ${parts[1].trim()}`
    }
    return parts[0]?.trim() || ''
  }

  /**
   * Extracts relationship context from the date field
   */
  extractRelationship(dateString) {
    const parts = dateString.split(',')
    if (parts.length > 2) {
      // Skip first two parts (date and year), get the rest
      return parts.slice(2).join(',').trim()
    }
    return ''
  }

  /**
   * Renders the main section wrapper
   */
  renderSectionWrapper(label, content, sectionType = 'recommendations') {
    // Break "Recommendations" at the specific point the user wants
    const formattedLabel = label === 'Recommendations' ? 'Recommend-<br/>ations' : label
    const dataAttr = sectionType ? ` data-section="${sectionType}"` : ''
    
    return `<div class="section-wrapper recommendations-section"${dataAttr}>
  <div class="section-label">${formattedLabel}</div>
  <div class="section-content">
    ${content}
  </div>
</div>`
  }
} 
