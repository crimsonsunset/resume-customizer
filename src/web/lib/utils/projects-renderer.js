import { SectionRenderer } from '@web/lib/utils/section-renderer.js'

/**
 * Projects-specific renderer with dual sections (Work vs Supplemental)
 */
export class ProjectsRenderer extends SectionRenderer {
  constructor(options = {}) {
    super({
      sectionLabel: 'Projects',
      sectionType: 'projects', // Not used due to custom render override
      groupBy: null, // Custom grouping logic
      filterStrategy: ProjectsRenderer.projectsFilterStrategy,
      itemRenderer: ProjectsRenderer.projectItemRenderer,
      ...options
    })
  }

  /**
   * Override render method to handle dual sections
   */
  render(data, config = {}) {
    const filteredData = this.filterStrategy(data, config)
    const { workProjects, personalProjects } = this.groupProjectsByCategory(filteredData)
    
    const sections = []
    
    // Work Projects section
    if (workProjects.length > 0) {
      const workContent = workProjects.map(project => this.itemRenderer(project)).join('\n')
      sections.push(this.renderSectionWrapper('Work Projects', workContent, 'projects'))
    }
    
    // Supplemental Projects section  
    if (personalProjects.length > 0) {
      const personalContent = personalProjects.map(project => this.itemRenderer(project)).join('\n')
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
  static projectItemRenderer(project) {
    const bullets = SectionRenderer.renderBullets(project.bulletPoints || [])
    
    return `<div class="company-header">
  <h3>${project.name}</h3>
</div>
${bullets}`
  }

  /**
   * Projects-specific filtering
   */
  static projectsFilterStrategy(projects, config) {
    let filtered = [...projects]
    
    // Get filters from config or from preset_filters attached to the array
    const filters = config || projects.preset_filters || {}
    
    // Apply project limit
    const maxEntries = filters.projects_limit || filters.max_entries
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
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