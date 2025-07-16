<script>
  export let summary = ''

  $: hasSummary = summary && summary.trim().length > 0
  $: formattedSummary = summary ? summary.split('\n\n').filter(p => p.trim()) : []
</script>

{#if hasSummary}
<div class="section-wrapper" data-section="summary">
  <div class="section-label">Summary</div>
  <div class="section-content">
    {#each formattedSummary as paragraph}
      <p>{paragraph.trim()}</p>
    {/each}
  </div>
</div>
{/if} 