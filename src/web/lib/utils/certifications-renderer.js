import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Certifications-specific renderer
 * Handles professional certifications with name, issuing organization, and credential ID
 * Supports section-level priority filtering based on density
 */
export class CertificationsRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    
    super({
      sectionLabel: 'Certifications',
      sectionType: 'certifications',
      groupBy: null, // No grouping - display as single line items
      filterStrategy: CertificationsRenderer.certificationsFilterStrategy,
      itemRenderer: CertificationsRenderer.certificationsItemRenderer,
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
   * Custom filter strategy for certifications - checks section-level priority
   */
  static certificationsFilterStrategy(data, config, bulletDensity = 100, profile = null) {
    // Get section priority from profile metadata
    const sectionPriority = profile?.resume_config?.section_priorities?.certifications || 5
    const requiredDensity = sectionPriority * 10
    
    console.log(`📜 Certifications Debug: Density ${bulletDensity}% < required ${requiredDensity}% - ${bulletDensity < requiredDensity ? 'hiding section' : 'showing section'}`)
    
    // If density is below section priority threshold, hide entire section
    if (bulletDensity < requiredDensity) {
      return []
    }
    
    // Otherwise show all certifications
    return data
  }

  /**
   * Certifications item renderer - displays name, organization, and credential ID
   */
  static certificationsItemRenderer(certification) {
    const name = certification.name || ''
    const org = certification.issuing_organization || ''
    const credentialId = certification.credential_id || ''
    
    let content = name
    if (org) content += ` | ${org}`
    if (credentialId) content += ` | ${credentialId}`
    
    return `<div class="certification-item">${content}</div>`
  }
} 