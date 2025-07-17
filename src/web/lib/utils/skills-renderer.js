import { has, sortBy } from 'lodash-es'

// Context-to-Category mappings organized by priority (higher priority = lower number)
const CATEGORY_CONTEXTS = {
  'Leadership': ['leadership', 'management', 'business', 'product'], // Priority 1
  'Programming Languages': ['programming', 'javascript', 'css'], // Priority 2  
  'Tools & Platforms': ['devops', 'cms', 'analytics', 'logging', 'monitoring', 'configuration', 'productivity', 'system'], // Priority 3
  'Frameworks & Libraries': ['frontend', 'backend', 'mobile', 'nodejs'], // Priority 4
  'Concepts & Methodologies': ['development', 'api', 'data', 'design', 'ai', 'crypto', 'performance', 'security', 'testing', 'technical', 'marketing', 'education'] // Priority 5
}

// Priority order for categories (lower number = higher priority)
const CATEGORY_PRIORITY = {
  'Leadership': 1,
  'Programming Languages': 2,
  'Tools & Platforms': 3,
  'Frameworks & Libraries': 4,
  'Concepts & Methodologies': 5
}

// Programming language name patterns for fallback categorization
const PROGRAMMING_LANGUAGES = new Set(['CSS/Sass', 'HTML', 'Java', 'JavaScript', 'JSON', 'PHP', 'Python', 'SQL', 'TypeScript', 'XML', 'YAML'])

/**
 * SkillsRenderer handles the rendering of skills sections
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
   * Priority: preset_skills > skills inventory > raw skills data
   */
  getSkillsToDisplay(skillsData) {
    // If preset skills exist, use those
    if (skillsData.preset_skills) {
      return skillsData.preset_skills
    }
    
    // Use skills inventory if available
    if (skillsData.skillsInventory) {
      return this.generateSkillsFromInventory(skillsData.skillsInventory)
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
   * Generates categorized skills from skills-inventory.json
   */
  generateSkillsFromInventory(skillsInventory) {
    console.log('🛠️ Skills Debug: Using skills inventory data')
    
    if (!skillsInventory.skills) {
      console.warn('⚠️ Skills inventory missing skills object')
      return {}
    }
    
    const categories = {
      'Leadership': [],
      'Programming Languages': [], 
      'Frameworks & Libraries': [],
      'Tools & Platforms': [],
      'Concepts & Methodologies': []
    }
    
    // Convert skills inventory to categorized structure
    const { skills } = skillsInventory
    
    for (const [skillKey, skillData] of Object.entries(skills)) {
      const { name: skillName, contexts = [] } = skillData
      
      let category = 'Concepts & Methodologies' // Default fallback
      
      if (contexts.length > 0) {
        // Find the category for each context and pick the highest priority one
        const categoriesForContexts = contexts
          .map(context => {
            // Find which category this context belongs to
            for (const [categoryName, categoryContexts] of Object.entries(CATEGORY_CONTEXTS)) {
              if (categoryContexts.includes(context)) {
                return categoryName
              }
            }
            return null
          })
          .filter(cat => cat !== null)
        
        if (categoriesForContexts.length > 0) {
          // Sort by priority and pick the highest priority category
          category = categoriesForContexts.sort((a, b) => 
            (CATEGORY_PRIORITY[a] || 999) - (CATEGORY_PRIORITY[b] || 999)
          )[0]
        }
      } else if (PROGRAMMING_LANGUAGES.has(skillName)) {
        // Fallback: Use name-based categorization for skills without contexts
        category = 'Programming Languages'
      }
      
      categories[category].push(skillName)
    }
    
    // Sort skills within each category
    for (const category of Object.keys(categories)) {
      categories[category].sort()
    }
    
    console.log('🛠️ Skills categories generated:', Object.keys(categories))
    console.log('🛠️ Total skills:', Object.values(categories).flat().length)
    
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