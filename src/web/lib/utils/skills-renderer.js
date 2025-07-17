import { has, sortBy } from 'lodash-es'

// Context-to-Category mappings organized by priority (higher priority = lower number)
const CATEGORY_CONTEXTS = {
  'Leadership': ['leadership', 'management', 'business', 'product'], // Priority 1
  'Programming Languages': ['javascript', 'css'], // Priority 2 - Specific language contexts only
  'Operating Systems': [], // Priority 2.5 - Hardcoded category, managed separately
  'Tools & Platforms': ['devops', 'cms', 'analytics', 'logging', 'monitoring', 'configuration', 'productivity', 'system'], // Priority 3
  'Frameworks & Libraries': ['frontend', 'backend', 'mobile', 'nodejs', 'testing'], // Priority 4 - Added testing
  'Concepts & Methodologies': ['development', 'api', 'data', 'design', 'ai', 'crypto', 'performance', 'security', 'technical', 'marketing', 'education'] // Priority 5
}

// Priority order for categories (lower number = higher priority)
const CATEGORY_PRIORITY = {
  'Leadership': 1,
  'Programming Languages': 2,
  'Operating Systems': 2.5,
  'Tools & Platforms': 3,
  'Frameworks & Libraries': 4,
  'Concepts & Methodologies': 5
}

// Operating System keywords to filter out from other categories
const OS_KEYWORDS = ['Windows', 'Mac', 'macOS', 'iOS', 'Android', 'Linux', 'Unix', 'Ubuntu', 'OS', 'Operating System']

