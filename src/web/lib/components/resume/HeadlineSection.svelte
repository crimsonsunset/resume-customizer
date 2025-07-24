<script>
  export let headline = ''
  export let bulletDensity = 100
  export let profile = null

  $: hasHeadline = headline && headline.trim().length > 0
  $: sectionPriority = profile?.resume_config?.section_priorities?.headline || 10
  $: requiredDensity = sectionPriority * 10
  $: shouldShow = bulletDensity >= requiredDensity

  // Debug logging
  $: {

  }
</script>

{#if hasHeadline && shouldShow}
<div class="section-wrapper" data-section="headline">
  <div class="section-label">Headline</div>
  <div class="section-content">
    <p>{headline}</p>
  </div>
</div>
{/if} 