<script>
  export let projects = []
  export let config = {}

  /**
   * Groups projects by work vs personal categories
   */
  function groupProjectsByCategory(projects) {
    const workProjects = []
    const personalProjects = []
    
    projects.forEach(project => {
      if (project.company === 'Personal') {
        personalProjects.push(project)
      } else {
        workProjects.push(project)
      }
    })
    
    return { workProjects, personalProjects }
  }

  /**
   * Applies filtering based on config (for presets)
   */
  function getFilteredProjects(projects, config) {
    let filtered = [...projects]
    
    // Apply project limit from config or preset filters
    const filters = config || projects.preset_filters || {}
    const maxEntries = filters.projects_limit || filters.max_entries
    
    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries)
    }
    
    return filtered
  }

  // Group and filter projects
  $: filteredProjects = getFilteredProjects(projects, config)
  $: groupedProjects = groupProjectsByCategory(filteredProjects)
  $: workProjects = groupedProjects.workProjects
  $: personalProjects = groupedProjects.personalProjects
</script>

<!-- Work Projects Section -->
{#if workProjects.length > 0}
<div class="section-wrapper">
  <div class="section-label">Work Projects</div>
  <div class="section-content">
    {#each workProjects as project}
      <div class="company-header">
        <h3>{project.name}</h3>
      </div>
      
      {#if project.bulletPoints && project.bulletPoints.length > 0}
        <ul>
          {#each project.bulletPoints as bullet}
            <li>{bullet}</li>
          {/each}
        </ul>
      {/if}
    {/each}
  </div>
</div>
{/if}

<!-- Supplemental Projects Section -->
{#if personalProjects.length > 0}
<div class="section-wrapper">
  <div class="section-label">Supplemental Projects</div>
  <div class="section-content">
    {#each personalProjects as project}
      <div class="company-header">
        <h3>{project.name}</h3>
      </div>
      
      {#if project.bulletPoints && project.bulletPoints.length > 0}
        <ul>
          {#each project.bulletPoints as bullet}
            <li>{bullet}</li>
          {/each}
        </ul>
      {/if}
    {/each}
  </div>
</div>
{/if} 