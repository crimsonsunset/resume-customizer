import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Courses-specific renderer
 * Handles academic coursework with course name and institution code
 */
export class CoursesRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Relevant Coursework',
      sectionType: 'courses',
      groupBy: null, // No grouping needed for courses
      filterStrategy: CoursesRenderer.coursesFilterStrategy,
      itemRenderer: CoursesRenderer.coursesItemRenderer,
      ...options
    })
  }

  /**
   * Courses-specific filtering (minimal - just ensure valid entries)
   */
  static coursesFilterStrategy(courses, config = {}) {
    return courses.filter(course => course.name && course.name.trim())
  }

  /**
   * Courses-specific item renderer
   */
  static coursesItemRenderer(course) {
    const institution = course.institution ? ` (${course.institution})` : ''
    
    return `<div class="course-item">
  <h4>${course.name}${institution}</h4>
</div>`
  }

  /**
   * Custom render method for courses - displays as a compact list
   */
  render(courses, config = {}) {
    const filteredCourses = this.constructor.coursesFilterStrategy(courses, config)
    
    if (filteredCourses.length === 0) return ''

    const courseItems = filteredCourses
      .map(course => this.constructor.coursesItemRenderer(course))
      .join('')

    return this.renderSectionWrapper(this.sectionLabel, `<div class="courses-list">${courseItems}</div>`, 'courses')
  }
} 