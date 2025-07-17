import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Activities-specific renderer
 * Handles both activities and personal interests in a single section
 */
export class ActivitiesRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Activities & Misc.'
    this.bulletDensity = options.bulletDensity || 100
    this.config = options.config || {}
  }

  /**
   * Main render method - handles activities and personal interests
   */
  render(activitiesData, _config = {}) {
    const activities = activitiesData?.activities || []
    const personalInterests = activitiesData?.personal_interests || []
    
    const hasActivities = activities.length > 0
    const hasPersonalInterests = personalInterests.length > 0
    
    if (!hasActivities && !hasPersonalInterests) {
      return ''
    }

    let content = ''
    
    // Render activities section
    if (hasActivities) {
      content += this.renderActivities(activities)
    }
    
    // Render personal interests section
    if (hasPersonalInterests) {
      if (content) content += '\n' // Add spacing between sections
      content += this.renderPersonalInterests(personalInterests)
    }

    return this.renderSectionWrapper(this.sectionLabel, content, 'activities')
  }

  /**
   * Render activities (organization, role, dates, bullets)
   */
  renderActivities(activities) {
    return activities.map(activity => {
      const orgHeader = activity.organization ? `<h3>${activity.organization}</h3>` : ''
      
      // Combine role and dates on same line
      const roleAndDates = this.formatRoleAndDates(activity.role, activity.dates)
      const roleHeader = roleAndDates ? `<h4>${roleAndDates}</h4>` : ''
      
      // Render bullet points with filtering support
      const bullets = activity.bulletPoints && activity.bulletPoints.length > 0 ? 
        this.renderBullets(
          SectionRenderer.filterBulletsWithConfig(
            activity.bulletPoints, 
            activity.bullet_priorities, 
            this.bulletDensity, 
            this.config
          )
        ) : ''
      
      return [orgHeader, roleHeader, bullets].filter(Boolean).join('\n')
    }).join('\n')
  }

  /**
   * Render personal interests section
   */
  renderPersonalInterests(personalInterests) {
    const header = '<h3>Personal Interests</h3>'
    const bullets = this.renderBullets(personalInterests)
    
    return [header, bullets].filter(Boolean).join('\n')
  }

  /**
   * Format role and dates (e.g., "President 5/10 – 12/10")
   */
  formatRoleAndDates(role, dates) {
    const parts = []
    if (role) parts.push(role)
    if (dates) parts.push(dates)
    return parts.join(' ')
  }

  /**
   * Render bullet points
   */
  renderBullets(items) {
    if (!items || items.length === 0) return ''
    
    return '<ul>' + 
      items.map(item => `<li>${item}</li>`).join('') + 
      '</ul>'
  }

  /**
   * Render section wrapper
   */
  renderSectionWrapper(sectionLabel, content, sectionType = 'activities') {
    if (!content) return ''
    
    const dataAttr = sectionType ? ` data-section="${sectionType}"` : ''
    return `<div class="section-wrapper"${dataAttr}>
  <div class="section-label">${sectionLabel}</div>
  <div class="section-content">
    ${content}
  </div>
</div>`
  }
} 