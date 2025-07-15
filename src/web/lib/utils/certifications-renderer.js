import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Certifications-specific renderer
 * Handles professional certifications with name, issuing organization, and credential ID
 */
export class CertificationsRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Certifications',
      sectionType: 'certifications',
      groupBy: null, // No grouping - display as single line items
      filterStrategy: CertificationsRenderer.certificationsFilterStrategy,
      itemRenderer: CertificationsRenderer.certificationsItemRenderer,
      ...options
    })
  }

  /**
   * Certifications-specific filtering (minimal - just ensure valid entries)
   */
  static certificationsFilterStrategy(certifications, config = {}) {
    return certifications.filter(cert => cert.name && cert.name.trim())
  }

  /**
   * Certifications-specific item renderer
   */
  static certificationsItemRenderer(certification) {
    const credentialId = certification.credential_id 
      ? ` - ${certification.credential_id}`
      : ''
    
    return `<div class="certification-item">
  <h4>${certification.name} (${certification.issuing_organization})${credentialId}</h4>
</div>`
  }
} 