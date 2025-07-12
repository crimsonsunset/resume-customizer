<script>
  export let skillsData = {}
  export let config = {}

  /**
   * Gets skills to display based on preset or raw data
   * Priority: preset_skills > raw skills data
   */
  function getSkillsToDisplay(skillsData) {
    // If preset skills exist, use those
    if (skillsData.preset_skills) {
      return skillsData.preset_skills
    }
    
    // Fall back to generating from raw skills array
    if (skillsData.skills && Array.isArray(skillsData.skills)) {
      return generateSkillsFromRawData(skillsData.skills)
    }
    
    return {}
  }

  /**
   * Organizes raw skills array into categories based on endorsements and type
   */
  function generateSkillsFromRawData(skillsArray) {
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
    
    topSkills.forEach(skill => {
      const name = skill.name
      
      // Programming languages
      if (['JavaScript', 'Python', 'Java', 'C++', 'PHP', 'TypeScript'].includes(name)) {
        categories['Programming Languages'].push(name)
      }
      // Frameworks & Libraries
      else if (['React.js', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Redux.js', 'Next.js', 'jQuery'].includes(name)) {
        categories['Frameworks & Libraries'].push(name)
      }
      // Leadership & Management
      else if (name.includes('Management') || name.includes('Leadership') || ['Mentoring', 'Teaching'].includes(name)) {
        categories['Leadership & Management'].push(name)
      }
      // Tools & Platforms
      else if (['Git', 'AWS', 'MongoDB', 'Linux', 'Docker', 'Windows', 'Mac OS'].includes(name)) {
        categories['Tools & Platforms'].push(name)
      }
      // Everything else
      else {
        categories['Other Technologies'].push(name)
      }
    })
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key]
      }
    })
    
    return categories
  }

  /**
   * Formats skills category display
   * Converts array of skills to comma-separated string with bold category label
   */
  function formatSkillsCategory(categoryName, skillsArray) {
    if (!skillsArray || skillsArray.length === 0) return ''
    
    return skillsArray.join(', ')
  }

  // Reactive skills data
  $: skillsToDisplay = getSkillsToDisplay(skillsData)
  $: hasSkills = Object.keys(skillsToDisplay).length > 0
</script>

{#if hasSkills}
<div class="section-wrapper">
  <div class="section-label">Special Skills</div>
  <div class="section-content">
    {#each Object.entries(skillsToDisplay) as [categoryName, skillsArray]}
      {#if skillsArray && skillsArray.length > 0}
        <p>
          <strong>{categoryName}:</strong> 
          {formatSkillsCategory(categoryName, skillsArray)}
        </p>
      {/if}
    {/each}
  </div>
</div>
{/if} 