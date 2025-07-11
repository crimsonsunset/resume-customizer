<script>
  // Import global CSS with Tailwind and shadcn-svelte
  import '../app.css'
  
  // Future: Global state management, theme handling, etc.
  import { onMount } from 'svelte'
  
  onMount(() => {
    console.log('🎨 SvelteKit Layout Loaded')
  })
</script>

<slot />

<style>
  /* Additional global styles for web-ui scope */
  :global(.web-ui *) {
    box-sizing: border-box;
  }
  
  /* Ensure resume container is completely isolated */
  :global(.resume-container) {
    /* Resume styles remain completely untouched */
    isolation: isolate;
  }
</style> 