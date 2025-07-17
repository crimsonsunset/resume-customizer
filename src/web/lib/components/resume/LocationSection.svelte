<script>
  export let location = ''

  // Location is already displayed in the header, so don't render this section
  $: hasLocation = false
</script>

{#if hasLocation}
<div class="section-wrapper" data-section="location">
  <div class="section-label">Location</div>
  <div class="section-content">
    <p>{location}</p>
  </div>
</div>
{/if} 