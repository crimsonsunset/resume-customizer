import { parseExperienceDateRange, parseResumeDate } from '@shared/date-utils.js'

/**
 * Universal filter utilities for resume sections
 * Centralizes common filtering patterns to eliminate code duplication
 */
export const FilterUtils = {
  /**
   * Universal timeframe filtering for any section with date fields
   * @param {Array} items - Array of items to filter
   * @param {Object} config - Filter configuration containing timeframeYears
   * @param {Object} dateFieldConfig - Configuration for extracting dates from items
   * @param {string} sectionName - Section name for logging
   * @returns {Array} Filtered array of items
   */
  filterByTimeframe(items, config, dateFieldConfig, sectionName = 'Section') {
    if (!config.timeframeYears || config.timeframeYears <= 0) {
      return items // No filtering needed
    }

    const cutoffDate = new Date()
    cutoffDate.setFullYear(cutoffDate.getFullYear() - config.timeframeYears)
    
    const filtered = items.filter(item => {
      const endDate = this.extractEndDate(item, dateFieldConfig)
      if (!endDate) {
        return true // Keep entries we can't parse
      }
      
      // Keep if end date is after cutoff (recent enough)
      return endDate >= cutoffDate
    })
    
    const emoji = this.getSectionEmoji(sectionName)
    console.log(`${emoji} ${sectionName} timeframe filter: showing last ${config.timeframeYears} years (${filtered.length}/${items.length} entries)`)
    
    return filtered
  },

  /**
   * Extract end date from item based on field configuration
   * @param {Object} item - Item to extract date from
   * @param {Object} dateFieldConfig - { field: string, format: string, parser?: function }
   * @returns {Date|null} Extracted end date or null if can't parse
   */
  extractEndDate(item, dateFieldConfig) {
    const { field, format, parser } = dateFieldConfig
    const dateValue = item[field]
    
    if (!dateValue) return null

    switch (format) {
      case 'custom': {
        return parser ? parser(dateValue) : null
      }
      case 'duration': {
        // "Jan 2024 - Present · 1 yr 6 mos"
        return parseExperienceDateRange(dateValue)?.endDate
      }
      case 'single': {
        // "May 2024"
        return parseResumeDate(dateValue)
      }
      default: {
        console.warn(`Unknown date format: ${format}`)
        return null
      }
    }
  },

  /**
   * Section priority/density filtering 
   * @param {Array} items - Array of items to filter
   * @param {number} bulletDensity - Current density percentage (10-100)
   * @param {number} sectionPriority - Section priority level (1-10)
   * @param {string} sectionName - Section name for logging
   * @returns {Array} Filtered array (empty if below threshold)
   */
  filterByDensityThreshold(items, bulletDensity, sectionPriority, sectionName = 'Section') {
    const requiredDensity = sectionPriority * 10
    const emoji = this.getSectionEmoji(sectionName)
    
    console.log(`${emoji} ${sectionName} Debug: Density ${bulletDensity}% ${bulletDensity < requiredDensity ? '<' : '>='} required ${requiredDensity}% - ${bulletDensity < requiredDensity ? 'hiding section' : 'showing section'}`)
    
    // If density is below section priority threshold, hide entire section
    if (bulletDensity < requiredDensity) {
      return []
    }
    
    return items
  },

  /**
   * Index-based selection filtering
   * @param {Array} items - Original array of items
   * @param {Array} selectedIndices - Array of indices to select
   * @returns {Array} Filtered array containing only selected indices
   */
  filterByIndices(items, selectedIndices) {
    if (!selectedIndices || !Array.isArray(selectedIndices)) {
      return items
    }
    
    return selectedIndices
      .filter(index => index >= 0 && index < items.length)
      .map(index => items[index])
  },

  /**
   * Text-based filtering (category, company, etc.)
   * @param {Array} items - Array of items to filter
   * @param {string} field - Field name to search in
   * @param {string} searchTerm - Term to search for
   * @returns {Array} Filtered array
   */
  filterByTextMatch(items, field, searchTerm) {
    if (!searchTerm) return items
    
    return items.filter(item => {
      const fieldValue = item[field]
      return fieldValue && fieldValue.toLowerCase().includes(searchTerm.toLowerCase())
    })
  },

  /**
   * Role/title pattern matching
   * @param {Array} items - Array of items to filter
   * @param {string} roleFilter - Role filter type (e.g., 'management_roles_only')
   * @param {string} titleField - Field name containing the title (default: 'title')
   * @returns {Array} Filtered array
   */
  filterByRole(items, roleFilter, titleField = 'title') {
    if (!roleFilter) return items
    
    if (roleFilter === 'management_roles_only') {
      return items.filter(item => {
        const title = item[titleField]?.toLowerCase() || ''
        return title.includes('manager') || 
               title.includes('director') ||
               title.includes('lead') ||
               title.includes('principal')
      })
    }
    
    return items
  },

  /**
   * Get emoji for section logging
   * @param {string} sectionName - Name of the section
   * @returns {string} Emoji for the section
   */
  getSectionEmoji(sectionName) {
    const emojiMap = {
      'Experience': '💼',
      'Projects': '🚀', 
      'Volunteering': '🤝',
      'Honors & Awards': '🏆',
      'Activities': '🎭',
      'Certifications': '📜',
      'Courses': '📚',
      'Skills': '🛠️',
      'Education': '🎓',
      'Recommendations': '💬'
    }
    
    return emojiMap[sectionName] || '📋'
  }
} 