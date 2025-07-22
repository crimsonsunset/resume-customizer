<script>
  export let summary = ''
  export let bulletDensity = 100
  export let profile = null

  $: hasSummary = summary && summary.trim().length > 0
  $: formattedSummary = summary ? summary.split('\n\n').filter(p => p.trim()) : []
  $: sectionPriority = profile?.resume_config?.section_priorities?.summary || 10
  $: requiredDensity = sectionPriority * 10
  $: shouldShow = bulletDensity >= requiredDensity

  // Debug logging
  $: {

  }
</script>

{#if hasSummary && shouldShow}
<div class="section-wrapper" data-section="summary">
  <div class="section-label">Summary</div>
  <div class="section-content">
    {#each formattedSummary as paragraph}
      <p>{paragraph.trim()}</p>
    {/each}
  </div>
</div>
{/if} 