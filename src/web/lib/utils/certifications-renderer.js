import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Certifications-specific renderer
 * Handles professional certifications with name, issuing organization, and credential ID
 */
export class CertificationsRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Certifications',
      groupBy: 'issuing_organization',
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
      ? `<p class="credential-id">${certification.credential_id}</p>`
      : ''
    
    return `<div class="certification-item">
  <h4>${certification.name}</h4>
  <p class="issuing-org">${certification.issuing_organization}</p>
  ${credentialId}
</div>`
  }
} 