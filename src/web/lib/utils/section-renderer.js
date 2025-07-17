/**
 * Base SectionRenderer - Handles common resume section patterns
 * Provides filtering, grouping, and rendering utilities for resume sections
 */
export class SectionRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Section'
    this.sectionType = options.sectionType || null
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
      groupedData.map(group => this.renderGroup(group)).join('\n'),
      this.sectionType
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
  renderSectionWrapper(label, content, sectionType = null) {
    const dataAttr = sectionType ? ` data-section="${sectionType}"` : ''
    return `<div class="section-wrapper"${dataAttr}>
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
    
    // Apply index-based selection (replaces max_entries/limit)
    if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
      filtered = filters.selected_indices
        .filter(index => index >= 0 && index < data.length)
        .map(index => data[index])
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
   * Utility: Filters bullet points based on priority and density using cutoff tiers
   */
  static filterBullets(bulletPoints, bulletPriorities, density = 100) {
    if (!bulletPriorities || density === 100) {
      return bulletPoints
    }
    
    // Use discrete cutoff tiers - lower density = higher cutoff = fewer bullets
    let priorityCutoff
    if (density >= 90) priorityCutoff = 6      // 90-100%: Show priority 6+ (most content)
    else if (density >= 80) priorityCutoff = 7 // 80-89%: Show priority 7+ 
    else if (density >= 70) priorityCutoff = 8 // 70-79%: Show priority 8+
    else if (density >= 60) priorityCutoff = 8 // 60-69%: Show priority 8+
    else if (density >= 50) priorityCutoff = 9 // 50-59%: Show priority 9+ (high impact only)
    else if (density >= 40) priorityCutoff = 9 // 40-49%: Show priority 9+ (high impact only)
    else if (density >= 30) priorityCutoff = 9 // 30-39%: Show priority 9+ (revolutionary only)
    else if (density >= 20) priorityCutoff = 9 // 20-29%: Show priority 9+ (revolutionary only)
    else priorityCutoff = 9                     // 10-19%: Show priority 9+ (revolutionary only)
    
    return bulletPoints.filter((bullet, index) => 
      (bulletPriorities[index] || 1) >= priorityCutoff
    )
  }

  /**
   * Utility: Filters bullet points based on direct priority threshold
   */
  static filterBulletsByPriority(bulletPoints, bulletPriorities, priorityThreshold) {
    if (!bulletPriorities || !priorityThreshold) {
      return bulletPoints
    }
    
    return bulletPoints.filter((bullet, index) => 
      (bulletPriorities[index] || 1) >= priorityThreshold
    )
  }

  /**
   * Utility: Filters bullets with priority threshold or density fallback
   * Generalizes the pattern used across all renderers
   */
  static filterBulletsWithConfig(bulletPoints, bulletPriorities, bulletDensity = 100, config = {}) {
    const priorityThreshold = config.bullet_priority_threshold
    
    return priorityThreshold 
      ? this.filterBulletsByPriority(bulletPoints, bulletPriorities, priorityThreshold)
      : this.filterBullets(bulletPoints, bulletPriorities, bulletDensity)
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