/**
 * Recommendations-specific renderer
 * Handles received recommendations with quote block formatting
 */
export class RecommendationsRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Recommendations'
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
   * Filters recommendations based on config
   */
  filterRecommendations(recommendations, config) {
    let filtered = [...recommendations]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || recommendations.preset_filters || {}
    
    // Apply recommendations limit (check both config paths)
    const maxEntries = filters.recommendations_limit || filters.max_entries
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
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
    const match = dateString.match(/^([^,]+)/)
    return match ? match[1].trim() : ''
  }

  /**
   * Extracts relationship context from the date field
   */
  extractRelationship(dateString) {
    const parts = dateString.split(',')
    if (parts.length > 1) {
      return parts.slice(1).join(',').trim()
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
