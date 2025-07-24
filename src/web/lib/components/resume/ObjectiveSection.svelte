<script>
  export let objective = ''
  export let bulletDensity = 100
  export let profile = null

  $: hasObjective = objective && objective.trim().length > 0
  $: sectionPriority = profile?.resume_config?.section_priorities?.objective || 10
  $: requiredDensity = sectionPriority * 10
  $: shouldShow = bulletDensity >= requiredDensity

  // Debug logging
  $: {

  }
</script>

{#if hasObjective && shouldShow}
<div class="section-wrapper" data-section="objective">
  <div class="section-label">Objective</div>
  <div class="section-content">
    <p>{objective}</p>
  </div>
</div>
{/if} 