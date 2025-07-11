<script>
  // Future: Global state management, theme handling, etc.
  import { onMount } from 'svelte'
  
  onMount(() => {
    console.log('🎨 SvelteKit Layout Loaded')
  })
</script>

<slot />

<style>
  /* Global styles for web-ui scope */
  :global(.web-ui *) {
    box-sizing: border-box;
  }
  
  /* Reset some defaults while preserving resume styles */
  :global(.web-ui body) {
    margin: 0;
    padding: 0;
    line-height: 1.6;
  }
  
  /* Ensure resume container is completely isolated */
  :global(.resume-container) {
    /* Resume styles remain completely untouched */
    isolation: isolate;
  }
</style> 