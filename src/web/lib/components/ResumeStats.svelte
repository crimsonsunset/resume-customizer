<script>
  import { onMount, tick } from 'svelte'
  import { browser } from '$app/environment'
  
  export let data = {}
  export let visibleSections = {}
  export let density = 100
  
  let estimatedPages = 1
  let isLoading = true
  let isMounted = false

  /**
   * Measure actual DOM height and convert to pages
   */
  async function measureResumeHeight() {
    // Only run in browser after component is mounted
    if (!browser || !isMounted) return
    
    // Wait for DOM to update
    await tick()
    
    // Find the resume content element
    const resumeContent = document.querySelector('.resume-with-visibility-controls')
    if (!resumeContent) {
      console.warn('📏 Resume content element not found')
      return
    }

    // Get the actual rendered height
    const rect = resumeContent.getBoundingClientRect()
    const heightInPixels = rect.height
    
    // Convert to pages - adjust based on preset and real-world measurements
    let pageHeight
    if (data?.preset === 'one-page') {
      // One-page presets are designed to fit exactly, so be generous
      pageHeight = heightInPixels * 1.05 // Always shows 1 page with 5% buffer
    } else {
      // Standard calculation: 11" at 96dpi = 1056px, minus ~200px for margins/padding
      pageHeight = 850 // More realistic based on actual resume layouts
    }
    const calculatedPages = Math.max(1, Math.ceil(heightInPixels / pageHeight))
    
        estimatedPages = calculatedPages
    isLoading = false
  }

  onMount(() => {
    isMounted = true
    // Initial measurement
    measureResumeHeight()
  })

  // Re-measure when data changes (preset switches, density changes, etc.)
  $: if (browser && isMounted && (data?.resumeContent || visibleSections || density)) {
    isLoading = true
    // Small delay to let DOM finish rendering
    setTimeout(measureResumeHeight, 100)
  }

  // Get all section stats dynamically from server data
  $: filteredStats = data?.filteredStats || {}
  $: totalCounts = data?.totalCounts || {}
  $: totalSections = Object.values(visibleSections || {}).filter(Boolean).length
  
  // Create array of sections that have actual content to display
  $: sectionsWithContent = Object.entries(totalCounts)
    .filter(([_, count]) => count > 0)
    .map(([section, totalCount]) => ({
      section,
      name: getSectionDisplayName(section),
      filtered: filteredStats[section] || 0,
      total: totalCount,
      hasFiltering: section === 'skills' ? 
        // For skills: only show "of X total" if preset skills are smaller than raw skills (actual filtering)
        (filteredStats[section] || 0) < totalCount :
        // For other sections: show "of X total" when counts differ (normal filtering)
        (filteredStats[section] || 0) !== totalCount
    }))
  
  /**
   * Convert section key to display name
   */
  function getSectionDisplayName(section) {
    const displayNames = {
      'experience': 'Experience Items',
      'projects': 'Projects',
      'skills': 'Skills',
      'education': 'Education',
      'certifications': 'Certifications',
      'recommendations': 'Recommendations',
      'activities': 'Activities',
      'volunteering': 'Volunteering',
      'honors-awards': 'Honors & Awards'
    }
    return displayNames[section] || section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')
  }
</script>

<style>
  .stat-item {
    @apply p-3 bg-base-100 rounded-lg border border-base-200 hover:bg-base-200/50 transition-colors text-center;
  }
</style>

<!-- Quick Stats -->
<div class="card bg-base-100 shadow-sm border border-base-300">
  <div class="card-body p-4">
    <h3 class="card-title text-sm">📊 Resume Stats</h3>
    <div class="grid grid-cols-2 gap-4 text-xs">
      <div class="stat-item text-center">
        <div class="text-xs opacity-70">Visible Sections</div>
        <div class="text-lg font-bold">{totalSections}</div>
        <div class="text-xs opacity-60">of {data.totalAvailableSections?.length || data.availableSections?.length || totalSections} total</div>
      </div>
      
      <!-- Dynamic sections based on actual data -->
      {#each sectionsWithContent as {section, name, filtered, total, hasFiltering}}
        <div class="stat-item text-center">
          <div class="text-xs opacity-70">{name}</div>
          <div class="text-lg font-bold">{filtered}</div>
          {#if hasFiltering}
            <div class="text-xs opacity-60">of {total} total</div>
          {/if}
        </div>
      {/each}
      
      <div class="stat-item text-center">
        <div class="text-xs opacity-70">Est. Length</div>
        <div class="text-lg font-bold">
          {#if isLoading}
            <span class="loading loading-dots loading-sm"></span>
          {:else}
            {estimatedPages} page{estimatedPages === 1 ? '' : 's'}
          {/if}
        </div>
        <div class="text-xs opacity-60">
          {#if !isLoading}
            Measured from actual content
          {:else}
            Calculating...
          {/if}
        </div>
      </div>
    </div>
  </div>
</div> 