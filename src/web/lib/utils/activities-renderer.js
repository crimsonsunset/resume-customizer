import { SectionRenderer } from '@web/lib/utils/section-renderer.js'
import { FilterUtils } from '@web/lib/utils/filter-utils.js'

/**
 * Custom date parser for activities date format "5/10 – 12/10" (month/year range)
 * @param {string} dateString - Date string in format "M/YY – M/YY" 
 * @returns {Date|null} End date of the range
 */
function parseActivitiesDateRange(dateString) {
  if (!dateString || typeof dateString !== 'string') return null
  
  try {
    // Handle format like "5/10 – 12/10" or "5/10 - 12/10"
    const parts = dateString.split(/[–-]/).map(s => s.trim())
    if (parts.length !== 2) return null
    
    // Parse end date (e.g., "12/10")
    const endDateStr = parts[1]
    const [month, year] = endDateStr.split('/')
    
    if (!month || !year) return null
    
    // Convert 2-digit year to 4-digit (assuming 2000s for now)
    const fullYear = year.length === 2 ? Number.parseInt(`20${year}`, 10) : Number.parseInt(year, 10)
    const monthNum = Number.parseInt(month, 10)
    
    if (Number.isNaN(fullYear) || Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) return null
    
    // Create date at end of month for more accurate filtering
    return new Date(fullYear, monthNum - 1, 1) // JavaScript months are 0-indexed
  } catch (error) {
    console.warn('Failed to parse activities date:', dateString, error)
    return null
  }
}

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
    let activities = activitiesData?.activities || []
    const personalInterests = activitiesData?.personal_interests || []
    

    
    // Apply timeframe filtering if specified
    const filters = this.config || {}
    if (filters.timeframeYears) {
      const dateFieldConfig = {
        field: 'dates',
        format: 'custom',
        parser: parseActivitiesDateRange
      }
      activities = FilterUtils.filterByTimeframe(activities, filters, dateFieldConfig, 'Activities')
    }
    
    // Check if activities have meaningful content after bullet filtering
    const activitiesWithContent = activities.filter(activity => {
      if (!activity.bulletPoints || !Array.isArray(activity.bulletPoints)) {
        console.log(`  ✅ Activity "${activity.role || activity.organization}" - no bullets, counts as content`)
        return true // Activities without bullets still count as content
      }
      
      const filteredBullets = SectionRenderer.filterBulletsWithConfig(
        activity.bulletPoints,
        activity.bullet_priorities,
        this.bulletDensity || 100,
        this.config || {}
      )
      
      const hasContent = filteredBullets.length > 0
      console.log(`  ${hasContent ? '✅' : '❌'} Activity "${activity.role || activity.organization}" - ${activity.bulletPoints.length} bullets → ${filteredBullets.length} after filtering`)
      
      return hasContent
    })

    // Check personal interests (considering density filtering)
    const hasPersonalInterests = personalInterests.length > 0 && this.bulletDensity >= 90
    console.log(`  🎨 Personal interests: ${personalInterests.length} items, density >= 90? ${this.bulletDensity >= 90}, included: ${hasPersonalInterests}`)
    
    console.log(`  📝 Result: ${activitiesWithContent.length} activities with content, personal interests: ${hasPersonalInterests}`)
    
    if (activitiesWithContent.length === 0 && !hasPersonalInterests) {
      console.log(`  🚫 Section is EMPTY - returning blank`)
      return ''
    }

    console.log(`  ✅ Section has content - rendering...`)
    
    let content = ''
    
    // Render activities section
    if (activitiesWithContent.length > 0) {
      content += this.renderActivities(activitiesWithContent)
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