<script>
  export let experiences = []
  export let config = {}
  export let bulletDensity = 100

  /**
   * Extracts main company name from full company string
   * Handles formats like "FORA · Freelance" or "iCIMS, Inc."
   */
  function getMainCompanyName(companyString) {
    return companyString.split('·')[0].split(',')[0].trim()
  }

  /**
   * Determines if a company header should be shown for this experience
   * Shows header if it's the first entry or different company than previous
   */
  function shouldShowCompanyHeader(experience, index, experienceList) {
    if (index === 0) return true
    
    const currentCompany = getMainCompanyName(experience.company)
    const previousCompany = getMainCompanyName(experienceList[index - 1].company)
    
    return currentCompany !== previousCompany
  }

  /**
   * Filters bullet points based on priority and density settings
   */
  function getVisibleBullets(bulletPoints, bulletPriorities, density) {
    if (!bulletPriorities || density === 100) {
      return bulletPoints
    }
    
    const maxPriority = Math.max(...bulletPriorities)
    const minThreshold = maxPriority * (density / 100)
    
    return bulletPoints.filter((bullet, index) => 
      (bulletPriorities[index] || 1) >= minThreshold
    )
  }

  /**
   * Applies version-specific filtering to experiences
   */
  function getFilteredExperiences(experiences, config) {
    let filtered = [...experiences]
    
    // Apply management role filtering
    if (config.experience_filter === 'management_roles_only') {
      filtered = filtered.filter(exp => {
        const title = exp.title.toLowerCase()
        return title.includes('manager') || 
               title.includes('director') ||
               title.includes('lead') ||
               title.includes('principal')
      })
    }
    
    // Apply experience limit
    if (config.experience_limit) {
      filtered = filtered.slice(0, config.experience_limit)
    }
    
    return filtered
  }

  // Reactive filtered experiences
  $: filteredExperiences = getFilteredExperiences(experiences, config)
</script>

<div class="section-wrapper">
  <div class="section-label">Experience</div>
  <div class="section-content">
    {#each filteredExperiences as experience, index}
      
      <!-- Company Header (conditional) -->
      {#if shouldShowCompanyHeader(experience, index, filteredExperiences)}
        <div class="company-header">
          <h3>{getMainCompanyName(experience.company)}</h3>
        </div>
      {/if}

      <!-- Job Title Header -->
      <div class="job-title-header">
        <h4>{experience.title}</h4>
        <p class="date-range">{experience.duration}</p>
      </div>

      <!-- Bullet Points -->
      <ul>
        {#each getVisibleBullets(experience.bulletPoints, experience.bullet_priorities, bulletDensity) as bullet}
          <li>{bullet}</li>
        {/each}
      </ul>

    {/each}
  </div>
</div> 