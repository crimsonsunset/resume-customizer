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
    
    // TODO: Fall back to generating from raw skills array
    // For now, return empty object
    return {}
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