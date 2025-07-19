import { SectionRenderer } from '@web/lib/utils/section-renderer.js'
import { FilterUtils } from '@web/lib/utils/filter-utils.js'

/**
 * Courses-specific renderer
 * Handles academic coursework with course name and institution code
 * Supports section-level priority filtering based on density
 */
export class CoursesRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    
    super({
      sectionLabel: 'Relevant Coursework',
      sectionType: 'courses',
      groupBy: null, // No grouping needed for courses
      filterStrategy: CoursesRenderer.coursesFilterStrategy,
      itemRenderer: CoursesRenderer.coursesItemRenderer,
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
   * Custom filter strategy for courses - checks section-level priority and timeframe
   */
  static coursesFilterStrategy(data, config, bulletDensity = 100, profile = null) {
    // Get section priority from profile metadata
    const sectionPriority = profile?.resume_config?.section_priorities?.courses || 5
    const requiredDensity = sectionPriority * 10
    
    console.log(`📚 Courses Debug: Density ${bulletDensity}% < required ${requiredDensity}% - ${bulletDensity < requiredDensity ? 'hiding section' : 'showing section'}`)
    
    // If density is below section priority threshold, hide entire section
    if (bulletDensity < requiredDensity) {
      return []
    }
    
    let filtered = [...data]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || data.preset_filters || {}
    
    // Apply timeframe filtering if specified
    if (filters.timeframeYears) {
      const dateFieldConfig = {
        field: 'date',
        format: 'single' // Uses parseResumeDate for "May 2011" format
      }
      filtered = FilterUtils.filterByTimeframe(filtered, filters, dateFieldConfig, 'Courses')
    }
    
    return filtered
  }

  /**
   * Courses item renderer - displays course name and institution
   */
  static coursesItemRenderer(course) {
    const name = course.name || ''
    const institution = course.institution || ''
    
    return `<div class="course-item">${name} (${institution})</div>`
  }
} 