// Programming language name patterns for fallback categorization
const PROGRAMMING_LANGUAGES = new Set(['C++', 'CSS/Sass', 'HTML', 'Java', 'JavaScript', 'JSON', 'JSX', 'PHP', 'Python', 'SQL', 'TypeScript', 'XML', 'YAML'])

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
  render(skillsData, _config = {}, bulletDensity = 100) {
    const skillsToDisplay = this.getSkillsToDisplay(skillsData, bulletDensity)
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
  getSkillsToDisplay(skillsData, bulletDensity = 100) {
    // If preset skills exist, use those
    if (skillsData.preset_skills) {
      return this.applyDensityFiltering(skillsData.preset_skills, bulletDensity)
    }
    
    // Use skills inventory if available
    if (skillsData.skillsInventory) {
      return this.generateSkillsFromInventory(skillsData.skillsInventory, bulletDensity)
    }
    
    // Fall back to generating from raw skills array
    if (skillsData.skills && Array.isArray(skillsData.skills)) {
      return this.applyDensityFiltering(this.generateSkillsFromRawData(skillsData.skills), bulletDensity)
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
   * Gets skill data from inventory by skill name
   */
  getSkillData(skillsInventory, skillName) {
    // Find skill by matching name
    for (const [skillKey, skillData] of Object.entries(skillsInventory.skills)) {
      if (skillData.name === skillName) {
        return {
          priority: skillData.priority || 5, // Default priority if missing
          marketDemand: this.convertMarketDemand(skillData.marketDemand) || 5 // Convert text to number
        }
      }
    }
    
    // Fallback for skills not found (like hardcoded Operating Systems)
    return { priority: 5, marketDemand: 5 }
  }

  /**
   * Converts marketDemand from text to numeric value
   */
  convertMarketDemand(marketDemand) {
    // If already a number, return as-is
    if (typeof marketDemand === 'number') {
      return marketDemand
    }
    
    // Convert text values to numbers
    const textToNumber = {
      'high': 10,
      'medium': 6,
      'low': 2
    }
    
    return textToNumber[marketDemand] || 5 // Default if unrecognized
  }

  /**
   * Gets the appropriate category for a skill based on its name and contexts
   */
  getSkillCategory(contexts, skillName = '') {
    // First check if it's a programming language by name
    if (PROGRAMMING_LANGUAGES.has(skillName)) {
      return 'Programming Languages'
    }
    
    if (contexts.length === 0) {
      return 'Concepts & Methodologies'
    }
    
    // Find which categories these contexts belong to
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
    
    if (categoriesForContexts.length === 0) {
      return 'Concepts & Methodologies'
    }
    
    // Sort by priority and pick the highest priority category
    return categoriesForContexts.sort((a, b) => 
      (CATEGORY_PRIORITY[a] || 999) - (CATEGORY_PRIORITY[b] || 999)
    )[0]
  }

  /**
   * Generates categorized skills from skills-inventory.json
   */
  generateSkillsFromInventory(skillsInventory, bulletDensity = 100) {
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

    // Calculate priority threshold - inverted so higher density shows more skills
    // 100% density → threshold 1 (show all), 10% density → threshold 10 (show only highest)
    const priorityThreshold = Math.ceil((110 - bulletDensity) / 10)
    console.log(`🛠️ Skills Debug: Density ${bulletDensity}%, Priority threshold: ${priorityThreshold}`)

         // Track filtering stats
     const totalSkills = Object.keys(skillsInventory.skills).length
     let filteredSkills = 0

    // Process each skill from inventory
    for (const [skillKey, skillData] of Object.entries(skillsInventory.skills)) {
      // Skip skills below priority threshold
      if (skillData.priority && skillData.priority < priorityThreshold) {
        continue
      }
      
      filteredSkills++
      const skillName = skillData.name
      const contexts = skillData.contexts || []
      
      // Find the category for this skill based on name and context priority
      const category = this.getSkillCategory(contexts, skillName)
      
      if (category && categories[category]) {
        categories[category].push(skillName)
      } else {
        // Default fallback
        categories['Concepts & Methodologies'].push(skillName)
      }
    }

    console.log(`🛠️ Skills Debug: After priority filtering: ${filteredSkills} skills (was ${totalSkills})`)

    // Remove OS-related skills from other categories
    for (const [categoryName, skillsArray] of Object.entries(categories)) {
      if (categoryName !== 'Operating Systems') {
        categories[categoryName] = skillsArray.filter(skill => 
          !OS_KEYWORDS.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
        )
      }
    }

    // Sort skills within each category by priority + market demand
    for (const category of Object.keys(categories)) {
      categories[category].sort((skillA, skillB) => {
        const skillDataA = this.getSkillData(skillsInventory, skillA)
        const skillDataB = this.getSkillData(skillsInventory, skillB)
        
        // Calculate weighted sort scores (priority 60%, market demand 40%)
        const scoreA = (skillDataA.priority * 0.6) + (skillDataA.marketDemand * 0.4)
        const scoreB = (skillDataB.priority * 0.6) + (skillDataB.marketDemand * 0.4)
        
        // Sort descending (highest score first)
        return scoreB - scoreA
      })
      
      // Debug: Show top 3 skills in each category with their scores
      const topSkills = categories[category].slice(0, 3).map(skill => {
        const data = this.getSkillData(skillsInventory, skill)
        const score = (data.priority * 0.6) + (data.marketDemand * 0.4)
        return `${skill}(${score.toFixed(1)})`
      })
      console.log(`🔢 ${category} top skills:`, topSkills.join(', '))
    }
    
    // Add hardcoded Operating Systems category and filter OS keywords from other categories
    categories['Operating Systems'] = ['Proficient in Windows, Mac, or Linux, Android and iOS']
    
    console.log('🛠️ Skills categories generated:', Object.keys(categories))
    console.log('🛠️ Total skills after categorization:', Object.values(categories).flat().length)
    
    return this.applyDensityFiltering(categories, bulletDensity)
  }

  /**
   * Applies density filtering to skill categories
   */
  applyDensityFiltering(categories, bulletDensity = 100) {
    const filteredCategories = { ...categories }
    
    // Show Operating Systems category only when density >= 80% (senior/focused resume)
    if (bulletDensity < 80 && filteredCategories['Operating Systems']) {
      delete filteredCategories['Operating Systems']
      console.log('🛠️ Skills Debug: Operating Systems filtered out (density < 80%)')
    } else if (bulletDensity >= 80 && filteredCategories['Operating Systems']) {
      console.log('🛠️ Skills Debug: Operating Systems included (density >= 80%)')
    }
    
    return filteredCategories
  }

  /**
   * Renders all skill categories
   */
  renderCategories(skillsToDisplay) {
    const categoryHTML = []
    
    // Define rendering order with Operating Systems last
    const renderOrder = [
      'Leadership',
      'Programming Languages', 
      'Frameworks & Libraries',
      'Tools & Platforms',
      'Concepts & Methodologies',
      'Operating Systems' // Always last
    ]
    
    // Render categories in specified order
    for (const categoryName of renderOrder) {
      const skillsArray = skillsToDisplay[categoryName]
      if (skillsArray && skillsArray.length > 0) {
        const skillsList = this.formatSkillsCategory(categoryName, skillsArray)
        categoryHTML.push(`<p><strong>${categoryName}:</strong> ${skillsList}</p>`)
      }
    }
    
    // Render any remaining categories not in the order list (fallback)
    for (const [categoryName, skillsArray] of Object.entries(skillsToDisplay)) {
      if (!renderOrder.includes(categoryName) && skillsArray && skillsArray.length > 0) {
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