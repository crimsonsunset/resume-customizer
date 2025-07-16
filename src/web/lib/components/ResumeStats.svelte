<script>
  export let data = {}
  export let visibleSections = {}
  export let density = 100
  
  /**
   * Calculate resume statistics based on visible sections and data
   * @param {object} sections - Resume section data
   * @param {object} visible - Currently visible sections
   * @returns {object} Calculated statistics
   */
  const calculateStats = (sections, visible) => {
    const stats = {
      visibleSections: 0,
      totalItems: 0,
      experience: 0,
      projects: 0,
      skills: 0,
      education: 0,
      certifications: 0,
      recommendations: 0,
      estimatedWords: 0
    }
    
    if (!sections || !visible || typeof visible !== 'object') {
      return stats
    }
    
    // Count visible sections
    stats.visibleSections = Object.values(visible).filter(Boolean).length
    
    // Calculate items per section if visible
    if (visible.experience && sections.experience) {
      stats.experience = sections.experience.length || 0
      stats.totalItems += stats.experience
      stats.estimatedWords += stats.experience * 150 // ~150 words per experience
    }
    
    if (visible.projects && sections.projects) {
      stats.projects = sections.projects.length || 0
      stats.totalItems += stats.projects
      stats.estimatedWords += stats.projects * 100 // ~100 words per project
    }
    
    if (visible.skills && sections.skills?.skills) {
      stats.skills = sections.skills.skills.length || 0
      stats.estimatedWords += Math.ceil(stats.skills / 10) * 20 // Skills are concise
    }
    
    if (visible.education && sections.education?.education) {
      stats.education = sections.education.education.length || 0
      stats.totalItems += stats.education
      stats.estimatedWords += stats.education * 50 // ~50 words per education
    }
    
    if (visible.certifications && sections.certifications) {
      stats.certifications = sections.certifications.length || 0
      stats.totalItems += stats.certifications
      stats.estimatedWords += stats.certifications * 20 // ~20 words per cert
    }
    
    if (visible.recommendations && sections.recommendations) {
      const received = sections.recommendations.received?.length || 0
      stats.recommendations = received
      stats.totalItems += received
      stats.estimatedWords += received * 80 // ~80 words per recommendation
    }
    
    // Add other sections if visible
    const otherSections = ['volunteering', 'honors-awards', 'courses', 'activities', 'objective']
    otherSections.forEach(section => {
      if (visible[section] || visible[section.replace('-', '')]) {
        const sectionData = sections[section] || sections[section.replace('-', '')]
        if (sectionData) {
          if (Array.isArray(sectionData)) {
            stats.totalItems += sectionData.length
            stats.estimatedWords += sectionData.length * 60
          } else {
            stats.totalItems += 1
            stats.estimatedWords += 60
          }
        }
      }
    })
    
    return stats
  }
  

  
  $: stats = calculateStats(data?.sections, visibleSections)
  $: adjustedWords = Math.round(stats.estimatedWords * (density / 100))
  $: estimatedPages = Math.max(1, Math.ceil(adjustedWords / 400)) // ~400 words per page
</script>

<!-- Quick Stats -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <h3 class="card-title text-sm">📊 Resume Stats</h3>
    <div class="stats stats-vertical shadow-none text-xs">
      <div class="stat py-2">
        <div class="stat-title text-xs">Visible Sections</div>
        <div class="stat-value text-lg">{stats.visibleSections}</div>
        <div class="stat-desc text-xs">of {Object.keys(visibleSections || {}).length} total</div>
      </div>
      
      {#if stats.experience > 0}
      <div class="stat py-2">
        <div class="stat-title text-xs">Experience Items</div>
        <div class="stat-value text-lg">{stats.experience}</div>
      </div>
      {/if}
      
      {#if stats.projects > 0}
      <div class="stat py-2">
        <div class="stat-title text-xs">Projects</div>
        <div class="stat-value text-lg">{stats.projects}</div>
      </div>
      {/if}
      
      {#if stats.skills > 0}
      <div class="stat py-2">
        <div class="stat-title text-xs">Skills</div>
        <div class="stat-value text-lg">{stats.skills}</div>
      </div>
      {/if}
      
      <div class="stat py-2">
        <div class="stat-title text-xs">Est. Length</div>
        <div class="stat-value text-lg">{estimatedPages} page{estimatedPages === 1 ? '' : 's'}</div>
        <div class="stat-desc text-xs">~{adjustedWords} words @ {density}%</div>
      </div>
    </div>
  </div>
</div> 