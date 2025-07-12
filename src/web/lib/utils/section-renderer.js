/**
 * Base SectionRenderer - Handles common resume section patterns
 * Provides filtering, grouping, and rendering utilities for resume sections
 */
export class SectionRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Section'
    this.groupBy = options.groupBy || null
    this.itemRenderer = options.itemRenderer || this.defaultItemRenderer
    this.headerRenderer = options.headerRenderer || this.defaultHeaderRenderer
    this.filterStrategy = options.filterStrategy || this.defaultFilterStrategy
  }

  /**
   * Main render method - orchestrates the entire section rendering
   */
  render(data, config = {}) {
    const filteredData = this.filterStrategy(data, config)
    const groupedData = this.groupBy ? this.groupData(filteredData) : [{ items: filteredData }]
    
    return this.renderSectionWrapper(
      this.sectionLabel,
      groupedData.map(group => this.renderGroup(group)).join('\n')
    )
  }

  /**
   * Groups data by specified field (e.g., company, organization)
   */
  groupData(data) {
    if (!this.groupBy) return [{ items: data }]
    
    const grouped = {}
    for (const item of data) {
      const key = this.extractGroupKey(item)
      if (!grouped[key]) {
        grouped[key] = { groupName: key, items: [] }
      }
      grouped[key].items.push(item)
    }
    
    return Object.values(grouped)
  }

  /**
   * Extracts the grouping key from an item
   */
  extractGroupKey(item) {
    if (!this.groupBy) return null
    
    const value = item[this.groupBy]
    if (typeof value === 'string') {
      // Handle formats like "FORA · Freelance" or "iCIMS, Inc."
      return value.split('·')[0].split(',')[0].trim()
    }
    return value
  }

  /**
   * Renders a single group (with optional header)
   */
  renderGroup(group) {
    const groupHeader = group.groupName ? this.headerRenderer(group.groupName) : ''
    const items = group.items.map(item => this.itemRenderer(item)).join('\n')
    
    return [groupHeader, items].filter(Boolean).join('\n')
  }

  /**
   * Renders the main section wrapper
   */
  renderSectionWrapper(label, content) {
    return `<div class="section-wrapper">
  <div class="section-label">${label}</div>
  <div class="section-content">
    ${content}
  </div>
</div>`
  }

  /**
   * Default filter strategy - applies common filtering patterns
   */
  defaultFilterStrategy(data, config) {
    let filtered = [...data]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || data.preset_filters || {}
    
    // Apply limit
    const maxEntries = filters.max_entries || filters.limit
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    // Apply priority threshold
    if (filters.priority_threshold) {
      filtered = filtered.filter(item => 
        (item.priority || 1) >= filters.priority_threshold
      )
    }
    
    return filtered
  }

  /**
   * Default header renderer - renders company/organization headers
   */
  defaultHeaderRenderer(groupName) {
    return `<div class="company-header">
  <h3>${groupName}</h3>
</div>`
  }

  /**
   * Default item renderer - basic structure for items
   */
  defaultItemRenderer(item) {
    return `<div class="item">
  <h4>${item.title || item.name}</h4>
  <p class="date-range">${item.duration || item.dates || ''}</p>
</div>`
  }

  /**
   * Utility: Filters bullet points based on priority and density
   */
  static filterBullets(bulletPoints, bulletPriorities, density = 100) {
    if (!bulletPriorities || density === 100) {
      return bulletPoints
    }
    
    const maxPriority = Math.max(...bulletPriorities)
    const minThreshold = maxPriority * (density / 100)
    
    return bulletPoints.filter((bullet, index) => 
      (bulletPriorities[index] || 1) >= minThreshold
    )
  }

  /**
   * Utility: Renders bullet points as HTML list
   */
  static renderBullets(bulletPoints) {
    if (!bulletPoints || bulletPoints.length === 0) return ''
    
    const items = bulletPoints.map(bullet => `  <li>${bullet}</li>`).join('\n')
    return `<ul>\n${items}\n</ul>`
  }
} 