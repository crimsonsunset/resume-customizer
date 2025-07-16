<script>
  export let headline = ''

  $: hasHeadline = headline && headline.trim().length > 0
</script>

{#if hasHeadline}
<div class="section-wrapper" data-section="headline">
  <div class="section-label">Headline</div>
  <div class="section-content">
    <p>{headline}</p>
  </div>
</div>
{/if} 