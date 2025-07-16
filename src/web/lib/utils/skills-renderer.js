/**
 * Skills-specific renderer
 * Handles both preset skills and raw skills data with categorization
 */
export class SkillsRenderer {
  constructor(options = {}) {
    this.sectionLabel = options.sectionLabel || 'Special Skills'
  }

  /**
   * Main render method - handles both preset and raw skills
   */
  render(skillsData, _config = {}) {
    const skillsToDisplay = this.getSkillsToDisplay(skillsData)
    const hasSkills = Object.keys(skillsToDisplay).length > 0
    
    if (!hasSkills) {
      return ''
    }

    return this.renderSectionWrapper(
      this.sectionLabel,
      this.renderCategories(skillsToDisplay)
    )
  }

  /**
   * Gets skills to display based on preset or raw data
   * Priority: preset_skills > raw skills data
   */
  getSkillsToDisplay(skillsData) {
    // If preset skills exist, use those
    if (skillsData.preset_skills) {
      return skillsData.preset_skills
    }
    
    // Fall back to generating from raw skills array
    if (skillsData.skills && Array.isArray(skillsData.skills)) {
      return this.generateSkillsFromRawData(skillsData.skills)
    }
    
    return {}
  }

  /**
   * Organizes raw skills array into categories based on endorsements and type
   */
  generateSkillsFromRawData(skillsArray) {
    // Sort by endorsements (highest first)
    const sorted = [...skillsArray].sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))
    
    // Get top skills (those with endorsements or first 15 if none have endorsements)
    const hasEndorsements = sorted.some(skill => skill.endorsements > 0)
    const topSkills = hasEndorsements 
      ? sorted.filter(skill => skill.endorsements > 0)
      : sorted.slice(0, 15)
    
    // Categorize skills
    const categories = {
      'Programming Languages': [],
      'Frameworks & Libraries': [],
      'Tools & Platforms': [],
      'Leadership & Management': [],
      'Other Technologies': []
    }
    
    for (const skill of topSkills) {
      const { name } = skill
      
      // Programming languages
      if (['C++', 'Java', 'JavaScript', 'PHP', 'Python', 'TypeScript'].includes(name)) {
        categories['Programming Languages'].push(name)
      }
      // Frameworks & Libraries
      else if (['Angular', 'Express.js', 'jQuery', 'Next.js', 'Node.js', 'React.js', 'Redux.js', 'Vue.js'].includes(name)) {
        categories['Frameworks & Libraries'].push(name)
      }
      // Leadership & Management
      else if (name.includes('Management') || name.includes('Leadership') || ['Mentoring', 'Teaching'].includes(name)) {
        categories['Leadership & Management'].push(name)
      }
      // Tools & Platforms
      else if (['AWS', 'Docker', 'Git', 'Linux', 'Mac OS', 'MongoDB', 'Windows'].includes(name)) {
        categories['Tools & Platforms'].push(name)
      }
      // Everything else
      else {
        categories['Other Technologies'].push(name)
      }
    }
    
    // Remove empty categories
    for (const key of Object.keys(categories)) {
      if (categories[key].length === 0) {
        delete categories[key]
      }
    }
    
    return categories
  }

  /**
   * Renders all skill categories
   */
  renderCategories(skillsToDisplay) {
    const categoryHTML = []
    
    for (const [categoryName, skillsArray] of Object.entries(skillsToDisplay)) {
      if (skillsArray && skillsArray.length > 0) {
        const skillsList = this.formatSkillsCategory(categoryName, skillsArray)
        categoryHTML.push(`<p><strong>${categoryName}:</strong> ${skillsList}</p>`)
      }
    }
    
    return categoryHTML.join('\n    ')
  }

  /**
   * Formats skills category display
   * Converts array of skills to comma-separated string
   */
  formatSkillsCategory(categoryName, skillsArray) {
    if (!skillsArray || skillsArray.length === 0) return ''
    
    return skillsArray.join(', ')
  }

  /**
   * Renders the main section wrapper
   */
  renderSectionWrapper(label, content, sectionType = 'skills') {
    const dataAttr = sectionType ? ` data-section="${sectionType}"` : ''
    return `<div class="section-wrapper"${dataAttr}>
  <div class="section-label">${label}</div>
  <div class="section-content">
    ${content}
  </div>
</div>`
  }
} 