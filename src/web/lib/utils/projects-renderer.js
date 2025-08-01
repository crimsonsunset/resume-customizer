import { SectionRenderer } from '@web/lib/utils/section-renderer.js'
import { parseExperienceDateRange } from '@shared/date-utils.js'

/**
 * Projects-specific renderer with dual sections (Work vs Supplemental)
 */
export class ProjectsRenderer extends SectionRenderer {
  constructor(options = {}) {
    const bulletDensity = options.bulletDensity || 100
    const config = options.config || {}
    
    super({
      sectionLabel: 'Projects',
      sectionType: 'projects', // Not used due to custom render override
      groupBy: null, // Custom grouping logic
      filterStrategy: ProjectsRenderer.projectsFilterStrategy,
      itemRenderer: ProjectsRenderer.projectItemRenderer,
      ...options
    })
    
    this.bulletDensity = bulletDensity
    this.config = config
  }

  /**
   * Override render method to handle dual sections
   */
  render(data, config = {}) {
    const filteredData = this.filterStrategy(data, config)
    const { workProjects, personalProjects } = this.groupProjectsByCategory(filteredData)
    
    // Filter projects that have meaningful content after bullet filtering
    const workProjectsWithContent = workProjects.filter(project => {
      const filteredBullets = SectionRenderer.filterBulletsWithConfig(
        project.bulletPoints,
        project.bullet_priorities,
        this.bulletDensity || 100,
        config
      )
      return filteredBullets.length > 0
    })

    const personalProjectsWithContent = personalProjects.filter(project => {
      const filteredBullets = SectionRenderer.filterBulletsWithConfig(
        project.bulletPoints,
        project.bullet_priorities,
        this.bulletDensity || 100,
        config
      )
      return filteredBullets.length > 0
    })

    // If no projects have content, return empty
    if (workProjectsWithContent.length === 0 && personalProjectsWithContent.length === 0) {
      return ''
    }
    
    const sections = []
    
    // Work Projects section
    if (workProjectsWithContent.length > 0) {
      const workContent = workProjectsWithContent.map(project => this.itemRenderer(project, this.bulletDensity, config)).join('\n')
      sections.push(this.renderSectionWrapper('Work Projects', workContent, 'projects'))
    }
    
    // Supplemental Projects section  
    if (personalProjectsWithContent.length > 0) {
      const personalContent = personalProjectsWithContent.map(project => this.itemRenderer(project, this.bulletDensity, config)).join('\n')
      sections.push(this.renderSectionWrapper('Supplemental Projects', personalContent, 'projects'))
    }
    
    return sections.join('\n')
  }

  /**
   * Groups projects by work vs personal categories
   */
  groupProjectsByCategory(projects) {
    const workProjects = []
    const personalProjects = []
    
    for (const project of projects) {
      if (project.company === 'Personal') {
        personalProjects.push(project)
      } else {
        workProjects.push(project)
      }
    }
    
    return { workProjects, personalProjects }
  }

  /**
   * Projects-specific item renderer
   */
  static projectItemRenderer(project, bulletDensity = 100, config = {}) {
    const bullets = SectionRenderer.filterBulletsWithConfig(
      project.bulletPoints, 
      project.bullet_priorities, 
      bulletDensity, 
      config
    )
    
    return `<div class="company-header">
  <h3>${project.name}</h3>
</div>
${SectionRenderer.renderBullets(bullets)}`
  }

  /**
   * Projects-specific filtering
   */
  static projectsFilterStrategy(projects, config) {
    let filtered = [...projects]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || projects.preset_filters || {}
    
    // Apply timeframe filtering first (if specified)
    if (filters.timeframeYears && filters.timeframeYears > 0) {
      const cutoffDate = new Date()
      cutoffDate.setFullYear(cutoffDate.getFullYear() - filters.timeframeYears)
      
      filtered = filtered.filter(project => {
        const dateRange = parseExperienceDateRange(project.date)
        if (!dateRange?.endDate) {
          return true // Keep entries we can't parse
        }
        
        // Keep if end date is after cutoff (recent enough)
        return dateRange.endDate >= cutoffDate
      })
      
      console.log(`🚀 Projects timeframe filter: showing last ${filters.timeframeYears} years (${filtered.length}/${projects.length} entries)`)
    }
    
    // Apply index-based selection (replaces max_entries)
    if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
      filtered = filters.selected_indices
        .filter(index => index >= 0 && index < projects.length)
        .map(index => projects[index])
    }
    
    // Apply priority threshold if needed
    if (filters.priority_threshold) {
      filtered = filtered.filter(project => 
        (project.priority || 1) >= filters.priority_threshold
      )
    }
    
    return filtered
  }
} 