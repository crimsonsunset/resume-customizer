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
    
    // Use pre-calculated filtered stats from server if available
    if (data.filteredStats) {
      const isOnePagePreset = data.preset === 'one-page'
      
      if (visible.experience) {
        stats.experience = data.filteredStats.experience
        stats.totalItems += stats.experience
        // One-page preset: much more condensed (50 words vs 150)
        const wordsPerExp = isOnePagePreset ? 50 : 150
        stats.estimatedWords += stats.experience * wordsPerExp
      }
      
      if (visible.projects) {
        stats.projects = data.filteredStats.projects
        stats.totalItems += stats.projects
        // One-page preset: much more condensed (40 words vs 100)
        const wordsPerProject = isOnePagePreset ? 40 : 100
        stats.estimatedWords += stats.projects * wordsPerProject
      }
      
      if (visible.skills) {
        stats.skills = data.filteredStats.skills
        // One-page preset: more compact skills formatting
        const skillsWordsMultiplier = isOnePagePreset ? 1 : 2
        stats.estimatedWords += Math.ceil(stats.skills / 10) * 10 * skillsWordsMultiplier
      }
      
      // Add fixed overhead for header, education, etc.
      if (isOnePagePreset) {
        stats.estimatedWords += 150 // Compact header + education
      } else {
        stats.estimatedWords += 300 // Full header + education + other sections
      }
    } else {
      // Fallback to original filtering logic
      if (visible.experience && sections.experience) {
        const filters = sections.experience.preset_filters || {}
        let experienceCount = 0
        
        if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
          experienceCount = filters.selected_indices.length
        } else {
          experienceCount = Array.isArray(sections.experience) ? sections.experience.length : 0
        }
        
        stats.experience = experienceCount
        stats.totalItems += stats.experience
        stats.estimatedWords += stats.experience * 150
      }
      
      if (visible.projects && sections.projects) {
        const filters = sections.projects.preset_filters || {}
        let projectsCount = 0
        
        if (filters.selected_indices && Array.isArray(filters.selected_indices)) {
          projectsCount = filters.selected_indices.length
        } else {
          projectsCount = Array.isArray(sections.projects) ? sections.projects.length : 0
        }
        
        stats.projects = projectsCount
        stats.totalItems += stats.projects
        stats.estimatedWords += stats.projects * 100
      }
      
      if (visible.skills && sections.skills) {
        let skillsCount = 0
        
        if (sections.skills.preset_skills) {
          const presetSkills = sections.skills.preset_skills
          skillsCount = Object.values(presetSkills).reduce((total, categorySkills) => {
            return total + (Array.isArray(categorySkills) ? categorySkills.length : 0)
          }, 0)
        } else if (sections.skills.skills) {
          skillsCount = sections.skills.skills.length
        }
        
        stats.skills = skillsCount
        stats.estimatedWords += Math.ceil(stats.skills / 10) * 20
      }
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
  // Adjust page calculation based on preset and density
  $: wordsPerPage = (() => {
    const isOnePagePreset = data?.preset === 'one-page'
    if (isOnePagePreset) {
      // One-page preset: designed to fit on 1 page, very compact
      return 1400 // Much higher density
    } else if (density < 50) {
      return 600
    } else if (density < 80) {
      return 500  
    } else {
      return 400
    }
  })()
    $: estimatedPages = Math.max(1, Math.ceil(adjustedWords / wordsPerPage))
  

</script>

<!-- Quick Stats -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <h3 class="card-title text-sm">📊 Resume Stats</h3>
    <div class="stats stats-vertical shadow-none text-xs">
      <div class="stat py-2">
        <div class="stat-title text-xs">Visible Sections</div>
        <div class="stat-value text-lg">{stats.visibleSections}</div>
        <div class="stat-desc text-xs">of {data.availableSections?.length || Object.keys(visibleSections || {}).length} total</div>
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