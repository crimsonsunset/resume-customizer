<script>
  export let location = ''

  $: hasLocation = location && location.trim().length > 0
</script>

{#if hasLocation}
<div class="section-wrapper" data-section="location">
  <div class="section-label">Location</div>
  <div class="section-content">
    <p>{location}</p>
  </div>
</div>
{/if} 